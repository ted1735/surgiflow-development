# SurgiFlow — IndexedDB Microsaves & Leaf-Patch Sync (SPFx)

**Pattern:** Instant local save on every keystroke, one-field ("leaf") sync to the SharePoint List, ETag-guarded so nurses never overwrite each other.

```text
Field change → React state → IndexedDB → debounced leaf-patch → SPL (IF-MATCH ETag)
```

---

## 1. Design Summary

| Concern | Decision |
|---|---|
| **Microsave** | Every keystroke writes to IndexedDB instantly (offline + refresh proof). |
| **Patch** | Only the **one changed field** syncs to SharePoint (not the whole item). |
| **Lock / concurrency** | Optimistic concurrency via **ETag + `IF-MATCH`**. On `412`, refetch and reconcile. |
| **Storage** | IndexedDB (not localStorage) — async, transactional, hundreds of MB+. |
| **Debounce** | 800 ms per field, auto-flush on `online` event. |
| **PHI** | IndexedDB is unencrypted → purge on discharge/sign-out. |

### Three IndexedDB stores
- **`drafts`** — full UI state per patient (instant reload, works offline)
- **`outbox`** — queued leaf-field patches waiting to sync
- **`etags`** — last-known SharePoint item version per patient

### The "lock" mechanic (ETag optimistic concurrency)
- Sync uses `SPHttpClient` **MERGE** with header **`IF-MATCH: <etag>`**.
- Conflict → SharePoint returns **412 Precondition Failed** → refetch ETag → **Keep mine / Use latest**.
- ⚠️ ETag is **item-level, not field-level**: two nurses editing *different* fields on the *same* patient still bump the same version. The 412 retry logic is what protects them.

---

## 2. localStorage vs IndexedDB

| | localStorage | IndexedDB |
|---|---|---|
| Limit | ~5 MB | Hundreds of MB+ |
| Objects | Strings only | Structured |
| Async | ❌ blocks UI | ✅ non-blocking |
| Transactions | ❌ | ✅ |

For a clinical outbox that survives refreshes and dropped Wi-Fi, **IndexedDB is the only correct choice.**

---

## 3. Module: `db.ts` — IndexedDB wrapper + schema

```typescript
// db.ts — zero-dependency IndexedDB wrapper for SurgiFlow microsaves
const DB_NAME = "SurgiFlowLocal";
const DB_VERSION = 1;

export const STORES = {
  drafts: "drafts",   // key: patientKey  → full UI state
  outbox: "outbox",   // key: patientKey|field → queued leaf patch
  etags: "etags",     // key: patientKey  → last-known SP ETag
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.drafts)) {
        db.createObjectStore(STORES.drafts, { keyPath: "patientKey" });
      }
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        const s = db.createObjectStore(STORES.outbox, { keyPath: "id" });
        s.createIndex("byPatient", "patientKey", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.etags)) {
        db.createObjectStore(STORES.etags, { keyPath: "patientKey" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPut(store: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDelete(store: string, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllByIndex<T>(
  store: string, indexName: string, query: IDBValidKey
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).index(indexName).getAll(query);
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}
```

---

## 4. Module: `drafts.ts` — draft + ETag helpers

```typescript
// drafts.ts — full-record draft state + ETag cache
import { STORES, idbGet, idbPut, idbDelete } from "./db";

export interface Draft {
  patientKey: string;               // e.g. MRN|CSN or Room
  spItemId?: number;                // SharePoint list item Id
  fields: Record<string, unknown>;  // current UI state
  updatedAt: number;
}

export async function getDraft(patientKey: string): Promise<Draft | undefined> {
  return idbGet<Draft>(STORES.drafts, patientKey);
}

export async function saveDraftField(
  patientKey: string, field: string, value: unknown, spItemId?: number
): Promise<void> {
  const existing = (await getDraft(patientKey)) ?? {
    patientKey, fields: {}, updatedAt: 0,
  };
  existing.fields[field] = value;
  existing.updatedAt = Date.now();
  if (spItemId != null) existing.spItemId = spItemId;
  await idbPut(STORES.drafts, existing);
}

export async function clearDraft(patientKey: string): Promise<void> {
  await idbDelete(STORES.drafts, patientKey);
}

// ---- ETag cache ----
interface EtagRow { patientKey: string; etag: string; }

export async function getEtag(patientKey: string): Promise<string | undefined> {
  const row = await idbGet<EtagRow>(STORES.etags, patientKey);
  return row?.etag;
}

export async function setEtag(patientKey: string, etag: string): Promise<void> {
  await idbPut(STORES.etags, { patientKey, etag });
}
```

