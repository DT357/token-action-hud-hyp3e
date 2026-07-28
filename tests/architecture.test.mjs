import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const scriptsRoot = path.join(moduleRoot, 'scripts')

async function getSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? getSourceFiles(entryPath) : entryPath
  }))

  return files.flat().filter((filePath) => filePath.endsWith('.mjs'))
}

test('module-owned source uses no legacy Foundry applications, dialogs, or jQuery', async () => {
  const sourceFiles = await getSourceFiles(scriptsRoot)
  assert.ok(sourceFiles.length > 0, 'expected module source files')

  const forbiddenPatterns = [
    {
      label: 'legacy Application or FormApplication reference',
      pattern: /(?<!\w)(?:(?:globalThis|foundry)\.)?(?:Application|FormApplication)\b/
    },
    {
      label: 'legacy Dialog reference',
      pattern: /(?<!\w)(?:(?:globalThis|foundry)\.)?Dialog\b/
    },
    {
      label: 'jQuery DOM or event handling',
      pattern: /\bjQuery\b|(?:^|[^\w$])\$(?![\w{])/
    }
  ]

  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, 'utf8')
    for (const { label, pattern } of forbiddenPatterns) {
      assert.doesNotMatch(source, pattern, `${label} found in ${path.relative(moduleRoot, sourceFile)}`)
    }
  }
})
