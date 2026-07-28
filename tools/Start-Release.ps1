[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$Remote = 'origin',
  [string]$Branch = 'main'
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

$moduleRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $moduleRoot 'module.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$tag = "v$($manifest.version)"
$expectedRepository = 'github.com[:/]DT357/token-action-hud-hyp3e(?:\.git)?$'
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source

Push-Location $moduleRoot
try {
  Write-Output "Running the complete release gate for $tag..."
  & $npm run release:check
  if ($LASTEXITCODE -ne 0) {
    throw 'The release gate failed.'
  }

  & node tools/release.mjs verify-tag $tag
  if ($LASTEXITCODE -ne 0) {
    throw 'The manifest and release tag do not match.'
  }

  if (!(Test-Path -LiteralPath (Join-Path $moduleRoot '.git'))) {
    if ($DryRun) {
      Write-Output ''
      Write-Output 'Dry run complete. This directory is not yet a Git repository.'
      Write-Output "After repository setup, the live command will push tag $tag."
      Write-Output 'GitHub Actions will create the release, attach module.json and'
      Write-Output 'dist/token-action-hud-hyp3e.zip, and verify both public assets.'
      exit 0
    }
    throw 'The module directory is not a Git repository. Use -DryRun to validate locally.'
  }

  $repositoryRoot = & git rev-parse --show-toplevel
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not resolve the Git repository root.'
  }
  $resolvedRepositoryRoot = [IO.Path]::GetFullPath($repositoryRoot)
  if (
    !$resolvedRepositoryRoot.Equals(
      $moduleRoot,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) {
    throw 'The module directory must be the root of its Git repository.'
  }

  $status = & git status --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not inspect the Git working tree.'
  }
  if ($status) {
    throw 'The Git working tree must be clean before a release tag is created.'
  }

  $currentBranch = & git branch --show-current
  if ($LASTEXITCODE -ne 0 -or $currentBranch -ne $Branch) {
    throw "Release must run from branch '$Branch'; current branch is '$currentBranch'."
  }

  $remoteUrl = & git remote get-url $Remote
  if ($LASTEXITCODE -ne 0 -or $remoteUrl -notmatch $expectedRepository) {
    throw "Remote '$Remote' does not target DT357/token-action-hud-hyp3e."
  }

  & git fetch $Remote $Branch --tags
  if ($LASTEXITCODE -ne 0) {
    throw "Could not fetch '$Remote/$Branch'."
  }

  $localCommit = & git rev-parse HEAD
  $remoteCommit = & git rev-parse "$Remote/$Branch"
  if (
    $LASTEXITCODE -ne 0 -or
    [string]::IsNullOrWhiteSpace($localCommit) -or
    $localCommit -ne $remoteCommit
  ) {
    throw "Local HEAD must exactly match '$Remote/$Branch' before release."
  }

  & git show-ref --verify --quiet "refs/tags/$tag"
  if ($LASTEXITCODE -eq 0) {
    throw "Local tag already exists: $tag"
  }
  if ($LASTEXITCODE -ne 1) {
    throw "Could not inspect local tag $tag."
  }

  & git ls-remote --exit-code --tags $Remote "refs/tags/$tag" | Out-Null
  if ($LASTEXITCODE -eq 0) {
    throw "Remote tag already exists: $tag"
  }
  if ($LASTEXITCODE -ne 2) {
    throw "Could not inspect remote tag $tag."
  }

  if ($DryRun) {
    Write-Output ''
    Write-Output "Dry run complete. Ready to create and push $tag from $localCommit."
    exit 0
  }

  & git tag --annotate $tag --message "Release $tag"
  if ($LASTEXITCODE -ne 0) {
    throw "Could not create tag $tag."
  }

  & git push $Remote "refs/tags/$tag"
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Tag $tag exists locally but could not be pushed."
    throw "Could not push tag $tag."
  }

  Write-Output "Pushed $tag. Monitor the GitHub Release workflow for completion."
} finally {
  Pop-Location
}
