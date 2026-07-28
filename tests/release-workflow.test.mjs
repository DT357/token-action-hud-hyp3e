import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  createFoundryReleasePayload,
  createReleasePlan,
  publishFoundryRelease,
  validateReleaseTag
} from '../tools/release.mjs'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  await readFile(path.join(moduleRoot, 'module.json'), 'utf8')
)

test('release plan derives the immutable tag and both GitHub assets', () => {
  const plan = createReleasePlan(manifest)

  assert.equal(plan.tag, 'v2026.07.28')
  assert.equal(plan.archivePath, 'dist/token-action-hud-hyp3e.zip')
  assert.equal(
    plan.releaseManifestUrl,
    'https://github.com/DT357/token-action-hud-hyp3e/releases/download/'
      + 'v2026.07.28/module.json'
  )
  assert.equal(plan.archiveUrl, manifest.download)
  assert.equal(
    plan.notesUrl,
    'https://github.com/DT357/token-action-hud-hyp3e/releases/tag/v2026.07.28'
  )
})

test('release tag validation rejects a tag that differs from module.json', () => {
  assert.doesNotThrow(() => validateReleaseTag(manifest, 'v2026.07.28'))
  assert.throws(
    () => validateReleaseTag(manifest, 'v2026.07.29'),
    /does not match module version/
  )
})

test('Foundry release payload uses an immutable release manifest URL', () => {
  assert.deepEqual(createFoundryReleasePayload(manifest, { dryRun: true }), {
    id: 'token-action-hud-hyp3e',
    'dry-run': true,
    release: {
      version: '2026.07.28',
      manifest:
        'https://github.com/DT357/token-action-hud-hyp3e/releases/download/'
        + 'v2026.07.28/module.json',
      notes:
        'https://github.com/DT357/token-action-hud-hyp3e/releases/tag/'
        + 'v2026.07.28',
      compatibility: {
        minimum: '13',
        verified: '14.365'
      }
    }
  })
})

test('Foundry publication sends the package token and expected payload', async () => {
  let request
  const fetchImpl = async (url, options) => {
    request = { url, options }
    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    })
  }

  await publishFoundryRelease({
    dryRun: false,
    fetchImpl,
    manifest,
    token: 'test-package-token'
  })

  assert.equal(
    request.url,
    'https://foundryvtt.com/_api/packages/release_version/'
  )
  assert.equal(request.options.headers.Authorization, 'test-package-token')
  assert.deepEqual(
    JSON.parse(request.options.body),
    createFoundryReleasePayload(manifest)
  )
})

test('GitHub workflow builds, attaches, and verifies both release assets', async () => {
  const workflow = await readFile(
    path.join(moduleRoot, '.github', 'workflows', 'release.yml'),
    'utf8'
  )

  assert.match(workflow, /runs-on:\s*windows-latest/)
  assert.match(workflow, /contents:\s*write/)
  assert.match(workflow, /npm run release:check/)
  assert.match(workflow, /release\.mjs verify-tag/)
  assert.match(workflow, /gh release create/)
  assert.match(workflow, /--latest/)
  assert.match(workflow, /\bmodule\.json\b/)
  assert.match(workflow, /dist\/token-action-hud-hyp3e\.zip/)
  assert.match(workflow, /release\.mjs verify-assets/)
  assert.match(workflow, /release\.mjs publish-foundry/)
})

test('package scripts expose safe release planning and tag publication', async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(moduleRoot, 'package.json'), 'utf8')
  )
  const launcher = await readFile(
    path.join(moduleRoot, 'tools', 'Start-Release.ps1'),
    'utf8'
  )

  assert.match(packageJson.scripts['release:plan'], /release\.mjs plan/)
  assert.match(packageJson.scripts['release:dry-run'], /Start-Release\.ps1 -DryRun/)
  assert.match(packageJson.scripts['release:start'], /Start-Release\.ps1/)
  assert.match(launcher, /git status --porcelain/)
  assert.match(launcher, /git push \$Remote "refs\/tags\/\$tag"/)
  assert.doesNotMatch(launcher, /git add/)
  assert.doesNotMatch(launcher, /git commit/)
})
