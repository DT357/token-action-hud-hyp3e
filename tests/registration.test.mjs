import assert from 'node:assert/strict'
import test from 'node:test'

function createFoundryHarness(systemId = 'hyp3e') {
  const onceHooks = new Map()
  const hookCalls = []
  const notifications = []
  const systemModule = {
    id: 'token-action-hud-hyp3e',
    api: null
  }

  globalThis.Hooks = {
    once(hookName, callback) {
      onceHooks.set(hookName, callback)
    },
    callAll(hookName, ...args) {
      hookCalls.push({ hookName, args })
    }
  }
  globalThis.game = {
    i18n: {
      localize: (key) => ({
        'tokenActionHudHyp3e.groups.abilities': 'Abilities',
        'tokenActionHudHyp3e.groups.attributeChecks': 'Attribute Checks',
        'tokenActionHudHyp3e.groups.combat': 'Combat',
        'tokenActionHudHyp3e.groups.features': 'Features',
        'tokenActionHudHyp3e.groups.inventory': 'Inventory',
        'tokenActionHudHyp3e.groups.lightSources': 'Light Sources',
        'tokenActionHudHyp3e.groups.npcChecks': 'NPC Checks',
        'tokenActionHudHyp3e.groups.saves': 'Saving Throws',
        'tokenActionHudHyp3e.groups.spells': 'Spells',
        'tokenActionHudHyp3e.groups.tasks': 'Tasks',
        'tokenActionHudHyp3e.groups.weapons': 'Weapons',
        'tokenActionHudHyp3e.rollHandlers.core': 'Core'
      })[key] ?? key
    },
    modules: new Map([
      ['token-action-hud-hyp3e', systemModule]
    ]),
    system: {
      id: systemId
    }
  }
  globalThis.ui = {
    notifications: {
      error(message) {
        notifications.push(message)
      }
    }
  }

  return {
    hookCalls,
    notifications,
    onceHooks,
    systemModule
  }
}

async function importFreshMain() {
  const moduleUrl = new URL('../scripts/main.mjs', import.meta.url)
  moduleUrl.searchParams.set('phase0-test', `${Date.now()}-${Math.random()}`)
  return import(moduleUrl.href)
}

test('Core can instantiate the registered Hyperborea system manager', async () => {
  const harness = createFoundryHarness()

  class CoreSystemManager {}
  class CoreActionHandler {}
  class CoreRollHandler {}
  class CoreLogger {
    static error() {}
  }

  const coreModule = {
    id: 'token-action-hud-core',
    version: '2.1.1',
    api: {
      ActionHandler: CoreActionHandler,
      Logger: CoreLogger,
      RollHandler: CoreRollHandler,
      SystemManager: CoreSystemManager
    }
  }

  await importFreshMain()

  const apiReadyCallback = harness.onceHooks.get('tokenActionHudCoreApiReady')
  assert.equal(typeof apiReadyCallback, 'function')
  assert.equal(apiReadyCallback(coreModule), true)

  assert.equal(harness.systemModule.api.requiredCoreModuleVersion, '2.1')
  assert.equal(typeof harness.systemModule.api.SystemManager, 'function')

  const manager = new harness.systemModule.api.SystemManager(coreModule)
  assert.ok(manager instanceof CoreSystemManager)
  assert.ok(manager.getActionHandler() instanceof CoreActionHandler)
  assert.ok(manager.getRollHandler('core') instanceof CoreRollHandler)
  assert.deepEqual(manager.getAvailableRollHandlers(), { core: 'Core' })

  const defaults = await manager.registerDefaults()
  assert.deepEqual(defaults.layout.map(({ id, name }) => ({ id, name })), [
    { id: 'combat', name: 'Combat' },
    { id: 'abilities', name: 'Abilities' },
    { id: 'spells', name: 'Spells' },
    { id: 'inventory', name: 'Inventory' }
  ])
  assert.deepEqual(
    defaults.layout.map(({ groups }) => groups.map(({ id }) => id)),
    [
      ['weapons', 'saves'],
      ['attribute-checks', 'tasks', 'features', 'npc-checks'],
      [],
      ['light-sources']
    ]
  )
  assert.deepEqual(defaults.groups.map(({ id }) => id), [
    'weapons',
    'saves',
    'attribute-checks',
    'tasks',
    'features',
    'npc-checks',
    'light-sources'
  ])

  assert.equal(harness.hookCalls.length, 1)
  assert.equal(harness.hookCalls[0].hookName, 'tokenActionHudSystemReady')
  assert.equal(harness.hookCalls[0].args[0], harness.systemModule)
  assert.deepEqual(harness.notifications, [])
})

test('registration quietly ignores worlds using another system', async () => {
  const harness = createFoundryHarness('not-hyp3e')
  const { registerSystemModule } = await importFreshMain()

  assert.equal(registerSystemModule({ api: {} }), false)
  assert.equal(harness.systemModule.api, null)
  assert.deepEqual(harness.hookCalls, [])
  assert.deepEqual(harness.notifications, [])
})

test('registration fails cleanly when the Core API is incomplete', async () => {
  const harness = createFoundryHarness()
  const { registerSystemModule } = await importFreshMain()
  const originalConsoleError = console.error
  const loggedErrors = []
  console.error = (...args) => loggedErrors.push(args)

  try {
    assert.equal(registerSystemModule({ api: {} }), false)
  } finally {
    console.error = originalConsoleError
  }

  assert.equal(harness.systemModule.api, null)
  assert.deepEqual(harness.hookCalls, [])
  assert.equal(harness.notifications.length, 1)
  assert.equal(loggedErrors.length, 1)
})
