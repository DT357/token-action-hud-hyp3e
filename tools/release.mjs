import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const foundryReleaseApi =
  'https://foundryvtt.com/_api/packages/release_version/'
const repositoryUrl = 'https://github.com/DT357/token-action-hud-hyp3e'

function requireString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`module.json ${field} must be a non-empty string`)
  }
  return value
}

export function createReleasePlan(manifest) {
  const id = requireString(manifest?.id, 'id')
  const title = requireString(manifest?.title, 'title')
  const version = requireString(manifest?.version, 'version')

  if (id !== 'token-action-hud-hyp3e') {
    throw new Error(`Unexpected module id: ${id}`)
  }
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(version)) {
    throw new Error(`Module version is not YYYY.MM.DD: ${version}`)
  }
  if (manifest.url !== repositoryUrl) {
    throw new Error(`Module repository URL must be ${repositoryUrl}`)
  }

  const tag = `v${version}`
  const releaseBase = `${repositoryUrl}/releases`
  const releaseManifestUrl = `${releaseBase}/download/${tag}/module.json`
  const archiveUrl =
    `${releaseBase}/download/${tag}/token-action-hud-hyp3e.zip`
  const latestManifestUrl = `${releaseBase}/latest/download/module.json`

  if (manifest.manifest !== latestManifestUrl) {
    throw new Error(
      `Module manifest URL must be ${latestManifestUrl}`
    )
  }
  if (manifest.download !== archiveUrl) {
    throw new Error(`Module download URL must be ${archiveUrl}`)
  }

  return {
    archivePath: 'dist/token-action-hud-hyp3e.zip',
    archiveUrl,
    releaseManifestUrl,
    releaseTitle: `${title} ${tag}`,
    notesUrl: `${releaseBase}/tag/${tag}`,
    tag
  }
}

export function validateReleaseTag(manifest, tag) {
  const expectedTag = createReleasePlan(manifest).tag
  if (tag !== expectedTag) {
    throw new Error(
      `Release tag ${tag} does not match module version ${manifest.version} `
      + `(expected ${expectedTag})`
    )
  }
  return expectedTag
}

export function createFoundryReleasePayload(
  manifest,
  { dryRun = false } = {}
) {
  const plan = createReleasePlan(manifest)
  const minimum = requireString(
    manifest?.compatibility?.minimum,
    'compatibility.minimum'
  )
  const verified = requireString(
    manifest?.compatibility?.verified,
    'compatibility.verified'
  )
  const payload = {
    id: manifest.id,
    release: {
      version: manifest.version,
      manifest: plan.releaseManifestUrl,
      notes: plan.notesUrl,
      compatibility: {
        minimum,
        verified
      }
    }
  }

  if (dryRun) {
    payload['dry-run'] = true
  }
  return payload
}

export async function publishFoundryRelease({
  dryRun = false,
  fetchImpl = globalThis.fetch,
  manifest,
  token
}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A Fetch API implementation is required')
  }
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('FOUNDRY_PACKAGE_RELEASE_TOKEN is required')
  }

  const response = await fetchImpl(foundryReleaseApi, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      createFoundryReleasePayload(manifest, { dryRun })
    )
  })
  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(
      `Foundry release API returned ${response.status}: ${responseText}`
    )
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

async function fetchAsset(url, attempts = 6) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow' })
      if (response.ok) {
        return Buffer.from(await response.arrayBuffer())
      }
      lastError = new Error(`${url} returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, 2_000))
    }
  }

  throw lastError
}

export async function verifyReleaseAssets(manifest) {
  const plan = createReleasePlan(manifest)
  const assets = [
    {
      label: 'module.json',
      localPath: path.join(moduleRoot, 'module.json'),
      url: plan.releaseManifestUrl
    },
    {
      label: 'release archive',
      localPath: path.join(moduleRoot, ...plan.archivePath.split('/')),
      url: plan.archiveUrl
    }
  ]

  for (const asset of assets) {
    const [localBytes, publicBytes] = await Promise.all([
      readFile(asset.localPath),
      fetchAsset(asset.url)
    ])
    if (!localBytes.equals(publicBytes)) {
      throw new Error(
        `Public ${asset.label} differs from the locally validated file`
      )
    }
  }
}

async function readManifest() {
  return JSON.parse(
    await readFile(path.join(moduleRoot, 'module.json'), 'utf8')
  )
}

function printUsage() {
  console.error(
    'Usage: node tools/release.mjs '
    + '<plan|verify-tag TAG|verify-assets|publish-foundry [--dry-run]>'
  )
}

async function runCli() {
  const [command, argument] = process.argv.slice(2)
  const manifest = await readManifest()

  switch (command) {
    case 'plan':
      console.log(JSON.stringify(createReleasePlan(manifest), null, 2))
      break
    case 'verify-tag':
      if (!argument) {
        throw new Error('verify-tag requires a tag argument')
      }
      console.log(`Validated release tag ${validateReleaseTag(manifest, argument)}`)
      break
    case 'verify-assets':
      await verifyReleaseAssets(manifest)
      console.log('Verified public module.json and release archive')
      break
    case 'publish-foundry': {
      const dryRun = argument === '--dry-run'
      if (argument && !dryRun) {
        throw new Error(`Unknown publish-foundry argument: ${argument}`)
      }
      const result = await publishFoundryRelease({
        dryRun,
        manifest,
        token: process.env.FOUNDRY_PACKAGE_RELEASE_TOKEN
      })
      console.log(
        `Foundry package release ${dryRun ? 'dry run' : 'registration'} succeeded`
      )
      if (result) {
        console.log(JSON.stringify(result, null, 2))
      }
      break
    }
    default:
      printUsage()
      process.exitCode = 1
  }
}

if (
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runCli().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
