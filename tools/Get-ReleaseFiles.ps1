$moduleRoot = Split-Path -Parent $PSScriptRoot
@('LICENSE', 'README.md', 'module.json', 'lang\en.json')
Get-ChildItem -LiteralPath (Join-Path $moduleRoot 'scripts') -File -Filter '*.mjs' |
  Sort-Object Name |
  ForEach-Object { "scripts\$($_.Name)" }
