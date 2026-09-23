# SF-RCC / SF-CCOIP Work-Laptop Handoff — v1.0.1

**Checkpoint:** `v1.0.1`  
**Git commit:** `ebbe02341d92162f390f241281fdc9457bde18c3`  
**GitHub repository:** `https://github.com/ted1735/SF-CCOIP-REBUILD-SPFx.git`  
**Date:** 2026-08-20  
**Purpose:** Bring the work laptop to the exact project state used on the home laptop, with the supported Node.js runtime and all project dependencies installed.

## Project and SharePoint operating model

The production source of truth is the **SurgiFlow Master** SharePoint list. The intended flow is:

```text
SF-RCC SPFx web part and native SF-CCOIP census import -> SharePoint List -> dashboard/readmission workflows -> approved Excel reporting
```

- The SPFx web part reads and writes the SharePoint list directly through the signed-in user's SharePoint session.
- The local TypeScript/SQLite Registry API and Jupyter notebooks are development, analysis, or migration tools. They are not required for the native v1.0.1 SF-CCOIP census-import workflow.
- SharePoint schema, mapping, configuration, permissions, and deployment reference material is under `docs\sharepoint`:
  - `SHAREPOINT-DEPLOYMENT-GUIDE.md`
  - `SHAREPOINT-VALIDATION-CHECKLIST.md`
  - `sharepoint-field-inventory.json`
  - `sharepoint-field-map.json`
  - `sharepoint-list-schema.json`
  - `sharepoint-permissions.json`
  - `sharepoint-config.example.json`
- **Live SharePoint & CDP Remote Debugging Launch Command**:

  ```cmd
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\DebugProfile" --remote-allow-origins=* "https://ahsonline.sharepoint.com/teams/SurgiFlow/Lists/SurgiFlow%20Master/Dashboard%20v6%20Double.aspx"
  ```

- The captured reference is the SurgiFlow site, list **SurgiFlow Master**, and view **Dashboard v6**. It is documentation, not proof of the tenant's current configuration. Validate live field internal names, types, choice values, and user permissions before production writes or package deployment.
- Do not commit `.env` files, tokens, patient data, source census workbooks, `node_modules`, or caches.

### Session-start prompt for Codex

Use this prompt on either laptop after opening the cloned repository:

```text
Read WORK-LAPTOP-SESSION-HANDOFF-v1.0.1.md first. Treat its two-environment section as the local path and Node 22 source of truth, and docs/sharepoint as the SharePoint mapping reference.

Before making changes, report the repository path, Git branch, `git status`, latest commit, configured `origin`, and `node --version`. Synchronize with GitHub before work: run `git fetch origin --tags`; only run `git pull --ff-only origin main` when the working tree is clean and the active branch is `main`. If there are uncommitted changes, a non-main branch, a merge conflict, or a non-fast-forward update, stop and report the condition without overwriting, stashing, resetting, cleaning, deleting, committing, or pushing anything.

Do not use or print patient data. Use Node 22.14.0 for all npm work in packages/spfx and the app folders. Do not deploy to SharePoint or write to a production list unless explicitly asked. Start by identifying the next safe, requested task. Validate the live SharePoint schema, field internal names, choice values, and user permissions before any production write.
```

## Two-environment baseline — do not guess paths or versions

This section is the source of truth for the two development machines. Use the same **CMD-launched PowerShell** pattern on both machines so Node 22 is selected for every project command without changing the machine-wide PATH or uninstalling Node 24.

### HOME LAPTOP — current, verified environment

| Item | Exact home-laptop value |
| --- | --- |
| Windows user profile | `C:\Users\tedmo` |
| Repository root | `C:\Projects\SF-CCOIP-REBUILD-SPFx` |
| Git remote | `https://github.com/ted1735/SF-CCOIP-REBUILD-SPFx.git` |
| Current branch | `main` |
| Current documentation commit | `2d8780c` |
| Application release commit | `ebbe02341d92162f390f241281fdc9457bde18c3` |
| Application release tag | `v1.0.1` |
| Portable project Node | `C:\Tools\node-v22.14.0-win-x64\node.exe` |
| Required Node version | `v22.14.0` |
| Existing system Node | `C:\Program Files\nodejs\node.exe` (Node 24; leave installed, do not use for this project) |
| Git executable | `C:\Program Files\Git\cmd\git.exe` |
| Node 22 npm prefix | `C:\Tools\node-v22.14.0-win-x64` |
| npm download cache | `C:\Users\tedmo\AppData\Local\npm-cache` |
| User-level npm command folder | `C:\Users\tedmo\AppData\Roaming\npm` |
| Codex local configuration/memory | `C:\Users\tedmo\.codex` |
| Temporary files | `C:\Users\tedmo\AppData\Local\Temp` |
| Verified Git bundle backup | `C:\Projects\SF-CCOIP-backups\SF-CCOIP-REBUILD-SPFx-v1.0.1-ebbe023.bundle` |

