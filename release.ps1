# release.ps1 - one-click release: rebuild -> commit -> version bump -> publish -> push.
#
# Usage (from anywhere):
#   .\release.ps1              # patch bump: 0.1.0 -> 0.1.1
#   .\release.ps1 minor        # 0.1.1 -> 0.2.0
#   .\release.ps1 major        # 0.2.0 -> 1.0.0
#   .\release.ps1 0.2.0        # explicit version
#   .\release.ps1 -SkipPublish # dry run: preflight + rebuild + commit only
#
# Requires: node, git, npm (logged in to registry.npmjs.org).

param(
  [string]$Version = "patch",
  [switch]$SkipPublish
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

# --- preflight: npm login ---
$me = npm whoami --registry https://registry.npmjs.org 2>$null
if ($LASTEXITCODE -ne 0 -or -not $me) {
  throw "not logged in to npmjs.org - run: npm login --registry https://registry.npmjs.org"
}
Write-Host "logged in to npmjs.org as: $me"

# --- 1/5 rebuild ---
Write-Host ""
Write-Host "==> [1/5] Rebuild lib/client.js ..." -ForegroundColor Cyan
node "$Root\build\build.js"
if ($LASTEXITCODE -ne 0) { throw "build.js failed (exit $LASTEXITCODE)" }

# --- 2/5 commit ---
Write-Host "==> [2/5] Commit changes ..." -ForegroundColor Cyan
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Rebuild client bundle"
  if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
  Write-Host "    committed."
} else {
  Write-Host "    nothing to commit."
}

if ($SkipPublish) {
  Write-Host ""
  Write-Host "==> Dry run complete (skipped version bump / publish / push)." -ForegroundColor Yellow
  Write-Host ""
  exit 0
}

# --- 3/5 version bump ---
Write-Host "==> [3/5] Version bump ($Version) ..." -ForegroundColor Cyan
npm version $Version
if ($LASTEXITCODE -ne 0) { throw "npm version failed (exit $LASTEXITCODE)" }

# --- 4/5 publish ---
Write-Host "==> [4/5] Publish to npm ..." -ForegroundColor Cyan
npm publish --registry https://registry.npmjs.org --access public
if ($LASTEXITCODE -ne 0) { throw "npm publish failed (exit $LASTEXITCODE)" }

# --- 5/5 push ---
Write-Host "==> [5/5] Push to GitHub ..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
git push --tags
if ($LASTEXITCODE -ne 0) { throw "git push --tags failed" }

$pub = npm view @moyiyaoyue/dsh-client-ui-mermaid version --registry https://registry.npmjs.org
Write-Host ""
Write-Host "==> Released @moyiyaoyue/dsh-client-ui-mermaid@$pub" -ForegroundColor Green
Write-Host ""