---

## 5. Module: `outbox.ts` — leaf-patch queue (collapses duplicates)

```typescript
// outbox.ts — queue of single-field patches; duplicates collapse (no stacking)
import { STORES, idbPut, idbDelete, idbGetAllByIndex } from "./db";

export interface OutboxPatch {
  id: string;          // `${patientKey}|${field}`  → collapses duplicates
  patientKey: string;
  spItemId?: number;
  field: string;
  value: unknown;
  queuedAt: number;
  attempts: number;
}

// Same patient+field overwrites the pending patch instead of stacking a new one.
export async function enqueuePatch(
  patientKey: string, field: string, value: unknown, spItemId?: number
): Promise<void> {
  const patch: OutboxPatch = {
    id: `${patientKey}|${field}`,
    patientKey, spItemId, field, value,
    queuedAt: Date.now(), attempts: 0,
  };
  await idbPut(STORES.outbox, patch);
}

export async function getPatchesForPatient(patientKey: string): Promise<OutboxPatch[]> {
  return idbGetAllByIndex<OutboxPatch>(STORES.outbox, "byPatient", patientKey);
}

export async function removePatch(id: string): Promise<void> {
  await idbDelete(STORES.outbox, id);
}

export async function bumpAttempts(patch: OutboxPatch): Promise<void> {
  patch.attempts += 1;
  await idbPut(STORES.outbox, patch);
}
```

---

## 6. Module: `sync.ts` — SPFx MERGE with `IF-MATCH` + 412 handling

```typescript
// sync.ts — pushes leaf patches to the SharePoint List with ETag guarding
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from "@microsoft/sp-http";
import { OutboxPatch, getPatchesForPatient, removePatch, bumpAttempts } from "./outbox";
import { getEtag, setEtag } from "./drafts";

const MAX_ATTEMPTS = 5;

export type ConflictResolution = "keepMine" | "useLatest";

export interface SyncDeps {
  spHttpClient: SPHttpClient;
  webAbsoluteUrl: string;
  listTitle: string;                       // e.g. "SurgiFlow Master"
  onConflict?: (patch: OutboxPatch) => Promise<ConflictResolution>;
}

function itemUrl(deps: SyncDeps, itemId: number): string {
  return `${deps.webAbsoluteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(
    deps.listTitle
  )}')/items(${itemId})`;
}

// Refetch a single item's current ETag from SharePoint.
async function fetchEtag(deps: SyncDeps, itemId: number): Promise<string> {
  const res: SPHttpClientResponse = await deps.spHttpClient.get(
    itemUrl(deps, itemId),
    SPHttpClient.configurations.v1,
    { headers: { Accept: "application/json;odata=nometadata" } }
  );
  const etag = res.headers.get("ETag");
  return etag ?? "*";
}

async function mergeField(
  deps: SyncDeps, patch: OutboxPatch, etag: string
): Promise<SPHttpClientResponse> {
  const body: Record<string, unknown> = {};
  body[patch.field] = patch.value;

  const opts: ISPHttpClientOptions = {
    headers: {
      "Content-Type": "application/json;odata=nometadata",
      "Accept": "application/json;odata=nometadata",
      "IF-MATCH": etag,           // the "lock"
      "X-HTTP-Method": "MERGE",   // patch, not overwrite
    },
    body: JSON.stringify(body),
  };
  return deps.spHttpClient.post(
    itemUrl(deps, patch.spItemId as number),
    SPHttpClient.configurations.v1,
    opts
  );
}

