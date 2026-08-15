# rebuild.ps1
# One-click rebuild of the client bundle + reinstall into the dsh web profile.
# Portable: runs from anywhere (paths are relative to this script's location).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File <repo>\rebuild.ps1
#   .\rebuild.ps1

$ErrorActionPreference = "Stop"

$Profile = "web"   # dsh profile name

Write-Host ""
Write-Host "==> [1/2] Rebuilding lib/client.js (inlining Mermaid engine)..." -ForegroundColor Cyan
node "$PSScriptRoot\build\build.js"
if ($LASTEXITCODE -ne 0) { throw "build.js failed with exit code $LASTEXITCODE" }

Write-Host ""
Write-Host "==> [2/2] Reinstalling into dsh profile '$Profile' ..." -ForegroundColor Cyan
dsh plugin --profile $Profile install
if ($LASTEXITCODE -ne 0) { throw "dsh plugin install failed with exit code $LASTEXITCODE" }

Write-Host ""
Write-Host "==> Done. Refresh the browser (Ctrl+Shift+R) to load the new bundle." -ForegroundColor Green
Write-Host ""
