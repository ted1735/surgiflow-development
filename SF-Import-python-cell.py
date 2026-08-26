# OBSOLETE: this one-cell version exceeds Excel's 8,192-character formula limit.
# Use SF-Import-A1-prepare.py and SF-Import-A3-output.py instead.
# Paste this into one =PY() cell on SF-Import!A1, then set its Python output
# type to Excel Values.  Keep A1:C30 empty so the result can spill into cells.
# It reads the appts sheet and returns a proof summary plus a copy/paste block.
# The script imports authoritative census fields and creates a new SPL row when
# the same room contains a different patient.

import json
import re
import pandas as pd

# The Epic appts table extends through column BA.
ROOM_MIN, ROOM_MAX = 8901, 8936

# Python in Excel requires Excel references in xl() to be static text.
# Do not move this reference into a variable or build it with an f-string.
src = xl("Table1[#All]", headers=True)
src.columns = [str(c).strip() for c in src.columns]

required_columns = [
    "Room and Bed", "Patient Name", "CSN", "MRN", "Attending",
    "IP Risk of Unplanned Readmission Score Column", "EDD",
    "Discharge Disposition", "Age", "LoS", "Fall Risk Score",
    "Braden Score", "Working DRG Name", "Care Navigation Notes",
    "Care Navigation Status",
]
missing_columns = [c for c in required_columns if c not in src.columns]
if missing_columns:
    raise ValueError("Epic table is missing required columns: " + ", ".join(missing_columns))

def text(value):
    if pd.isna(value):
        return ""
    return str(value).strip()

def col(row, name):
    return text(row[name]) if name in row else ""

def room_number(value):
    m = re.search(r"\b(89(?:0[1-9]|1[0-9]|2[0-9]|3[0-6]))\b", text(value))
    return m.group(1) if m else ""

def appointment_detail(notes):
    notes = re.sub(r"\s+", " ", text(notes))
    if not re.search(r"appointment|appt|schedul|book.?it|follow.?up|follow up|existing appts|upcoming appts", notes, re.I):
        return ""
    return notes

def skip_reason(notes):
    if re.search(r"out of scope|no scheduling needs|scheduling assistance is not indicated", text(notes), re.I):
        return "Source explicitly says outpatient scheduling is out of scope."
    return ""

rows = []
for _, r in src.iterrows():
    room = room_number(col(r, "Room and Bed"))
    if not room:
        continue
    notes = col(r, "Care Navigation Notes")
    rows.append({
        "room": room,
        "roomAndBed": col(r, "Room and Bed"),
        "name": col(r, "Patient Name"),
        "mrn": col(r, "MRN"),
        "csn": col(r, "CSN"),
        "attendingMD": col(r, "Attending"),
        "readmissionRiskLevel": col(r, "IP Risk of Unplanned Readmission Score Column"),
        "fallRisk": col(r, "Fall Risk Score"),
        "braden": col(r, "Braden Score"),
        "dispo": col(r, "Discharge Disposition"),
        "edd": col(r, "EDD"),
        "age": col(r, "Age"),
        "los": col(r, "LoS"),
        "admitReason": col(r, "Working DRG Name"),
        "appointmentDetail": appointment_detail(notes),
        "sourceStatus": col(r, "Care Navigation Status"),
        "skipReason": skip_reason(notes),
        "rawCareNavigationNotes": notes,
    })

payload = {
    "schemaVersion": "2.0",
    "source": "appts sheet",
    "scope": {"roomMin": ROOM_MIN, "roomMax": ROOM_MAX},
    "rows": rows,
}

payload_json = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))