**UV status on the home laptop:** `uv` is not installed, is not on PATH, and is not required to install, build, package, or run the Node/SharePoint projects in this repository. Do not add UV merely for this project.

### Home-laptop CMD command template

Open `cmd.exe` and use this command form whenever a PowerShell command is needed. It starts a clean PowerShell process, bypasses only the PowerShell execution-policy restriction for that one process, puts portable Node 22 first in PATH, and then runs the requested command.

```cmd
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path; Set-Location 'C:\Projects\SF-CCOIP-REBUILD-SPFx'; node --version; npm --version"
```

Expected Node output: `v22.14.0`. `-ExecutionPolicy Bypass` does not override AppLocker, endpoint security, administrator requirements, or any other corporate execution control.

### Home-laptop GitHub sync command

```cmd
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "Set-Location 'C:\Projects\SF-CCOIP-REBUILD-SPFx'; git status --short; git fetch origin --tags; git switch main; git pull --ff-only origin main; git status -sb; git log -2 --oneline --decorate"
```

This synchronizes the home laptop with GitHub without discarding changes. If `git status --short` shows work you need, stop and preserve it before using commands that switch branches, reset, clean, or overwrite files.

### WORK LAPTOP — no-admin, restricted-execution template

Do not assume `C:\Tools` or `C:\Projects` is writable on the work laptop. Use a user-owned root instead, replacing `YOUR-WINDOWS-USER` once with the actual work-laptop username:

| Item | Work-laptop standard |
| --- | --- |
| User profile | `C:\Users\YOUR-WINDOWS-USER` |
| Portable Node 22 | `C:\Users\YOUR-WINDOWS-USER\Tools\node-v22.14.0-win-x64` |
| Repository root | `C:\Users\YOUR-WINDOWS-USER\source\SF-CCOIP-REBUILD-SPFx` |
| Local backup folder | `C:\Users\YOUR-WINDOWS-USER\SF-CCOIP-backups` |
| npm cache (normal user default) | `C:\Users\YOUR-WINDOWS-USER\AppData\Local\npm-cache` |
| User-level npm command folder | `C:\Users\YOUR-WINDOWS-USER\AppData\Roaming\npm` |
| Codex local data, if Codex is installed | `C:\Users\YOUR-WINDOWS-USER\.codex` |
| Temporary files | `C:\Users\YOUR-WINDOWS-USER\AppData\Local\Temp` |

### Work-laptop CMD command template

Use this same pattern from `cmd.exe`; only the user-owned paths differ from the home laptop:

```cmd
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$env:Path = 'C:\Users\YOUR-WINDOWS-USER\Tools\node-v22.14.0-win-x64;' + $env:Path; Set-Location 'C:\Users\YOUR-WINDOWS-USER\source\SF-CCOIP-REBUILD-SPFx'; node --version; npm --version"
```

If PowerShell is blocked by policy, the equivalent CMD-only Node selection is:

```cmd
set "PATH=C:\Users\YOUR-WINDOWS-USER\Tools\node-v22.14.0-win-x64;%PATH%"
node --version
npm --version
```

### WORK LAPTOP DEV ENVIRONMENT — current paths

The following is the actual current work-laptop environment. It supersedes the generic work-laptop path template above wherever the two differ. These paths were supplied from the work laptop and should be treated as the baseline for all commands on that machine.

