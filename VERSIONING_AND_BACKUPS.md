## 1. Directory Structure

```text
surgiflow-DEV/
│
├── surgiflow-importer.html           # Active Working Build (Core Importer)
├── surgiflow-importer-with-UI.html   # Active Working Build (With Throttle & Batch Pause UI)
│
└── _archive_and_backups/              # Historical checkpoints and milestone backups
    ├── surgiflow-importer_v1.1_20260819_with_UI.html
    └── ...
```

---

## 2. Checkpoint Naming Standard

When creating a backup before major features or changes, copy the active files into `_archive_and_backups/` using the following convention:

```text
_archive_and_backups/surgiflow-importer_v[MAJOR].[MINOR]_[YYYYMMDD].html
```

* **`v[MAJOR].[MINOR]`**: Semantic version tag.
  * **Major (`v2.0`)**: Large architectural changes, major schema shifts, or complete UI rewrites.
  * **Minor (`v1.1`)**: Incremental features, new field mappings, or bug fixes.
* **`[YYYYMMDD]`**: ISO numeric date stamp of the snapshot.
* **`_desc` (Optional)**: Brief tag if helpful (e.g., `_with_UI`).

---

## 3. Version History Log

* **`v1.0 (20260812)`**: Initial stable importer with dynamic column mapping and appointment parsing.
* **`v1.1 (20260819_with_UI)`**: Added dedicated Unit mapping column dropdown, 4-digit room scrubbing (`6801`–`9940`), inter-record rate throttling delay controls (`250ms`–`3.0s`), and interactive batch confirmation pause options (`10`, `25`, `50` items). Available as [`surgiflow-importer-with-UI.html`](file:///c:/Users/tjm254/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/surgiflow-importer-with-UI.html) and archived at [`_archive_and_backups/surgiflow-importer_v1.1_20260819_with_UI.html`](file:///c:/Users/tjm254/OneDrive%20-%20AdventHealth/aaReadmissions/projects/surgiflow-DEV/_archive_and_backups/surgiflow-importer_v1.1_20260819_with_UI.html).


