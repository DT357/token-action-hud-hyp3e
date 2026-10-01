import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const generatedRoot = path.join(moduleRoot, 'foundry_module')

function stage(root, validateOnly = false) {
  return spawnSync(process.platform === 'win32' ? 'powershell.exe' : 'pwsh', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    path.join(moduleRoot, 'tools', 'Stage-Module.ps1'),
    '-StagingRoot', root,
    ...(validateOnly ? ['-ValidateOnly'] : [])
  ], { cwd: moduleRoot, encoding: 'utf8', windowsHide: true })
}

test('staging validates current bytes and replaces missing, changed, and stale files', async () => {
  await mkdir(generatedRoot, { recursive: true })
  const isolatedRoot = await mkdtemp(path.join(generatedRoot, 'staging-test-'))
  const candidate = path.join(isolatedRoot, 'token-action-hud-hyp3e')
  try {
    const first = stage(isolatedRoot)
    assert.equal(first.status, 0, first.stdout + first.stderr)
    assert.equal(stage(isolatedRoot, true).status, 0)
    assert.deepEqual(
      await readFile(path.join(candidate, 'scripts', 'roll-handler.mjs')),
      await readFile(path.join(moduleRoot, 'scripts', 'roll-handler.mjs'))
    )

    const extra = path.join(candidate, 'stale.txt')
    await writeFile(extra, 'stale generated file')
    assert.notEqual(stage(isolatedRoot, true).status, 0, 'extra file accepted')
    await rm(extra)

    const linkedDirectory = path.join(candidate, 'linked-scripts')
    await symlink(path.join(moduleRoot, 'scripts'), linkedDirectory,
      process.platform === 'win32' ? 'junction' : 'dir')
    assert.notEqual(stage(isolatedRoot, true).status, 0, 'linked directory accepted')
    assert.notEqual(stage(isolatedRoot).status, 0, 'linked directory replaced')
    await unlink(linkedDirectory)

    const manifestPath = path.join(candidate, 'module.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    manifest.version = '2000.01.01'
    await writeFile(manifestPath, JSON.stringify(manifest))
    assert.notEqual(stage(isolatedRoot, true).status, 0, 'version drift accepted')

    manifest.id = 'another-module'
    await writeFile(manifestPath, JSON.stringify(manifest))
    assert.notEqual(stage(isolatedRoot, true).status, 0, 'manifest identity drift accepted')

    await rm(path.join(candidate, 'lang', 'en.json'))
    assert.notEqual(stage(isolatedRoot, true).status, 0, 'missing file accepted')
    await writeFile(extra, 'stale generated file')
    const refreshed = stage(isolatedRoot)
    assert.equal(refreshed.status, 0, refreshed.stdout + refreshed.stderr)
    assert.equal(stage(isolatedRoot, true).status, 0)
    await assert.rejects(readFile(extra), { code: 'ENOENT' })
  } finally {
    assert.ok(isolatedRoot.startsWith(generatedRoot + path.sep))
    await rm(isolatedRoot, { recursive: true, force: true })
  }
})
