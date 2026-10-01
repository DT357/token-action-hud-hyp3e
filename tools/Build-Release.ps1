[CmdletBinding()]
param(
  [string]$OutputPath,
  [switch]$Force
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

$moduleRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $moduleRoot 'dist\token-action-hud-hyp3e.zip'
} elseif (![IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath = Join-Path $moduleRoot $OutputPath
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)

if ([IO.Path]::GetExtension($OutputPath) -ne '.zip') {
  throw 'The release output path must use the .zip extension.'
}

$runtimeFiles = @(& (Join-Path $PSScriptRoot 'Get-ReleaseFiles.ps1'))

$moduleRootPrefix = "$moduleRoot$([IO.Path]::DirectorySeparatorChar)"
foreach ($relativePath in $runtimeFiles) {
  $sourcePath = [IO.Path]::GetFullPath((Join-Path $moduleRoot $relativePath))
  if (
    !$sourcePath.StartsWith(
      $moduleRootPrefix,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) {
    throw "Release source escaped the module root: $relativePath"
  }
  if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Required release file is missing: $relativePath"
  }
}

$manifestPath = Join-Path $moduleRoot 'module.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.id -ne 'token-action-hud-hyp3e') {
  throw "Unexpected module id: $($manifest.id)"
}
if ($manifest.version -notmatch '^\d{4}\.\d{2}\.\d{2}$') {
  throw "Manifest version is not a calendar version: $($manifest.version)"
}
$repositoryUrl = 'https://github.com/DT357/token-action-hud-hyp3e'
$expectedManifestUrl = "$repositoryUrl/releases/latest/download/module.json"
$expectedDownloadUrl =
  "$repositoryUrl/releases/download/v$($manifest.version)/token-action-hud-hyp3e.zip"
if (
  $manifest.url -ne $repositoryUrl -or
  $manifest.manifest -ne $expectedManifestUrl -or
  $manifest.download -ne $expectedDownloadUrl
) {
  throw 'Manifest repository or release URLs do not match the release version.'
}
$foundryCompatibilityMatches =
  $manifest.compatibility.minimum -eq '13' -and
  $manifest.compatibility.verified -eq '14.365'
if (!$foundryCompatibilityMatches) {
  throw 'Manifest Foundry compatibility does not match the release baseline.'
}
$coreDependencyMatches =
  $manifest.relationships.requires[0].id -eq 'token-action-hud-core' -and
  $manifest.relationships.requires[0].compatibility.minimum -eq '2.1.0'
if (!$coreDependencyMatches) {
  throw 'Token Action HUD Core dependency does not match the release baseline.'
}
$systemCompatibilityMatches =
  $manifest.relationships.systems[0].id -eq 'hyp3e' -and
  $manifest.relationships.systems[0].compatibility.minimum -eq '3.8.0'
if (!$systemCompatibilityMatches) {
  throw 'Hyperborea system compatibility does not match the release baseline.'
}

$runtimeEntries = $runtimeFiles |
  ForEach-Object { $_.Replace('\', '/') }
foreach ($modulePath in @(
  $manifest.esmodules
  $manifest.languages.path
  $manifest.license
  $manifest.readme
)) {
  if ($modulePath -notin $runtimeEntries) {
    throw "Manifest path is absent from the release archive: $modulePath"
  }
}

Get-Content -LiteralPath (Join-Path $moduleRoot 'lang\en.json') -Raw |
  ConvertFrom-Json |
  Out-Null

$outputDirectory = Split-Path -Parent $OutputPath
if (!(Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}
if (Test-Path -LiteralPath $OutputPath) {
  if (!$Force) {
    throw "Release archive already exists: $OutputPath. Use -Force to replace it."
  }
  Remove-Item -LiteralPath $OutputPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$versionParts = $manifest.version.Split('.')
$fixedTimestamp = [DateTimeOffset]::new(
  [int]$versionParts[0],
  [int]$versionParts[1],
  [int]$versionParts[2],
  0,
  0,
  0,
  [TimeSpan]::Zero
)
$archive = $null
$releaseError = $null
try {
  $archive = [IO.Compression.ZipFile]::Open(
    $OutputPath,
    [IO.Compression.ZipArchiveMode]::Create
  )

  foreach ($relativePath in $runtimeFiles) {
    $entryName = $relativePath.Replace('\', '/')
    $entry = $archive.CreateEntry(
      $entryName,
      [IO.Compression.CompressionLevel]::Optimal
    )
    $entry.LastWriteTime = $fixedTimestamp

    $sourceStream = $null
    $entryStream = $null
    try {
      $sourceStream = [IO.File]::OpenRead(
        (Join-Path $moduleRoot $relativePath)
      )
      $entryStream = $entry.Open()
      $sourceStream.CopyTo($entryStream)
    } finally {
      if ($entryStream) {
        $entryStream.Dispose()
      }
      if ($sourceStream) {
        $sourceStream.Dispose()
      }
    }
  }
} catch {
  $releaseError = $_
} finally {
  if ($archive) {
    $archive.Dispose()
  }
}
if ($releaseError) {
  if (Test-Path -LiteralPath $OutputPath) {
    Remove-Item -LiteralPath $OutputPath -Force
  }
  throw $releaseError
}

$archive = [IO.Compression.ZipFile]::OpenRead($OutputPath)
try {
  $actualEntries = @(
    $archive.Entries |
      ForEach-Object { $_.FullName } |
      Sort-Object
  )
  $expectedEntries = @($runtimeEntries | Sort-Object)
  if (Compare-Object $expectedEntries $actualEntries) {
    throw 'Release archive contents do not match the runtime allowlist.'
  }
  if (!$archive.GetEntry('module.json')) {
    throw 'Release archive does not contain module.json at its root.'
  }
} finally {
  $archive.Dispose()
}

$archiveInfo = Get-Item -LiteralPath $OutputPath
$archiveHashAlgorithm = [Security.Cryptography.SHA256]::Create()
$archiveHashStream = $null
try {
  $archiveHashStream = [IO.File]::OpenRead($OutputPath)
  $archiveHashBytes = $archiveHashAlgorithm.ComputeHash($archiveHashStream)
  $archiveHash = [BitConverter]::ToString($archiveHashBytes).Replace('-', '')
} finally {
  if ($archiveHashStream) {
    $archiveHashStream.Dispose()
  }
  $archiveHashAlgorithm.Dispose()
}
Write-Output "Release archive: $($archiveInfo.FullName)"
Write-Output "Archive size: $($archiveInfo.Length) bytes"
Write-Output "SHA-256: $archiveHash"
