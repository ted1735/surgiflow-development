@echo off
rem SF-RCC / SF-CCOIP temporary development PATH for the current CMD session.
rem Run this file directly from an existing CMD window. Do not launch it by double-clicking.

set "PATH=%USERPROFILE%\Tools\Node;%USERPROFILE%\Tools\Git\cmd;%USERPROFILE%\Tools\Python;%USERPROFILE%\Tools\Python\Scripts;%USERPROFILE%\.local\bin;%APPDATA%\npm;%PATH%"
set "SF_REPO=%USERPROFILE%\servers\SF-CCOIP-main"
set "SF_BACKUPS=%USERPROFILE%\servers\server-backups"
set "SF_SPFX=%SF_REPO%\packages\spfx"
set "SF_CLINICAL=%SF_REPO%\apps\clinical-tracking"
set "SF_REGISTRY=%SF_REPO%\apps\registry-api"
set "SF_COMMAND_CENTER=%SF_REPO%\apps\command-center"
set "SF_SHAREPOINT_DOCS=%SF_REPO%\docs\sharepoint"

cd /d "%SF_REPO%"

echo.
echo Temporary SF development environment loaded.
echo Repository: %CD%
echo.
where node 2>nul
node --version 2>nul
where npm 2>nul
npm --version 2>nul
where git 2>nul
git --version 2>nul
where python 2>nul
python --version 2>nul
where uv 2>nul
uv --version 2>nul
where codex 2>nul

echo.
echo IMPORTANT: Node must report v22.14.0 before npm install, build, or run commands.
echo These PATH and SF_* variables last only until this CMD window is closed.

doskey npx-spfx=cd /d "%SF_SPFX%" ^& npx