| Purpose | Path |
| --- | --- |
| **Primary project source** | `C:\Users\tjm254\servers\SF-CCOIP-main` |
| **GitHub remote** | `https://github.com/ted1735/SF-CCOIP-REBUILD-SPFx.git` |
| **Original Codex staging workspace** | `C:\Users\tjm254\OneDrive - AdventHealth\Documents\ChatGPT\SF-CCOIP-Freshstart` |
| **Clinical tracking app** | `C:\Users\tjm254\servers\SF-CCOIP-main\apps\clinical-tracking` |
| **Registry API/local server** | `C:\Users\tjm254\servers\SF-CCOIP-main\apps\registry-api` |
| **Command center** | `C:\Users\tjm254\servers\SF-CCOIP-main\apps\command-center` |
| **SPFx project** | `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx` |
| **SPFx package** | `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx\sharepoint\solution\sf-rcc-cardiac-hospital.sppkg` |
| **SharePoint schema/mapping docs** | `C:\Users\tjm254\servers\SF-CCOIP-main\docs\sharepoint` |
| **Project backups** | `C:\Users\tjm254\servers\server-backups` |
| **Node tooling** | `C:\Users\tjm254\Tools\Node\node.exe` (Node 22) |
| **SPFx local binaries** | `C:\Users\tjm254\servers\SF-CCOIP-main\packages\spfx\node_modules\.bin` |
| **Git Tooling (Primary)** | `C:\Users\tjm254\AppData\Local\Programs\Git\cmd\git.exe` |
| **Git Bash Executable** | `C:\Users\tjm254\AppData\Local\Programs\Git\git-bash.exe` |
| **Git MINGW64 Binaries** | `C:\Users\tjm254\AppData\Local\Programs\Git\mingw64\bin\git.exe` |
| **Git Unix Utilities (POSIX)** | `C:\Users\tjm254\AppData\Local\Programs\Git\usr\bin` (`bash`, `curl`, `grep`, `sed`, `awk`, `find`, `ssh`) |
| **Fallback Portable Git** | `C:\Users\tjm254\Tools\Git\cmd\git.exe` |
| **Python tooling** | `C:\Users\tjm254\Tools\Python` |
| **UV executable** | `C:\Users\tjm254\.local\bin\uv.exe` |
| **UV Python shims** | `C:\Users\tjm254\.local\bin\python3.12.exe` and `python3.14.exe` |
| **UV cache** | `C:\Users\tjm254\AppData\Local\uv\cache` |
| **UV-managed Python files** | `C:\Users\tjm254\AppData\Local\uv\python` |
| **PNPM Home & State** | `C:\Users\tjm254\AppData\Local\pnpm` |
| **npm Download Cache** | `C:\Users\tjm254\AppData\Local\npm-cache` |
| **Pandoc Tooling** | `C:\Users\tjm254\AppData\Local\Pandoc\pandoc.exe` |
| **Codex configuration/skills** | `C:\Users\tjm254\.codex` |

### Git Bash for Windows — Configuration, Usage, and Best Scenarios

**Git Bash** is fully installed and available at `C:\Users\tjm254\AppData\Local\Programs\Git\git-bash.exe`.

#### When to Use Git Bash vs CMD
* **Use Git Bash for:**
  * **Interactive Git & Tree Inspection**: Enhanced colored terminal output, interactive rebasing (`git rebase -i`), side-by-side branch comparison graphs (`git log --graph --oneline --all`), and smooth pager navigation via `less`.
  * **POSIX Shell & Script Execution**: Running `.sh` scripts, piping data through Unix CLI tools (`grep`, `sed`, `awk`, `find`, `curl`, `tar`, `cut`, `xargs`).
  * **SSH Keys & GitHub Authentication**: Key generation (`ssh-keygen -t ed25519`), SSH agent forwarding, and GitHub authentication verification (`ssh -T git@github.com`).
  * **Path & Escaping Reliability**: Uses standard forward-slash paths (`/c/Users/tjm254/servers/...`) and POSIX single-quoting without Windows CMD escaping conflicts (`^`, `%%`).
* **Use CMD (`sf-dev-path.cmd`) for:**
  * Fast native Windows Node 22/SPFx builds (`spfx-build`, `spfx-serve`) where CMD batch files (`.cmd`, `.bat`) execute with zero shell translation overhead.

#### Quick Launching Git Bash from CMD:
* Type `sf-bash` to instantly open a Git Bash terminal window rooted at `%SF_REPO%`.
* Type `sf-bash-spfx` to open Git Bash inside the SPFx package folder.

---

### Work-Laptop CMD-Only Startup Script (`sf-dev-path.cmd`)

