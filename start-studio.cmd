@echo off
setlocal
cd /d "%~dp0"
set "SIGN_NODE=node"
where node >nul 2>&1
if errorlevel 1 set "SIGN_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not "%SIGN_NODE%"=="node" if not exist "%SIGN_NODE%" (
  echo Node.js 22.13 or newer is required. Install Node.js, then try again.
  pause
  exit /b 1
)
if not exist "node_modules\three\build\three.module.js" (
  echo Dependencies are missing. Run npm install from this folder first.
  pause
  exit /b 1
)
if not exist "node_modules\@mediapipe\tasks-vision\vision_bundle.mjs" (
  echo Dependencies are incomplete. Run npm install from this folder first.
  pause
  exit /b 1
)
"%SIGN_NODE%" -e "const [v,m,p]=process.versions.node.split('.').map(Number);if(v<22||(v===22&&m<13)){console.error('Node.js 22.13 or newer is required.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
if not defined SIGN_PORT set "SIGN_PORT=3000"
echo Starting Aarav's studio at http://127.0.0.1:%SIGN_PORT%
echo Keep this window open while using the studio. Press Ctrl+C to stop.
"%SIGN_NODE%" server.mjs
pause
