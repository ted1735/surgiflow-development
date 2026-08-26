// Authoritative DevTools loader for rooms 8901–8936.
// First paste/run appointment-import-8901-8936.js.
// Leave DRY_RUN=true until the preview is reviewed.

(async () => {
  const DRY_RUN = true;
  const LIST_TITLE = 'CTPCU POC TOOL V5';
  const data = window.SURGIPLOW_APPOINTMENT_IMPORT;
  if (!data?.rows) throw new Error('Import data not loaded. Paste appointment-import-8901-8936.js first.');

  const api = `${location.origin}/teams/WT8Charge/_api`;
  const accept = 'application/json;odata=nometadata';
  const get = async url => { const r = await fetch(url, { headers: { Accept: accept } }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); };
  const norm = v => String(v ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const title = encodeURIComponent(LIST_TITLE);
  const fieldsResult = await get(`${api}/web/lists/getbytitle('${title}')/fields?$select=Title,InternalName,TypeAsString,Hidden,ReadOnlyField`);
  const fields = fieldsResult.value.filter(f => !f.Hidden && !f.ReadOnlyField);
  const find = names => fields.find(f => names.some(n => norm(n) === norm(f.Title)));
  const roomField = find(['Room', 'Room #', 'Room Number']);
  const nameField = find(['Name', 'Patient Name', 'Patient']);
  const mrnField = find(['MRN']);
  const csnField = find(['CSN']);
  if (!roomField || !nameField || !mrnField) throw new Error('Room, Name, or MRN field is missing.');

  const mappings = [
    ['room', ['Room', 'Room #', 'Room Number']],
    ['name', ['Name', 'Patient Name', 'Patient']],
    ['mrn', ['MRN']],
    ['csn', ['CSN']],
    ['attendingMD', ['AttendingMD', 'Attending MD']],
    ['readmissionRiskLevel', ['⚠️ Readmission Risk Level ⚠️', 'Readmission Risk Level']],
    ['fallRisk', ['Fall Risk', 'Fall Risk Score']],
    ['braden', ['Braden', 'Braden Score']],
    ['dispo', ['Dispo', 'Disposition']],
    ['edd', ['EDD']],
    ['age', ['Age']],
    ['los', ['LOS', 'Length of Stay']],
    ['admitReason', ['Admit Reason']],
    ['appointmentDetail', ['Appointment Detail', 'Appointment Details']]
  ];
  const resolved = Object.fromEntries(mappings.map(([source, names]) => [source, find(names)]));
  if (!resolved.room || !resolved.name || !resolved.mrn) throw new Error('Required identity fields could not be resolved.');
  console.table(fields.map(f => ({ title: f.Title, internalName: f.InternalName, type: f.TypeAsString })));
  console.table(Object.entries(resolved).map(([source, field]) => ({ source, target: field?.Title || 'NOT FOUND', internalName: field?.InternalName || '' })));

  const list = await get(`${api}/web/lists/getbytitle('${title}')?$select=ListItemEntityTypeFullName`);
  const items = (await get(`${api}/web/lists/getbytitle('${title}')/items?$top=5000`)).value;
  const roomMatches = row => items.filter(i => norm(i[resolved.room.InternalName]) === norm(row.room));
  const sameIdentity = (item, row) => norm(item[resolved.name.InternalName]) === norm(row.name || row.patientName)
    && norm(item[resolved.mrn.InternalName]) === norm(row.mrn);

  const toSharePointValue = (value, field) => {
    if (value === undefined || value === null) return '';
    if (field?.TypeAsString === 'Number' || field?.TypeAsString === 'Integer') {
      const n = Number(value); return Number.isFinite(n) ? n : value;
    }
    if (field?.TypeAsString === 'DateTime') {
      const n = Number(value);
      if (Number.isFinite(n) && n > 20000 && n < 70000) return new Date(Date.UTC(1899, 11, 30) + n * 86400000).toISOString();
    }
    return String(value);
  };

  const buildValues = row => {
    const values = {};
    for (const [source, field] of Object.entries(resolved)) {
      if (!field || row[source] === undefined) continue;
      values[field.InternalName] = toSharePointValue(row[source], field);
    }
    // Do not place boilerplate/out-of-scope notes in Appointment Detail.
    if (resolved.appointmentDetail && row.skipReason) delete values[resolved.appointmentDetail.InternalName];
    return values;
  };

  const plan = data.rows.map(row => {
    const matches = roomMatches(row);
    const identityMatches = matches.filter(item => sameIdentity(item, row));
    if (identityMatches.length > 1) return { ...row, result: 'AMBIGUOUS_SAME_IDENTITY', matchCount: identityMatches.length };
    if (identityMatches.length === 1) {
      const item = identityMatches[0];
      return { ...row, result: 'UPDATE', id: item.Id, patient: item[resolved.name.InternalName], values: buildValues(row), reason: 'Room, name, and MRN identify the same patient.' };
    }
    return { ...row, result: 'CREATE', matchCount: matches.length, values: buildValues(row), reason: matches.length ? 'Room exists but name or MRN differs; preserve existing row and create authoritative source row.' : 'No matching room; create authoritative source row.' };
  });
  console.table(plan.map(x => ({ result: x.result, room: x.room, name: x.name || x.patientName, mrn: x.mrn, csn: x.csn, existingRoomMatches: x.matchCount || 0, reason: x.reason, skip: x.skipReason })));
  if (DRY_RUN) { console.info('DRY_RUN=true — no list items changed. Set DRY_RUN=false after reviewing UPDATE and CREATE rows.'); return; }

  const digestResponse = await fetch(`${api}/contextinfo`, { method: 'POST', headers: { Accept: accept } });
  const digest = (await digestResponse.json()).d.GetContextWebInformation.FormDigestValue;
  const writeHeaders = { Accept: accept, 'Content-Type': 'application/json;odata=verbose', 'X-RequestDigest': digest };
  for (const row of plan.filter(x => x.result === 'UPDATE' || x.result === 'CREATE')) {
    const body = { __metadata: { type: list.ListItemEntityTypeFullName }, ...row.values };
    let url = `${api}/web/lists/getbytitle('${title}')/items`;
    let options = { method: 'POST', headers: writeHeaders, body: JSON.stringify(body) };
    if (row.result === 'UPDATE') {
      url += `(${row.id})`;
      options = { method: 'POST', headers: { ...writeHeaders, 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' }, body: JSON.stringify(body) };
    }
    const r = await fetch(url, options);
    if (!r.ok) throw new Error(`${r.status} writing room ${row.room}: ${await r.text()}`);
    console.log(`${row.result}: room ${row.room} / ${row.name || row.patientName}`);
  }
  console.info('Authoritative appts import completed. Existing mismatched-room patients were preserved as duplicates for charge-nurse review.');
})();