Because PowerShell execution is blocked by corporate group policy on this work laptop, use this CMD script (`sf-dev-path.cmd`) to configure the environment, add all necessary tool paths to `PATH`, set user cache directories, and register instant `doskey` development shortcuts:

```cmd
@echo off
rem ===================================================================
rem  SF-RCC / SF-CCOIP Work-Laptop Development Environment Setup
rem  Environment: Windows (Non-Admin, CMD-Only, No PowerShell)
rem ===================================================================

rem -------------------------------------------------------------------
rem 1. Core Project Workspace Paths
rem -------------------------------------------------------------------
set "SF_REPO=%USERPROFILE%\servers\SF-CCOIP-main"
set "SF_BACKUPS=%USERPROFILE%\servers\server-backups"
set "SF_SPFX=%SF_REPO%\packages\spfx"
set "SF_CLINICAL=%SF_REPO%\apps\clinical-tracking"
set "SF_REGISTRY=%SF_REPO%\apps\registry-api"
set "SF_COMMAND_CENTER=%SF_REPO%\apps\command-center"
set "SF_SHAREPOINT_DOCS=%SF_REPO%\docs\sharepoint"

rem -------------------------------------------------------------------
rem 2. User Tool & Cache Directories (De-duplicated & Localized)
rem -------------------------------------------------------------------
set "PNPM_HOME=%USERPROFILE%\AppData\Local\pnpm"
set "UV_CACHE_DIR=%USERPROFILE%\AppData\Local\uv\cache"
set "UV_TOOL_DIR=%USERPROFILE%\AppData\Local\uv"
set "UV_PYTHON_INSTALL_DIR=%USERPROFILE%\AppData\Local\uv\python"
set "npm_config_cache=%USERPROFILE%\AppData\Local\npm-cache"
set "GIT_BASH=%LOCALAPPDATA%\Programs\Git\git-bash.exe"

rem -------------------------------------------------------------------
rem 3. Build & Runtime PATH (SPFx Bin MUST precede Tools\Node to bypass broken global wrappers)
rem -------------------------------------------------------------------
set "PATH=%SF_SPFX%\node_modules\.bin;%USERPROFILE%\Tools\Node;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%LOCALAPPDATA%\Programs\Git\usr\bin;%USERPROFILE%\Tools\Git\cmd;%USERPROFILE%\Tools\Git\bin;%USERPROFILE%\.local\bin;%USERPROFILE%\Tools\Python;%USERPROFILE%\Tools\Python\Scripts;%PNPM_HOME%;%USERPROFILE%\AppData\Local\Pandoc;%USERPROFILE%\AppData\Roaming\npm;%LOCALAPPDATA%\Programs;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem"

rem -------------------------------------------------------------------
rem 4. CMD-Only Quick Development Aliases (Direct Local Binary Invocation)
rem -------------------------------------------------------------------
doskey spfx-build=cd /d "%SF_SPFX%" ^& .\node_modules\.bin\heft.cmd test --clean --production ^& .\node_modules\.bin\heft.cmd package-solution --production
doskey spfx-serve=cd /d "%SF_SPFX%" ^& .\node_modules\.bin\heft.cmd start --clean
doskey spfx-start=cd /d "%SF_SPFX%" ^& .\node_modules\.bin\heft.cmd start --clean
doskey spfx-clean=cd /d "%SF_SPFX%" ^& .\node_modules\.bin\heft.cmd clean
doskey spfx-package=cd /d "%SF_SPFX%" ^& .\node_modules\.bin\heft.cmd package-solution --production
doskey sf-spfx=cd /d "%SF_SPFX%"
doskey sf-root=cd /d "%SF_REPO%"
doskey sf-git-status=cd /d "%SF_REPO%" ^& git status -sb
doskey sf-bash=start "" "%LOCALAPPDATA%\Programs\Git\git-bash.exe" --cd="%SF_REPO%"
doskey sf-bash-spfx=start "" "%LOCALAPPDATA%\Programs\Git\git-bash.exe" --cd="%SF_SPFX%"
doskey sf-edge-debug="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\Microsoft\Edge\DebugProfile" --remote-allow-origins=* "https://ahsonline.sharepoint.com/teams/SurgiFlow/Lists/SurgiFlow%%20Master/Dashboard%%20v6%%20Double.aspx"

cd /d "%SF_REPO%"

rem -------------------------------------------------------------------
rem 5. Environment Diagnostics & Status Banner
rem -------------------------------------------------------------------
echo.
echo ===================================================================
echo  SurgiFlow Dev Environment Loaded (Work Laptop / Non-Admin)
echo ===================================================================
echo  Repository : %CD%
echo  SPFx Root  : %SF_SPFX%
echo.
echo  Tool Status:
where node 2>nul
node --version 2>nul
where git 2>nul
git --version 2>nul
where bash 2>nul
where uv 2>nul
uv --version 2>nul
where python 2>nul
python --version 2>nul
where pandoc 2>nul
where heft 2>nul
echo.
echo  Quick Commands Available:
echo    spfx-build    : Clean build ^& package solution (.sppkg)
echo    spfx-serve    : Run SPFx live dev server (heft start)
echo    spfx-clean    : Clean SPFx cache ^& build output
echo    sf-bash       : Launch Git Bash terminal at repository root
echo    sf-bash-spfx  : Launch Git Bash terminal at SPFx directory
echo    sf-edge-debug : Launch Edge with CDP on port 9222 for live SharePoint
echo    sf-spfx       : Navigate to SPFx directory
echo    sf-root       : Navigate to repository root
echo ===================================================================
echo.
```

