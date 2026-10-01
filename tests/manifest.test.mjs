import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(moduleRoot, 'module.json')

test('module manifest declares the settled Phase 0 metadata', async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  assert.equal(manifest.id, 'token-action-hud-hyp3e')
  assert.equal(manifest.title, 'Token Action HUD Hyperborea 3e')
  assert.equal(manifest.version, '2026.10.01')
  assert.match(manifest.version, /^\d{4}\.\d{2}\.\d{2}$/)
  assert.deepEqual(manifest.authors, [
    {
      name: 'Dan Tesch',
      url: 'https://github.com/DT357'
    }
  ])
  assert.deepEqual(manifest.compatibility, {
    minimum: '13',
    verified: '14.365'
  })
  assert.equal(Object.hasOwn(manifest.compatibility, 'maximum'), false)
  assert.deepEqual(manifest.esmodules, ['scripts/main.mjs'])
  assert.deepEqual(manifest.languages, [
    {
      lang: 'en',
      name: 'English',
      path: 'lang/en.json'
    }
  ])

  assert.deepEqual(manifest.relationships.systems, [
    {
      id: 'hyp3e',
      compatibility: {
        minimum: '3.8.0'
      }
    }
  ])
  assert.deepEqual(manifest.relationships.requires, [
    {
      id: 'token-action-hud-core',
      compatibility: {
        minimum: '2.1.0'
      }
    }
  ])

  assert.equal(manifest.url, 'https://github.com/DT357/token-action-hud-hyp3e')
  assert.equal(
    manifest.manifest,
    'https://github.com/DT357/token-action-hud-hyp3e/releases/latest/download/module.json'
  )
  assert.equal(
    manifest.download,
    'https://github.com/DT357/token-action-hud-hyp3e/releases/download/v2026.10.01/token-action-hud-hyp3e.zip'
  )
  assert.equal(manifest.license, 'LICENSE')
  assert.equal(manifest.readme, 'README.md')
  assert.equal(manifest.bugs, 'https://github.com/DT357/token-action-hud-hyp3e/issues')

  for (const relativePath of [
    ...manifest.esmodules,
    ...manifest.languages.map(({ path: languagePath }) => languagePath),
    manifest.license,
    manifest.readme
  ]) {
    await access(path.join(moduleRoot, relativePath))
  }
})
