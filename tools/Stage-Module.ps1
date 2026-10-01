[CmdletBinding()]
param([string]$StagingRoot, [switch]$ValidateOnly)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'
$moduleRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$generatedRoot = Join-Path $moduleRoot 'foundry_module'
if ([string]::IsNullOrWhiteSpace($StagingRoot)) { $StagingRoot = $generatedRoot }
$StagingRoot = [IO.Path]::GetFullPath($StagingRoot)
$packageId = 'token-action-hud-hyp3e'
$destination = Join-Path $StagingRoot $packageId
$runtimeFiles = @(& (Join-Path $PSScriptRoot 'Get-ReleaseFiles.ps1'))

function Assert-GeneratedPath([string]$Path) {
  $absolute = [IO.Path]::GetFullPath($Path)
  if ($absolute -ne $generatedRoot -and !$absolute.StartsWith(
    "$generatedRoot\", [StringComparison]::OrdinalIgnoreCase
  )) { throw "Staging path escaped the generated directory: $absolute" }
}

function Assert-PlainPath([string]$Path) {
  $ancestor = [IO.Path]::GetFullPath($Path)
  while ($ancestor -and $ancestor -ne $moduleRoot) {
    if (Test-Path -LiteralPath $ancestor) {
      $entry = Get-Item -LiteralPath $ancestor -Force
      if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) {
        throw "Staging does not accept reparse points: $ancestor"
      }
    }
    $ancestor = Split-Path -Parent $ancestor
  }
}

function Get-PlainFiles([string]$Directory) {
  foreach ($entry in Get-ChildItem -LiteralPath $Directory -Force) {
    if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) {
      throw "Staging does not accept reparse points: $($entry.FullName)"
    }
    if ($entry.PSIsContainer) { Get-PlainFiles $entry.FullName }
    elseif ($entry -is [IO.FileInfo]) { $entry.FullName }
    else { throw "Staging does not accept special files: $($entry.FullName)" }
  }
}

function Assert-Staging([string]$Directory) {
  Assert-GeneratedPath $Directory
  Assert-PlainPath $Directory
  if (!(Test-Path -LiteralPath $Directory -PathType Container)) {
    throw "Staged package is missing: $Directory"
  }
  $actualFiles = @(Get-PlainFiles $Directory | ForEach-Object {
    $_.Substring($Directory.Length + 1)
  } | Sort-Object)
  if (Compare-Object @($runtimeFiles | Sort-Object) $actualFiles) {
    throw 'Staged files do not match the release allowlist.'
  }
  foreach ($relativePath in $runtimeFiles) {
    $sourceBytes = [Convert]::ToBase64String([IO.File]::ReadAllBytes(
      (Join-Path $moduleRoot $relativePath)
    ))
    $stagedBytes = [Convert]::ToBase64String([IO.File]::ReadAllBytes(
      (Join-Path $Directory $relativePath)
    ))
    if ($sourceBytes -cne $stagedBytes) {
      throw "Staged bytes differ from source: $relativePath"
    }
  }
}

Assert-GeneratedPath $StagingRoot
Assert-PlainPath $StagingRoot
foreach ($relativePath in $runtimeFiles) {
  Assert-PlainPath (Join-Path $moduleRoot $relativePath)
}
$manifest = Get-Content -LiteralPath (Join-Path $moduleRoot 'module.json') -Raw |
  ConvertFrom-Json
if ($manifest.id -ne $packageId) { throw "Unexpected module id: $($manifest.id)" }
if ($ValidateOnly) {
  Assert-Staging $destination
  Write-Output "Validated staging: $destination ($($manifest.version))"
  exit
}

New-Item -ItemType Directory -Path $StagingRoot -Force | Out-Null
$temporary = Join-Path $StagingRoot "stage-$([Guid]::NewGuid().ToString('N'))"
$backup = Join-Path $StagingRoot "previous-$([Guid]::NewGuid().ToString('N'))"
Assert-GeneratedPath $temporary
Assert-GeneratedPath $backup
Assert-GeneratedPath $destination
$replacementComplete = $false
try {
  New-Item -ItemType Directory -Path $temporary | Out-Null
  foreach ($relativePath in $runtimeFiles) {
    $target = Join-Path $temporary $relativePath
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $moduleRoot $relativePath) -Destination $target
  }
  Assert-Staging $temporary
  if (Test-Path -LiteralPath $destination) {
    Assert-PlainPath $destination
    Get-PlainFiles $destination | Out-Null
    Move-Item -LiteralPath $destination -Destination $backup
  }
  try {
    Move-Item -LiteralPath $temporary -Destination $destination
    Assert-Staging $destination
    $replacementComplete = $true
  } catch {
    if (Test-Path -LiteralPath $destination) {
      Assert-PlainPath $destination
      Get-PlainFiles $destination | Out-Null
      Remove-Item -LiteralPath $destination -Recurse -Force
    }
    if (Test-Path -LiteralPath $backup) {
      Move-Item -LiteralPath $backup -Destination $destination
    }
    throw
  }
} finally {
  $cleanupDirectories = @($temporary)
  if ($replacementComplete) { $cleanupDirectories += $backup }
  foreach ($ownedDirectory in $cleanupDirectories) {
    if (Test-Path -LiteralPath $ownedDirectory) {
      Assert-GeneratedPath $ownedDirectory
      Assert-PlainPath $ownedDirectory
      Get-PlainFiles $ownedDirectory | Out-Null
      Remove-Item -LiteralPath $ownedDirectory -Recurse -Force
    }
  }
}
Write-Output "Refreshed staging: $destination ($($manifest.version))"