## GitHub editing-session workflow — start, sync, finish, and push

Use this process on **both laptops** for every editing session. GitHub `main` is the shared project history. The objective is to start from the latest safe state, make only intended edits, validate them, and leave the next laptop with a clean, pushed checkpoint.

### Rules that apply throughout the session

- Work from the primary local clone, never the OneDrive staging workspace.
- Use `main` unless a separate branch is deliberately requested.
- Never use `git reset --hard`, `git clean`, `git checkout --`, force-push, or a blanket `git add -A` to solve a sync problem.
- Never commit patient data, census workbooks, exports, screenshots containing patient information, `.env` files, secrets, `node_modules`, caches, or temporary build output.
- Stage files by explicit name so the commit contains only reviewed, intended changes.
- If a command reports a merge conflict, rebase conflict, authentication problem, unexpected remote, or unexpected changed file, stop and review it before proceeding.

### A. Start of every editing session — verify and safely pull

1. Open `cmd.exe`.
2. Use the matching **Home-laptop CMD command template** or **Actual work-laptop sync and Node verification command** above. Confirm Node reports `v22.14.0`.
3. From the repository root, inspect the current local state:

```powershell
git status -sb
git status --short
git branch --show-current
git remote -v
git log -1 --oneline --decorate
```

1. If `git status --short` prints anything, do **not** pull, switch branches, reset, clean, or overwrite. First decide whether those local changes are intentional. Preserve or commit them before synchronizing.
2. If the tree is clean and the active branch is `main`, obtain current remote references and fast-forward only:

```powershell
git fetch origin --tags
git pull --ff-only origin main
git status -sb
git log -2 --oneline --decorate
```

1. Confirm the final status says `## main...origin/main` with no ahead/behind count. You now have the synchronized editing baseline.

#### CMD one-command start check — home laptop

```cmd
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path; Set-Location 'C:\Projects\SF-CCOIP-REBUILD-SPFx'; node --version; git status -sb; git status --short; git branch --show-current; git remote -v; git fetch origin --tags; git pull --ff-only origin main; git status -sb; git log -2 --oneline --decorate"
```

#### CMD one-command start check — work laptop

```cmd
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$env:Path = 'C:\Users\tjm254\Tools\Node;C:\Users\tjm254\Tools\Git\cmd;' + $env:Path; Set-Location 'C:\Users\tjm254\servers\SF-CCOIP-main'; node --version; git status -sb; git status --short; git branch --show-current; git remote -v; git fetch origin --tags; git pull --ff-only origin main; git status -sb; git log -2 --oneline --decorate"
```

Do not use either one-command version if the checkout is already known to contain uncommitted work; run the inspection commands first and resolve the state deliberately.

### B. During the session — keep the change set reviewable

1. Make the requested edits only in the primary clone.
2. Before testing or staging, inspect the intended changes:

```powershell
git status --short
git diff --check
git diff --stat
git diff -- path\to\intended-file
```

1. Run the smallest relevant validation. For example, after an SPFx code change:

```powershell
Set-Location packages\spfx
npm run build
```

1. Return to the repository root before committing:

```powershell
Set-Location ..\..
```

### C. End of the session — review, commit, synchronize, and push