javascript = r'''(async()=>{
const DATA=__PAYLOAD__;
const LIST_TITLE='CTPCU POC TOOL V5';
const api=`${location.origin}/teams/WT8Charge/_api`;
const accept='application/json;odata=nometadata';
const get=async u=>{const r=await fetch(u,{headers:{Accept:accept}});if(!r.ok)throw Error(`${r.status} ${u}`);return r.json()};
const norm=v=>String(v??'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const title=encodeURIComponent(LIST_TITLE);
const fields=(await get(`${api}/web/lists/getbytitle('${title}')/fields?$select=Title,InternalName,TypeAsString,Hidden,ReadOnlyField`)).value.filter(f=>!f.Hidden&&!f.ReadOnlyField);
const find=names=>fields.find(f=>names.some(n=>norm(n)===norm(f.Title)));
const F={
 room:find(['Room','Room #','Room Number']),name:find(['Name','Patient Name','Patient']),mrn:find(['MRN']),csn:find(['CSN']),
 attendingMD:find(['AttendingMD','Attending MD']),readmissionRiskLevel:find(['⚠️ Readmission Risk Level ⚠️','Readmission Risk Level']),
 fallRisk:find(['Fall Risk','Fall Risk Score']),braden:find(['Braden','Braden Score']),dispo:find(['Dispo','Disposition']),edd:find(['EDD']),age:find(['Age']),los:find(['LOS','Length of Stay']),admitReason:find(['Admit Reason']),appointmentDetail:find(['Appointment Detail','Appointment Details'])
};
if(!F.room||!F.name||!F.mrn)throw Error('Room, Name, or MRN is missing from the SPL.');
console.table(Object.entries(F).map(([source,f])=>({source,target:f?.Title||'NOT FOUND',internalName:f?.InternalName||'',type:f?.TypeAsString||''})));
const list=await get(`${api}/web/lists/getbytitle('${title}')?$select=ListItemEntityTypeFullName`);
const items=(await get(`${api}/web/lists/getbytitle('${title}')/items?$top=5000`)).value;
const val=(x,f)=>{if(x===undefined||x===null)return '';if(f?.TypeAsString==='Number'||f?.TypeAsString==='Integer'){const n=Number(x);return Number.isFinite(n)?n:x}if(f?.TypeAsString==='DateTime'){const n=Number(x);if(Number.isFinite(n)&&n>20000&&n<70000)return new Date(Date.UTC(1899,11,30)+n*86400000).toISOString()}return String(x)};
const values=row=>{const out={};for(const k of Object.keys(F)){if(F[k]&&row[k]!==undefined)out[F[k].InternalName]=val(row[k],F[k])}return out};
const same=(i,r)=>norm(i[F.name.InternalName])===norm(r.name)&&norm(i[F.mrn.InternalName])===norm(r.mrn);
const plan=DATA.rows.map(r=>{const matches=items.filter(i=>norm(i[F.room.InternalName])===norm(r.room));const ids=matches.filter(i=>same(i,r));if(ids.length>1)return{...r,result:'AMBIGUOUS_SAME_IDENTITY',count:ids.length};if(ids.length===1)return{...r,result:'UPDATE',id:ids[0].Id,count:matches.length};return{...r,result:'CREATE',count:matches.length,reason:matches.length?'Room collision with different name/MRN':'Room absent'};});
console.table(plan.map(r=>({result:r.result,room:r.room,name:r.name,mrn:r.mrn,csn:r.csn,existingRoomMatches:r.count,reason:r.reason})));
const updates=plan.filter(r=>r.result==='UPDATE'||r.result==='CREATE');
if(!confirm(`SURGIFLOW authoritative import\n\nSource rows: ${DATA.rows.length}\nUpdates: ${plan.filter(r=>r.result==='UPDATE').length}\nNew rows: ${plan.filter(r=>r.result==='CREATE').length}\nAmbiguous: ${plan.filter(r=>r.result.startsWith('AMBIGUOUS')).length}\n\nProceed?`))return;
const digest=(await(await fetch(`${api}/contextinfo`,{method:'POST',headers:{Accept:accept}})).json()).d.GetContextWebInformation.FormDigestValue;
const headers={Accept:accept,'Content-Type':'application/json;odata=verbose','X-RequestDigest':digest};
for(const r of updates){const body={__metadata:{type:list.ListItemEntityTypeFullName},...values(r)};let url=`${api}/web/lists/getbytitle('${title}')/items`;let opts={method:'POST',headers,body:JSON.stringify(body)};if(r.result==='UPDATE'){url+=`(${r.id})`;opts={method:'POST',headers:{...headers,'IF-MATCH':'*','X-HTTP-Method':'MERGE'},body:JSON.stringify(body)}}const resp=await fetch(url,opts);if(!resp.ok)throw Error(`${resp.status} room ${r.room}: ${await resp.text()}`);console.log(`${r.result}: ${r.room} / ${r.name}`)}
console.info('Authoritative appts import complete. Mismatched-room patients were preserved as new rows.');
})()'''.replace("__PAYLOAD__", payload_json)

# Excel cells are limited to 32,767 characters, so package the JavaScript as
# several safe statements.  End users copy the one contiguous block in column C
# and paste it into the SharePoint DevTools console once.
missing_identity = [r for r in rows if not r["name"] or not r["mrn"] or not r["csn"]]
ready = bool(rows) and not missing_identity

if ready:
    chunk_size = 8000
    chunks = [javascript[i:i + chunk_size] for i in range(0, len(javascript), chunk_size)]
    console_statements = ['window.__SURGIFLOW_IMPORT_SCRIPT="";']
    console_statements += [
        "window.__SURGIFLOW_IMPORT_SCRIPT += " + json.dumps(chunk, ensure_ascii=False) + ";"
        for chunk in chunks
    ]
    console_statements.append("eval(window.__SURGIFLOW_IMPORT_SCRIPT);")
else:
    console_statements = [
        'throw new Error("SF-Import is not ready: one or more scoped rows are missing Name, MRN, or CSN.");'
    ]

# With the Python output set to Excel Values, headers occupy row 1, the six
# proof rows occupy rows 2-7, and the copy/paste block starts in C8.
copy_start_row = 8
copy_end_row = copy_start_row + len(console_statements) - 1

proof_rows = [
    {"SF-Import Check": "STATUS", "Value": "READY" if ready else "STOP - REVIEW", "COPY_TO_DEVTOOLS": ""},
    {"SF-Import Check": "Scoped patient rows", "Value": len(rows), "COPY_TO_DEVTOOLS": ""},
    {"SF-Import Check": "CSNs loaded", "Value": sum(bool(r["csn"]) for r in rows), "COPY_TO_DEVTOOLS": ""},
    {"SF-Import Check": "Appointment notes found", "Value": sum(bool(r["appointmentDetail"]) and not r["skipReason"] for r in rows), "COPY_TO_DEVTOOLS": ""},
    {"SF-Import Check": "Missing Name/MRN/CSN", "Value": len(missing_identity), "COPY_TO_DEVTOOLS": ""},
    {"SF-Import Check": "COPY INSTRUCTIONS", "Value": f"Select C{copy_start_row}:C{copy_end_row}, copy, then paste once into the SharePoint DevTools Console.", "COPY_TO_DEVTOOLS": ""},
]

for number, statement in enumerate(console_statements, start=1):
    proof_rows.append({
        "SF-Import Check": f"SCRIPT {number:02d}",
        "Value": "COPY THIS CELL",
        "COPY_TO_DEVTOOLS": statement,
    })

pd.DataFrame(proof_rows)
