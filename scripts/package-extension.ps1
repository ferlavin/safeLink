$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$script = Join-Path $root "scripts\package-extension.mjs"
node $script
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