Follow these steps only after you have reviewed the changes and the relevant validation has passed.

1. Review exactly what will be committed:

```powershell
git status --short
git diff --check
git diff --stat
```

1. Stage only named, intended files. Example:

```powershell
git add -- packages\spfx\src\webparts\sfRccCardiacHospital\components\Example.tsx WORK-LAPTOP-SESSION-HANDOFF-v1.0.1.md
git diff --cached --stat
git diff --cached
```

1. Commit with a concise message describing the completed work:

```powershell
git commit -m "feat: describe the completed change"
```

1. Before pushing, fetch again. If GitHub changed while you were editing, incorporate it safely:

```powershell
git fetch origin --tags
git status -sb
```

1. If status shows that `origin/main` advanced, rebase your just-created local commit(s) onto the updated remote only when you are prepared to resolve normal text conflicts:

```powershell
git rebase origin/main
```

If a rebase conflict occurs, stop. Review the conflicting files, preserve the intended work, and use `git status` to understand the next safe action. Do not use `git reset --hard` or force-push. If no remote changes occurred, no rebase is needed.

1. Push the reviewed commit:

```powershell
git push origin main
git status -sb
git log -1 --oneline --decorate
```

1. A successful end state is `## main...origin/main` with no changed files. The other laptop can now run the start-of-session workflow to receive the same state.

### D. Optional release checkpoint and portable backup

Create a release tag only when a versioned checkpoint is deliberately approved. Do not retag or move an existing release tag.

```powershell
git tag -a vX.Y.Z -m "SF-RCC vX.Y.Z checkpoint"
git push origin vX.Y.Z
```

After a release tag exists, create a portable complete-history bundle in the appropriate backup folder:

```powershell
git bundle create C:\path\to\backups\SF-CCOIP-REBUILD-SPFx-vX.Y.Z.bundle vX.Y.Z
git bundle verify C:\path\to\backups\SF-CCOIP-REBUILD-SPFx-vX.Y.Z.bundle
Get-FileHash C:\path\to\backups\SF-CCOIP-REBUILD-SPFx-vX.Y.Z.bundle -Algorithm SHA256
```

Use `C:\Projects\SF-CCOIP-backups` on the home laptop and `C:\Users\tjm254\servers\server-backups` on the current work laptop.

## Local development inventory

The repository contains four independently runnable project areas. They share source control but do not all need to be started for the native v1.0.1 SharePoint application.

| Project | Path from repository root | Local command | Role in current v1.0.1 workflow |
| --- | --- | --- | --- |
| SF-RCC SPFx web part | `packages\spfx` | `npm run build` / `npm run start` | Primary product. `npm run build` creates the deployable SharePoint package. |
| Clinical Tracking | `apps\clinical-tracking` | `npm run dev` | Separate Vite/Node clinical-tracking application; not required by the native SF-CCOIP tab. |
| Command Center | `apps\command-center` | `npm run dev` | Separate Vinext development application. The old Windows-incompatible Wrangler environment-variable prefix was removed. It is not required by the native SF-CCOIP tab. |
| Registry API | `apps\registry-api` | `npm run dev` | Separate Node/Vite registry service. It is not required by the native SF-CCOIP tab. |

All four projects use their own `node_modules` folders and must be installed individually with `npm ci` when needed. Keep Node 22 first in PATH for every one of them.

### Optional Python/Crawl4AI component in Registry API

The Registry API has an optional education-crawl endpoint that looks for this project-local interpreter:

`C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\registry-api\.venv\Scripts\python.exe`

On the work laptop, the corresponding path would be:

`C:\Users\YOUR-WINDOWS-USER\source\SF-CCOIP-REBUILD-SPFx\apps\registry-api\.venv\Scripts\python.exe`

That `.venv` is only needed for the optional Crawl4AI education feature. It is not needed for the SF-RCC SPFx build, the SharePoint package, or the native SF-CCOIP census importer. UV is not presently used to create or manage it; do not install Python, UV, or Visual Studio Build Tools unless work on that optional feature specifically requires it.

## What was completed in this checkpoint

This is a single SF-RCC SharePoint-first application.  The intended four tabs are:

1. **Cardiac Hospital** — patient overview and quick census access.
2. **Patient Form** — primary patient-data entry workflow.
3. **Readmission Checklist** — checklist workflow.
4. **SF-CCOIP** — longitudinal registry/readmission operations and census-import workspace.

