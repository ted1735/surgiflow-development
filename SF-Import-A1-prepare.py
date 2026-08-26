# SF-Import!A1 — Python cell 1 of 2.
# Reads the Epic table and prepares the authoritative room 8901-8936 payload.

import json
import re
import pandas as pd

ROOM_MIN, ROOM_MAX = 8901, 8936

# Python in Excel requires a literal/static reference inside xl().
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

def sf_text(value):
    if pd.isna(value):
        return ""
    return str(value).strip()

def sf_col(row, name):
    return sf_text(row[name]) if name in row else ""

def sf_room(value):
    match = re.search(r"\b(89(?:0[1-9]|1[0-9]|2[0-9]|3[0-6]))\b", sf_text(value))
    return match.group(1) if match else ""

def sf_appointment(notes):
    notes = re.sub(r"\s+", " ", sf_text(notes))
    keywords = r"appointment|appt|schedul|book.?it|follow.?up|follow up|existing appts|upcoming appts"
    return notes if re.search(keywords, notes, re.I) else ""

def sf_skip_reason(notes):
    excluded = r"out of scope|no scheduling needs|scheduling assistance is not indicated"
    return "Source explicitly says outpatient scheduling is out of scope." if re.search(excluded, sf_text(notes), re.I) else ""

sf_rows = []
for _, source_row in src.iterrows():
    room = sf_room(sf_col(source_row, "Room and Bed"))
    if not room:
        continue
    notes = sf_col(source_row, "Care Navigation Notes")
    sf_rows.append({
        "room": room,
        "roomAndBed": sf_col(source_row, "Room and Bed"),
        "name": sf_col(source_row, "Patient Name"),
        "mrn": sf_col(source_row, "MRN"),
        "csn": sf_col(source_row, "CSN"),
        "attendingMD": sf_col(source_row, "Attending"),
        "readmissionRiskLevel": sf_col(source_row, "IP Risk of Unplanned Readmission Score Column"),
        "fallRisk": sf_col(source_row, "Fall Risk Score"),
        "braden": sf_col(source_row, "Braden Score"),
        "dispo": sf_col(source_row, "Discharge Disposition"),
        "edd": sf_col(source_row, "EDD"),
        "age": sf_col(source_row, "Age"),
        "los": sf_col(source_row, "LoS"),
        "admitReason": sf_col(source_row, "Working DRG Name"),
        "appointmentDetail": sf_appointment(notes),
        "sourceStatus": sf_col(source_row, "Care Navigation Status"),
        "skipReason": sf_skip_reason(notes),
        "rawCareNavigationNotes": notes,
    })

sf_payload = {
    "schemaVersion": "2.0",
    "source": "appts sheet / Table1",
    "scope": {"roomMin": ROOM_MIN, "roomMax": ROOM_MAX},
    "rows": sf_rows,
}
sf_payload_json = json.dumps(sf_payload, ensure_ascii=False, separators=(",", ":"))

f"Prepared {len(sf_rows)} scoped patient rows for SF-Import"