// Flush all queued patches for one patient.
export async function flushPatient(deps: SyncDeps, patientKey: string): Promise<void> {
  const patches = await getPatchesForPatient(patientKey);

  for (const patch of patches) {
    if (patch.spItemId == null) continue;         // not yet created in SP
    if (patch.attempts >= MAX_ATTEMPTS) continue; // give up; leave for manual review

    let etag = (await getEtag(patientKey)) ?? "*";
    let res = await mergeField(deps, patch, etag);

    if (res.status === 412) {
      // Conflict: someone else bumped the item version.
      const latest = await fetchEtag(deps, patch.spItemId);
      const choice = deps.onConflict ? await deps.onConflict(patch) : "useLatest";

      if (choice === "keepMine") {
        res = await mergeField(deps, patch, latest);  // re-apply my value on latest version
      } else {
        // "useLatest": drop my pending patch, adopt server state.
        await setEtag(patientKey, latest);
        await removePatch(patch.id);
        continue;
      }
    }

    if (res.ok) {
      const newEtag = res.headers.get("ETag");
      if (newEtag) await setEtag(patientKey, newEtag);
      await removePatch(patch.id);
    } else {
      await bumpAttempts(patch);  // network/500 → retry later
    }
  }
}
```

---

## 7. Module: `useFieldSave.ts` — React hook (debounce + auto-flush)

```typescript
// useFieldSave.ts — instant local save, debounced SP sync, auto-flush when back online
import { useCallback, useEffect, useRef } from "react";
import { saveDraftField } from "./drafts";
import { enqueuePatch } from "./outbox";
import { flushPatient, SyncDeps } from "./sync";

const DEBOUNCE_MS = 800;

export function useFieldSave(patientKey: string, spItemId: number | undefined, deps: SyncDeps) {
  const timers = useRef<Record<string, number>>({});

  const saveField = useCallback(
    async (field: string, value: unknown) => {
      // 1) instant local microsave — never lost on refresh
      await saveDraftField(patientKey, field, value, spItemId);

      // 2) debounce the SP leaf-patch per field
      if (timers.current[field]) window.clearTimeout(timers.current[field]);
      timers.current[field] = window.setTimeout(async () => {
        await enqueuePatch(patientKey, field, value, spItemId);
        await flushPatient(deps, patientKey);
      }, DEBOUNCE_MS);
    },
    [patientKey, spItemId, deps]
  );

  // 3) auto-flush any queued patches when connectivity returns
  useEffect(() => {
    const onOnline = () => { void flushPatient(deps, patientKey); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [deps, patientKey]);

  return { saveField };
}
```

**Usage in a field control:**
```typescript
const { saveField } = useFieldSave(patientKey, spItemId, syncDeps);
// <input onChange={(e) => saveField("POPain", e.target.value)} />
```

---

## 8. Load path (rehydrate on open)

```text
Open patient →
  read draft from IndexedDB (instant paint) →
  fetch item + ETag from SP →
  if SP newer than draft.updatedAt → adopt SP + cache ETag →
  else keep draft, flush any pending outbox patches
```

---

## 9. Cleanup / PHI purge

```typescript
// call on discharge or sign-out
export function purgeLocalPHI(): void {
  indexedDB.deleteDatabase("SurgiFlowLocal");
}
```

- IndexedDB is **unencrypted** — cached MRN/room/name persists until purged.
- Purge on **discharge** and **sign-out**. Confirm this satisfies your data-handling policy for cached identifiers.

---

## 10. Gotchas locked in from the original design

- **ETag is item-level, not field-level.** Two nurses on the same patient (different fields) still collide on version → the **412 retry** path is mandatory, not optional.
- **Collapse duplicate patches.** Outbox `id = patientKey|field` guarantees the newest edit replaces the pending one (no stacking, no thrash).
- **`X-HTTP-Method: MERGE`**, not `PUT` — MERGE patches only the field you send; PUT would blank every unsent column.
- **Retry ceiling.** `MAX_ATTEMPTS = 5` prevents an unsyncable patch from looping forever; leave it for manual review.
- **Debounce is per field**, not global — fast typing in one box never delays another field's save.