### SF-CCOIP census import

The fourth tab is now a native part of the SF-RCC SPFx web part. It no longer depends on a separately hosted Command Center iframe, standalone HTML file, browser developer tools, or an external registry API.

The import workflow:

- accepts the SurgiFlow census Excel workbook in the SF-CCOIP tab;
- parses the `appts` worksheet in the browser;
- previews creates, updates, warnings, and records planned for reconciliation;
- blocks an import with invalid/missing required data or unsupported SharePoint Unit values;
- on explicit confirmation, writes directly to the authoritative **SurgiFlow Master** SharePoint list using the signed-in user's permissions;
- creates or updates records using MRN + CSN as the census identity;
- marks active patients in the imported units as **Discharged** if they are absent from the newly confirmed authoritative file.

The importer sends no workbook data to a separate server and retains no patient data in browser storage. The same SharePoint list feeds the SF-RCC tabs, so an imported census is available to the rest of the application immediately after the SharePoint writes complete.

### Important production validation

Before the first production import, confirm that the **Unit** choice column in the production `SurgiFlow Master` list supports these internal values:

- `CPPCU`
- `Cardiac PCU`
- `CVPCU`
- `STPCU`
- `WT9 ACSU`

The preview checks the live choices and safely stops the import if any source unit is not supported. In particular, verify `WT9 ACSU`; it may not be present in an older list configuration.

### Excel source verified during development

The supplied census file was parsed locally without writing to SharePoint:

`C:\Users\tedmo\OneDrive - AdventHealth\aaReadmissions\data\SURGIFLOW__GT678WT8WT9__wNotes_GMLOS_20260816_2058.xlsx`

Result: 178 data rows, 0 parser errors, and the five units listed above. Do not commit census workbooks or patient data to Git.

## Node.js requirement — use Node 22, do not remove Node 24

SPFx 1.20.0 and the project build chain require Node.js 22 LTS for reliable installs and builds. Node 24 may remain installed for unrelated work; use the portable Node 22 runtime first in `PATH` whenever working in this project.

The home laptop uses:

`C:\Tools\node-v22.14.0-win-x64`

### Install portable Node 22 on the work laptop

1. Download the **Windows x64 ZIP** distribution for Node.js `v22.14.0` from the official Node.js distribution directory:
   `https://nodejs.org/dist/v22.14.0/`
2. Extract the ZIP so this file exists:
   `C:\Tools\node-v22.14.0-win-x64\node.exe`
3. Do **not** overwrite or uninstall the existing global Node 24 installation.
4. In every new PowerShell window used for this repository, put portable Node 22 first for the current session:

```powershell
$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path
node --version
npm --version
```

Expected Node output: `v22.14.0`.

Using the `PATH` command is important. Calling only `npm.cmd` by its full path can still let lifecycle scripts resolve a globally installed Node 24.

## Get the exact v1.0.1 project state

Use either the existing clone or a new clone. The commands below do not delete uncommitted work. If `git status --short` shows files you need to keep, copy or commit them before switching branches or tags.

### Existing work-laptop clone

```powershell
Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx
git status --short
git fetch origin --tags
git switch main
git pull --ff-only origin main
git status -sb
git log -1 --oneline --decorate
```

Expected checkpoint: `ebbe023 (HEAD -> main, tag: v1.0.1)`.

### New clone

```powershell
Set-Location C:\Projects
git clone https://github.com/ted1735/SF-CCOIP-REBUILD-SPFx.git
Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx
git fetch origin --tags
git switch main
git status -sb
```

### Release-only checkout (optional)

Use this only to inspect/build the immutable release. It creates a detached HEAD, so do not start new development changes there.

```powershell
git switch --detach v1.0.1
```

Return to normal development with:

```powershell
git switch main
```

## Install all local project dependencies

From the repository root, set Node 22 first and run each command below. `npm ci` installs exactly what is locked in Git. Do not run `npm audit fix` as part of setup; upgrades can alter the tested dependency tree.

```powershell
$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\packages\spfx
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' ci

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\clinical-tracking
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' ci

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\command-center
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' ci

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\registry-api
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' ci
```

The registry API may report existing dependency audit findings. They were not automatically changed in this checkpoint.

## Verify the build

### SPFx production package

```powershell
$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path
Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\packages\spfx
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' run build
```

Expected deployable output:

