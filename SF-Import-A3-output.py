# SF-Import!A3 — Python cell 2 of 2.
# Requires SF-Import!A1 to run first. Set this cell's output to Excel Values.

sf_javascript = r'''(async()=>{
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
 attendingMD:find(['AttendingMD','Attending MD']),readmissionRiskLevel:find(['Readmission Risk Level']),
 fallRisk:find(['Fall Risk','Fall Risk Score']),braden:find(['Braden','Braden Score']),dispo:find(['Dispo','Disposition']),edd:find(['EDD']),age:find(['Age']),los:find(['LOS','Length of Stay']),admitReason:find(['Admit Reason']),appointmentDetail:find(['Appointment Detail','Appointment Details'])
};
if(!F.room||!F.name||!F.mrn)throw Error('Room, Name, or MRN is missing from the SPL.');
console.table(Object.entries(F).map(([source,f])=>({source,target:f?.Title||'NOT FOUND',internalName:f?.InternalName||'',type:f?.TypeAsString||''})));
const list=await get(`${api}/web/lists/getbytitle('${title}')?$select=ListItemEntityTypeFullName`);
const items=(await get(`${api}/web/lists/getbytitle('${title}')/items?$top=5000`)).value;
const val=(x,f)=>{if(x===undefined||x===null)return '';if(f?.TypeAsString==='Number'||f?.TypeAsString==='Integer'){const n=Number(x);return Number.isFinite(n)?n:x}if(f?.TypeAsString==='DateTime'){const n=Number(x);if(Number.isFinite(n)&&n>20000&&n<70000)return new Date(Date.UTC(1899,11,30)+n*86400000).toISOString()}return String(x)};
const values=row=>{const out={};for(const k of Object.keys(F)){if(F[k]&&row[k]!==undefined)out[F[k].InternalName]=val(row[k],F[k])}return out};
const same=(i,r)=>norm(i[F.name.InternalName])===norm(r.name)&&norm(i[F.mrn.InternalName])===norm(r.mrn);
const plan=DATA.rows.map(r=>{const matches=items.filter(i=>norm(i[F.room.InternalName])===norm(r.room));const ids=matches.filter(i=>same(i,r));if(ids.length>1)return{...r,result:'AMBIGUOUS_SAME_IDENTITY',count:ids.length};if(ids.length===1)return{...r,result:'UPDATE',id:ids[0].Id,count:matches.length};return{...r,result:'CREATE',count:matches.length,reason:matches.length?'Room collision with different name/MRN':'Room absent'}});
console.table(plan.map(r=>({result:r.result,room:r.room,name:r.name,mrn:r.mrn,csn:r.csn,existingRoomMatches:r.count,reason:r.reason})));
const updates=plan.filter(r=>r.result==='UPDATE'||r.result==='CREATE');
if(!confirm(`SURGIFLOW authoritative import\n\nSource rows: ${DATA.rows.length}\nUpdates: ${plan.filter(r=>r.result==='UPDATE').length}\nNew rows: ${plan.filter(r=>r.result==='CREATE').length}\nAmbiguous: ${plan.filter(r=>r.result.startsWith('AMBIGUOUS')).length}\n\nProceed?`))return;
const digest=(await(await fetch(`${api}/contextinfo`,{method:'POST',headers:{Accept:accept}})).json()).d.GetContextWebInformation.FormDigestValue;
const headers={Accept:accept,'Content-Type':'application/json;odata=verbose','X-RequestDigest':digest};
for(const r of updates){const body={__metadata:{type:list.ListItemEntityTypeFullName},...values(r)};let url=`${api}/web/lists/getbytitle('${title}')/items`;let opts={method:'POST',headers,body:JSON.stringify(body)};if(r.result==='UPDATE'){url+=`(${r.id})`;opts={method:'POST',headers:{...headers,'IF-MATCH':'*','X-HTTP-Method':'MERGE'},body:JSON.stringify(body)}}const resp=await fetch(url,opts);if(!resp.ok)throw Error(`${resp.status} room ${r.room}: ${await resp.text()}`);console.log(`${r.result}: ${r.room} / ${r.name}`)}
console.info('Authoritative appts import complete. Mismatched-room patients were preserved as new rows.');
})()'''.replace("__PAYLOAD__", sf_payload_json)

sf_missing_identity = [r for r in sf_rows if not r["name"] or not r["mrn"] or not r["csn"]]
sf_ready = bool(sf_rows) and not sf_missing_identity

if sf_ready:
    sf_chunks = [sf_javascript[i:i + 8000] for i in range(0, len(sf_javascript), 8000)]
    sf_console = ['window.__SURGIFLOW_IMPORT_SCRIPT="";']
    sf_console += ["window.__SURGIFLOW_IMPORT_SCRIPT += " + json.dumps(c, ensure_ascii=False) + ";" for c in sf_chunks]
    sf_console.append("eval(window.__SURGIFLOW_IMPORT_SCRIPT);")
else:
    sf_console = ['throw new Error("SF-Import STOP: a scoped row is missing Name, MRN, or CSN.");']

# A3 contains this formula. Headers are row 3, six proof rows are rows 4-9,
# and the contiguous copy/paste block starts in column C at row 10.
sf_copy_start = 10
sf_copy_end = sf_copy_start + len(sf_console) - 1
sf_proof = [
    {"SF-Import Check":"STATUS","Value":"READY" if sf_ready else "STOP - REVIEW","COPY_TO_DEVTOOLS":""},
    {"SF-Import Check":"Scoped patient rows","Value":len(sf_rows),"COPY_TO_DEVTOOLS":""},
    {"SF-Import Check":"CSNs loaded","Value":sum(bool(r["csn"]) for r in sf_rows),"COPY_TO_DEVTOOLS":""},
    {"SF-Import Check":"Appointment notes found","Value":sum(bool(r["appointmentDetail"]) and not r["skipReason"] for r in sf_rows),"COPY_TO_DEVTOOLS":""},
    {"SF-Import Check":"Missing Name/MRN/CSN","Value":len(sf_missing_identity),"COPY_TO_DEVTOOLS":""},
    {"SF-Import Check":"COPY INSTRUCTIONS","Value":f"Select C{sf_copy_start}:C{sf_copy_end}, copy, then paste once into SharePoint DevTools Console.","COPY_TO_DEVTOOLS":""},
]
for n, statement in enumerate(sf_console, 1):
    sf_proof.append({"SF-Import Check":f"SCRIPT {n:02d}","Value":"COPY THIS CELL","COPY_TO_DEVTOOLS":statement})

pd.DataFrame(sf_proof)
