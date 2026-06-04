$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ext = Join-Path $root "extension"
$out = Join-Path $root "frontend\public\safelink-extension.zip"
if (Test-Path $out) { Remove-Item $out -Force }
Compress-Archive -Path (Join-Path $ext "*") -DestinationPath $out -Force
Write-Host "Generado: $out"
