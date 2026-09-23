# SurgiFlow COIP v3.2.1 — SPFx Development & Deployment Runbook

**Document Version:** 1.1.0  
**Application Version:** v3.2.1  
**Date:** September 2, 2026  
**Environment:** Windows (Work Laptop / Non-Admin / CMD-Only / Node v22.14.0)

---

## 1. Quick Start: How to Spin Up the SPFx Dev Server

Whenever you open a new `cmd.exe` terminal and want to start developing or previewing the app live in SharePoint:

```cmd
:: 1. Initialize development path and aliases
call "C:\Users\tjm254\Tools\sf-dev-path.cmd"

:: 2. Sync any latest standalone updates to the SPFx engine
xcopy /E /Y /I "C:\Users\tjm254\servers\Surgiflow-RCC-Standalone-\src\*" "C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx\src\webparts\sfRccCardiacHospital\components\full\"

:: 3. Start the SPFx development server on port 4321
spfx-serve
```

---

## 2. One-Time SSL Trust & SharePoint Developer Dashboard

When the terminal displays:

```text
[build:webpack] Started Webpack Dev Server at https://127.0.0.1:4321/
webpack 5.x.x compiled successfully
```

### Step A: SSL Trust (First time or new browser session)

1. Open a new browser tab.
2. Navigate to: `https://localhost:4321/temp/build/manifests.js`
3. Click **"Advanced"** → **"Proceed to localhost (unsafe)"**.
4. Confirm you see the JavaScript manifests text in the window.

### Step B: Open SharePoint Workbench

1. Navigate to:  
   👉 **[SurgiFlow SharePoint Workbench](https://ahsonline.sharepoint.com/teams/SurgiFlow/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https%3A%2F%2Flocalhost%3A4321%2Ftemp%2Fbuild%2Fmanifests.js)**
2. Click **"Load debug scripts"**.
3. Click the **`+`** (Add web part) icon on the page.
4. Select **`SurgiFlow Bedside Huddle Hub`** (or `SurgiFlow COIP Clinical Intelligence Hub`).

---

## 3. How to Build the Production `.sppkg` Package

To create the production package for deployment into the SharePoint App Catalog:

```cmd
call "C:\Users\tjm254\Tools\sf-dev-path.cmd"
spfx-build
```

The compiled package will be placed at:

- `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx\sharepoint\solution\sf-rcc-cardiac-hospital.sppkg`

---

## 4. GitHub Repository Consolidation Options

You have two primary options for structuring your clean GitHub repository:

### Option A (Recommended): Unified Standalone SPFx Monorepo (`Surgiflow-RCC-v3.1.4`)

- **What it is:** A clean, dedicated folder containing the full SPFx build rig + v3.1.4 application code without unrelated backend apps or legacy build files.

- **Benefits:**
  - Pure zero-overhead structure.
  - Clone and immediately run `spfx-serve` or `spfx-build`.
  - Single commit history tracking only the production-active clinical interface.

### Option B: Monorepo Clean Branch (`main` in `SF-CCOIP`)

- **What it is:** Keep the `SF-CCOIP-main` repository structure, tagging release `v3.1.4` on the main branch, and updating `Surgiflow-RCC-Standalone-` strictly as a lightweight submodule or preview sandbox.

---

## 5. Directory Mapping Reference

| Component | Working Path |
| :--- | :--- |
| **SPFx Engine Root** | `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx` |
| **Active Clinical Code** | `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx\src\webparts\sfRccCardiacHospital\components\full\` |
| **Standalone Source** | `C:\Users\tjm254\servers\Surgiflow-RCC-Standalone-\src\` |
| **Dev Environment Script** | `C:\Users\tjm254\Tools\sf-dev-path.cmd` |
| **SharePoint Lists** | `SurgiFlow Master` & `SurgiFlow COIP Reviews` |
