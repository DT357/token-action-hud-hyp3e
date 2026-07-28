import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildScript = path.join(moduleRoot, 'tools', 'Build-Release.ps1')
const powershell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh'

const expectedEntries = [
  'LICENSE',
  'README.md',
  'lang/en.json',
  'module.json',
  'scripts/action-handler.mjs',
  'scripts/constants.mjs',
  'scripts/defaults.mjs',
  'scripts/main.mjs',
  'scripts/roll-handler.mjs',
  'scripts/system-manager.mjs'
]

function listZipEntries(archive) {
  let endOffset = archive.length - 22
  const minimumOffset = Math.max(0, archive.length - 65_557)
  while (
    endOffset >= minimumOffset
    && archive.readUInt32LE(endOffset) !== 0x06054b50
  ) {
    endOffset -= 1
  }
  assert.ok(endOffset >= minimumOffset, 'ZIP end record was not found')

  const entryCount = archive.readUInt16LE(endOffset + 10)
  let entryOffset = archive.readUInt32LE(endOffset + 16)
  const entries = []

  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(
      archive.readUInt32LE(entryOffset),
      0x02014b50,
      'invalid ZIP central directory entry'
    )
    const nameLength = archive.readUInt16LE(entryOffset + 28)
    const extraLength = archive.readUInt16LE(entryOffset + 30)
    const commentLength = archive.readUInt16LE(entryOffset + 32)
    const nameStart = entryOffset + 46
    entries.push(
      archive.subarray(nameStart, nameStart + nameLength).toString('utf8')
    )
    entryOffset = nameStart + nameLength + extraLength + commentLength
  }

  return entries
}

function buildArchive(outputPath) {
  return spawnSync(powershell, [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    buildScript,
    '-OutputPath',
    outputPath
  ], {
    cwd: moduleRoot,
    encoding: 'utf8',
    windowsHide: true
  })
}

test('release hashing does not depend on the Get-FileHash cmdlet', async () => {
  const script = await readFile(buildScript, 'utf8')

  assert.doesNotMatch(script, /\bGet-FileHash\b/)
  assert.match(script, /Security\.Cryptography\.SHA256/)
})

test('release archives are deterministic and contain only runtime files', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'token-action-hud-hyp3e-release-')
  )
  const firstArchivePath = path.join(temporaryDirectory, 'first.zip')
  const secondArchivePath = path.join(temporaryDirectory, 'second.zip')

  try {
    const firstBuild = buildArchive(firstArchivePath)
    assert.equal(
      firstBuild.status,
      0,
      `first release build failed:\n${firstBuild.stdout}\n${firstBuild.stderr}`
    )
    const secondBuild = buildArchive(secondArchivePath)
    assert.equal(
      secondBuild.status,
      0,
      `second release build failed:\n${secondBuild.stdout}\n${secondBuild.stderr}`
    )

    const firstArchive = await readFile(firstArchivePath)
    const secondArchive = await readFile(secondArchivePath)
    assert.deepEqual(firstArchive, secondArchive)
    assert.deepEqual(listZipEntries(firstArchive).sort(), expectedEntries)
  } finally {
    await rm(temporaryDirectory, {
      force: true,
      recursive: true
    })
  }
})
