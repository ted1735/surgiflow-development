// Run in the SharePoint list page's DevTools console.
// Set DRY_RUN = false only after reviewing the preview.

(async () => {
  const LIST_TITLE = 'CTPCU POC TOOL V5';
  const DRY_RUN = true;
  const APPEND = true;
  const SOURCE_LABEL = '8.8 appointments (2026-08-08)';

  // Extracted from the 8.8 worksheet. CSN is the primary key; MRN and room are fallbacks.
  const appointments = [
    { room: '6802', csn: '5010481401010', mrn: '501527189', detail: 'PCP — 2026-08-13 1:30 PM with Benjamin Michael Ensell, PA-C; Transplant post — 2026-11-16 11:30 AM with Suresh Kumar Manickavel, MD.' },
    { room: '6803', csn: '5010479852625', mrn: '11312992', detail: 'PCP — 2026-08-10 11:00 AM; urology hospital follow-up pending office callback.' },
    { room: '6807', csn: '5010483489686', mrn: '7480302', detail: 'PCP — 2026-08-13 1:00 PM with Uy Thi Hoang, MD.' },
    { room: '6834', csn: '5010477597701', mrn: '512350839', detail: 'Cardiology — 2026-08-07 9:15 AM with Cesar Augusto Bonilla Isaza, MD; PCP — 2026-08-10 1:00 PM with Uy Thi Hoang, MD.' },
    { room: '7807', csn: '5010477290110', mrn: '15637292', detail: 'Cardiology — 2026-08-10 11:00 AM with Abigail Rivera, APRN; Pulmonology — 2026-08-06 9:30 AM with Vittorino Mejia, MD; Pulmonology — 2026-08-11 9:30 AM with Azib Shahid, MD; follow-up — 2026-08-04 3:00 PM with Azib Shahid, MD. Pulmonology office wait-list noted.' },
    { room: '7812', csn: '5010484523062', mrn: '511025808', detail: 'Follow-up — 2026-08-18 8:45 AM with Dr. Oni.' },
    { room: '7813', csn: '5010481548057', mrn: '30308430', detail: 'PCP — 2026-08-11 1:00 PM with Manju Kanikunnel, MD; CT Surgery — 2026-08-18 11:30 AM with Ahmad Zeeshan, MD; Cardiology — 2026-08-19 9:30 AM with Pradip B Baiju, MD; Pulmonology — 2026-08-20 3:40 PM.' },
    { room: '7814', csn: '5010482118944', mrn: '505536418', detail: 'Cardiology — 2026-08-14 1:30 PM with Suanne Buchanan, APRN.' },
    { room: '7818', csn: '5010481798249', mrn: '13091779', detail: 'PCP — 2026-08-03 1:40 PM; Cardiology — 2026-08-11 2:45 PM with Toralben Kiritbhai Patel, MD; Pulmonology — 2026-09-02 2:30 PM with Sahai Donaldson, MD.' },
    { room: '7833', csn: '5010485714542', mrn: '506718041', detail: 'Follow-up — 2026-08-13 10:40 AM with Gigi Kwok, MD.' },
    { room: '8818', csn: '5010483410205', mrn: '512419816', detail: 'CT Surgery — 2026-09-08 8:30 AM with Dr. Suarez-Cavelier; PCP — 2026-08-24 8:45 AM with ARNP Haupt.' },
    { room: '8819', csn: '5010483491511', mrn: '12482501', detail: 'PCP — 2026-08-14 9:00 AM with Azhar Iqbal Chaudhry, MD; Cardiology — 2026-08-18 10:30 AM with Erika Sosa, APRN; CT Surgery — 2026-08-18 11:15 AM with Jorge Enrique Suarez-Cavelier, MD.' },
    { room: '8836', csn: '5010484486186', mrn: '13032516', detail: 'PCP — 2026-08-13; Urology — 2026-08-20 3:30 PM with Scott Matthew Hughes, DO; Cardiology — 2026-08-21 10:00 AM with Tiji Kuthathayil Joseph, APRN/RN.' },
    { room: '8907', csn: '5010485171409', mrn: '14148700', detail: 'Brain MRI ordered; scheduling still needed. Patient reports two follow-up appointments within 7 days.' },
    { room: '8919', csn: '5010484272577', mrn: '13578190', detail: 'Cardiology — 2026-08-18 9:30 AM. Patient requests pulmonology follow-up with Dr. Ennala; scheduling preference is early morning.' },
    { room: '8935', csn: '5010484186830', mrn: '12097675', detail: 'PCP — 2026-08-07 4:00 PM with Myron Elliot Fuller, MD; Cardiology — 2026-08-11 1:45 PM with Shobashalini Chokkalingam, MD.' }
  ];

  const api = `${location.origin}/teams/WT8Charge/_api`;
  const jsonHeaders = { Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=verbose' };
  const get = async url => { const r = await fetch(url, { headers: { Accept: jsonHeaders.Accept } }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); };
  const norm = v => String(v ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const field = (fields, names) => fields.find(f => names.map(norm).includes(norm(f.Title)));

  const list = await get(`${api}/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')?$select=ListItemEntityTypeFullName,Title`);
  const fieldsResult = await get(`${api}/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/fields?$select=Title,InternalName,TypeAsString,Hidden,ReadOnlyField&$filter=Hidden%20eq%20false`);
  const fields = fieldsResult.value;
  console.table(fields.map(f => ({ Title: f.Title, InternalName: f.InternalName, Type: f.TypeAsString, ReadOnly: f.ReadOnlyField })));

  const roomField = field(fields, ['Room #', 'Room', 'Room Number']);
  const patientField = field(fields, ['Patient Name', 'Patient', 'Name']);
  const csnField = field(fields, ['CSN']);
  const mrnField = field(fields, ['MRN']);
  const apptField = field(fields, ['Appointment Detail', 'Appointment Details']);
  if (!roomField || !csnField || !mrnField || !apptField) throw new Error('Could not resolve required fields. Review the schema table above.');

  const items = (await get(`${api}/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/items?$top=5000`)).value;
  const findItem = a => items.find(i => norm(i[csnField.InternalName]) === norm(a.csn))
    || items.find(i => norm(i[mrnField.InternalName]) === norm(a.mrn))
    || items.find(i => norm(i[roomField.InternalName]) === norm(a.room));

  const plan = appointments.map(a => {
    const item = findItem(a);
    if (!item) return { ...a, status: 'NOT FOUND' };
    const oldValue = String(item[apptField.InternalName] ?? '').trim();
    const tagged = `${SOURCE_LABEL}: ${a.detail}`;
    const nextValue = APPEND && oldValue && !oldValue.includes(a.detail) ? `${oldValue}\n${tagged}` : (APPEND && oldValue ? oldValue : tagged);
    return { ...a, id: item.Id, patient: item[patientField?.InternalName], oldValue, nextValue, status: 'MATCH' };
  });
  console.table(plan.map(x => ({ status: x.status, id: x.id, room: x.room, patient: x.patient, detail: x.detail })));
  if (DRY_RUN) { console.info('DRY_RUN=true; no SharePoint items were changed. Set DRY_RUN=false to write.'); return; }

  const digest = await (await fetch(`${api}/contextinfo`, { method: 'POST', headers: { Accept: jsonHeaders.Accept } })).json();
  const requestDigest = digest.d.GetContextWebInformation.FormDigestValue;
  for (const p of plan.filter(x => x.status === 'MATCH')) {
    const body = { __metadata: { type: list.ListItemEntityTypeFullName }, [apptField.InternalName]: p.nextValue };
    const r = await fetch(`${api}/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/items(${p.id})`, { method: 'POST', headers: { ...jsonHeaders, 'X-RequestDigest': requestDigest, 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(`${r.status} updating item ${p.id}: ${await r.text()}`);
    console.log(`Updated ${p.patient || p.room}`);
  }
  console.info('Completed Appointment Detail updates.');
})();