`C:\Projects\SF-CCOIP-REBUILD-SPFx\packages\spfx\sharepoint\solution\sf-rcc-cardiac-hospital.sppkg`

The SPFx package version is `1.0.1.0`; the npm package version is `1.0.1`.

### Other project checks

```powershell
$env:Path = 'C:\Tools\node-v22.14.0-win-x64;' + $env:Path

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\clinical-tracking
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' run lint

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\command-center
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' run lint

Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\registry-api
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' run check
```

## Run local development servers when needed

### Command Center

The Windows-incompatible `WRANGLER_LOG_PATH=...` script prefixes were removed in this release. With Node 22 first in PATH:

```powershell
Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx\apps\command-center
& 'C:\Tools\node-v22.14.0-win-x64\npm.cmd' run dev
```

If ports 3000 or 3001 are already in use, Vite/Vinext will select another available port (for example, 3002). This standalone development server is not required for the native SharePoint SF-CCOIP tab in v1.0.1.

### SPFx workbench/server

Use the repository's SPFx scripts and Node 22. The packaged `.sppkg` is the artifact intended for SharePoint App Catalog deployment; do not assume a local development server proves the authenticated production SharePoint list permissions.

## Deploy to SharePoint (when ready)

1. Upload `packages\spfx\sharepoint\solution\sf-rcc-cardiac-hospital.sppkg` to the appropriate SharePoint App Catalog.
2. Deploy/approve the package according to the organization’s App Catalog process.
3. Reload the SF-RCC page and verify all four tabs.
4. In SF-CCOIP, select a non-production/test census workbook first and review the preview counts.
5. Confirm once the preview is correct. This confirmation creates/updates the census and discharges missing active patients within the imported units.
6. Verify the Cardiac Hospital tab reflects the imported records.

The app uses the signed-in SharePoint user’s permissions. Ensure intended operators can read/write the `SurgiFlow Master` list before testing imports.

## Git and backup record

The following was completed on the home laptop:

- Commit created: `ebbe02341d92162f390f241281fdc9457bde18c3`
- Annotated Git tag created: `v1.0.1`
- `main` pushed to `origin`
- `v1.0.1` pushed to `origin`
- Remote verification confirmed both refs
- A complete, verified offline Git bundle was created:
  `C:\Projects\SF-CCOIP-backups\SF-CCOIP-REBUILD-SPFx-v1.0.1-ebbe023.bundle`
- Backup SHA-256:
  `EBD96F1A443B50634CDCBB19FE9B47731D0BD63F1B316B0B91923ED8EBB99C80`

To create a fresh backup on the work laptop after confirming the sync:

```powershell
New-Item -ItemType Directory -Force -Path C:\Projects\SF-CCOIP-backups | Out-Null
Set-Location C:\Projects\SF-CCOIP-REBUILD-SPFx
git bundle create C:\Projects\SF-CCOIP-backups\SF-CCOIP-REBUILD-SPFx-v1.0.1-ebbe023.bundle v1.0.1
git bundle verify C:\Projects\SF-CCOIP-backups\SF-CCOIP-REBUILD-SPFx-v1.0.1-ebbe023.bundle
Get-FileHash C:\Projects\SF-CCOIP-backups\SF-CCOIP-REBUILD-SPFx-v1.0.1-ebbe023.bundle -Algorithm SHA256
```

## Files changed in v1.0.1

Primary implementation files:

- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/censusImport.ts`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/CcoipView.tsx`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/CcoipView.module.scss`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/PnPPatientDataService.ts`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/dataService.ts`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/surgiflow/types.ts`
- `packages/spfx/src/webparts/sfRccCardiacHospital/components/SurgiFlowApp.tsx`
- `packages/spfx/config/package-solution.json`
- `packages/spfx/package.json` and `packages/spfx/package-lock.json`
- `apps/command-center/package.json`

## Safety notes for the next session

- Use Node 22 for every install/build/run in this repository.
- Keep Node 24 installed if other projects need it; do not make broad global runtime changes for this project.
- Do not commit workbooks, exports, screenshots containing patient information, `.env` files, tokens, or generated patient data.
- Check `git status --short` before staging; do not use a blanket Git add unless all displayed changes are intended.
- The importer’s authoritative reconciliation is deliberate: a confirmed census file discharges records missing from the newly imported file within its included units. Always review its preview before confirmation.
