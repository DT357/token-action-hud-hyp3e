import assert from 'node:assert/strict'
import { setImmediate as waitForImmediate } from 'node:timers/promises'
import test from 'node:test'

import { createRollHandlerClass } from '../scripts/roll-handler.mjs'

const translations = {
  'HYP3E.attributes.cha.reaction': 'Reaction',
  'HYP3E.attributes.con.traumaSurvive': 'Trauma Survival',
  'HYP3E.attributes.int.check': 'Intelligence Check',
  'HYP3E.attributes.str.test': 'Strength Test',
  'HYP3E.loyalty': 'Loyalty',
  'HYP3E.morale': 'Morale',
  'HYP3E.dataLabel.avoidanceSave': 'Save vs. Avoidance',
  'HYP3E.dataLabel.deathSave': 'Save vs. Death',
  'HYP3E.dataLabel.deviceSave': 'Save vs. Device',
  'HYP3E.dataLabel.sorcerySave': 'Save vs. Sorcery',
  'HYP3E.dataLabel.xformSave': 'Save vs. Transformation',
  'tokenActionHudHyp3e.rolls.task': 'task'
}

globalThis.game = {
  i18n: {
    localize: (key) => translations[key] ?? key
  },
  user: {
    isGM: true
  }
}

globalThis.CONFIG = {
  HYP3E: {
    enableAttrChecks: '3d6'
  }
}

const referencedSpells = new Map()
globalThis.fromUuid = async (uuid) => referencedSpells.get(uuid) ?? null

class CoreRollHandler {
  constructor() {
    this.hudManager = null
  }

  get actor() {
    return this.hudManager?.actor
  }

  get token() {
    return this.hudManager?.token
  }

  isRenderItem() {
    return this.hudManager?.isRightClick
      && !(this.hudManager?.isAlt || this.hudManager?.isCtrl || this.hudManager?.isShift)
  }

  renderItem(actor, itemId) {
    const item = actor.items.get(itemId)
    if (!item) return false
    item.sheet.render(true)
    return true
  }
}

function createCoreApi() {
  const errors = []

  return {
    api: {
      Logger: {
        debug() {},
        error(message) {
          errors.push(message)
        }
      },
      RollHandler: CoreRollHandler
    },
    errors
  }
}

function createActor(type = 'character') {
  const itemSheetRenders = []
  const createItem = (id, itemType, system = {}) => ({
    id,
    sheet: {
      render(force) {
        itemSheetRenders.push({ force, id })
      }
    },
    system,
    type: itemType
  })
  const items = [
    createItem('weapon-id', 'weapon'),
    createItem('feature-id', 'feature'),
    createItem('spell-id', 'spell'),
    createItem('gear-id', 'item'),
    createItem('armor-id', 'armor'),
    createItem('shield-id', 'shield'),
    createItem('magic-item', 'item', {
      identified: true,
      spellcasting: {
        hasSpells: true,
        spellRefs: [
          {
            charges: 2,
            uuid: 'Compendium.hyp3e.spells.Item.magic-missile'
          }
        ]
      }
    }),
    createItem('torch-id', 'item', { isLightSource: true }),
    createItem('ordinary-item', 'item', { isLightSource: false })
  ]
  const calls = {
    check: [],
    item: [],
    itemSpell: [],
    light: [],
    reaction: [],
    save: []
  }
  const actor = {
    effects: [],
    id: `${type}-actor`,
    items: new Map(items.map((item) => [item.id, item])),
    rollCheck: async (dataset) => calls.check.push(dataset),
    rollItem: async (dataset) => calls.item.push(dataset),
    rollReaction: async (dataset) => calls.reaction.push(dataset),
    rollSave: async (dataset) => calls.save.push(dataset),
    toggleLightSource: async (itemId) => calls.light.push(itemId),
    useItemSpell: async (item, spellUuid) => {
      calls.itemSpell.push({ item, spellUuid })
    },
    system: {
      attributes: {
        cha: { reaction: -1 },
        con: { traumaSurvive: 80 },
        int: { curr: 15 },
        str: { test: 5 }
      },
      baseClass: type === 'character'
        ? 'fighter'
        : type === 'npc'
          ? 'npc'
          : '',
      loyalty: 6,
      morale: 8,
      npcType: 'npc',
      saves: {
        avoidance: { curr: 13, value: 14 },
        death: { curr: 9, value: 10 },
        device: { curr: 10, value: 11 },
        sorcery: { curr: 14, value: 15 },
        transformation: { curr: 12, value: 13 }
      },
      taskResolution: {
        simple: { name: 'Simple', tn: 5 }
      }
    },
    type
  }

  return {
    actor,
    calls,
    itemSheetRenders
  }
}

function createHandler({ actor, tokenId = 'selected-token', modifiers = {} }) {
  const core = createCoreApi()
  const Hyp3eRollHandler = createRollHandlerClass(core.api)
  const handler = new Hyp3eRollHandler()
  handler.hudManager = {
    actor,
    token: { id: tokenId },
    isAlt: false,
    isCtrl: false,
    isRightClick: false,
    isShift: false,
    ...modifiers
  }

  return {
    errors: core.errors,
    handler
  }
}

test('a linked character weapon action delegates the minimum dataset to rollItem', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor, tokenId: 'linked-token' })

  assert.equal(await handler.dispatchAction('hyp3e|item|weapon-id'), true)
  assert.deepEqual(calls.item, [
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      itemId: 'weapon-id',
      rollType: 'item',
      tokenId: 'linked-token'
    }
  ])
})

test('only generated item action types delegate to rollItem', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  for (const itemId of [
    'feature-id',
    'spell-id'
  ]) {
    assert.equal(await handler.dispatchAction(`hyp3e|item|${itemId}`), true)
  }
  for (const itemId of ['gear-id', 'armor-id', 'shield-id']) {
    assert.equal(await handler.dispatchAction(`hyp3e|item|${itemId}`), false)
  }

  assert.deepEqual(calls.item.map(({ itemId }) => itemId), [
    'feature-id',
    'spell-id'
  ])
})

test('tasks and natural checks resolve their current formula and target at click time', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  for (const checkId of [
    'task-simple',
    'attribute-str-test',
    'attribute-con-trauma',
    'attribute-int-check'
  ]) {
    assert.equal(await handler.dispatchAction(`hyp3e|check|${checkId}`), true)
  }

  assert.deepEqual(calls.check, [
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Simple task',
      roll: 'd6',
      rollTarget: 5,
      rollType: 'check',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Strength Test',
      roll: '1d6',
      rollTarget: 5,
      rollType: 'check',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Trauma Survival',
      roll: '1d100',
      rollTarget: 80,
      rollType: 'check',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Intelligence Check',
      roll: '3d6',
      rollTarget: 15,
      rollType: 'check',
      tokenId: 'selected-token'
    }
  ])
})

test('NPC morale and GM-only loyalty resolve current targets through rollCheck', async () => {
  const { actor, calls } = createActor('npc')
  const { handler } = createHandler({ actor, tokenId: 'npc-token' })

  assert.equal(await handler.dispatchAction('hyp3e|check|npc-morale'), true)
  assert.equal(await handler.dispatchAction('hyp3e|check|npc-loyalty'), true)
  assert.deepEqual(calls.check, [
    {
      actorId: 'npc-actor',
      baseClass: 'npc',
      label: 'Morale',
      roll: '2d6',
      rollTarget: 8,
      rollType: 'check',
      tokenId: 'npc-token'
    },
    {
      actorId: 'npc-actor',
      baseClass: 'npc',
      label: 'Loyalty',
      roll: '2d6',
      rollTarget: 6,
      rollType: 'check',
      tokenId: 'npc-token'
    }
  ])

  globalThis.game.user.isGM = false
  try {
    assert.equal(
      await handler.dispatchAction('hyp3e|check|npc-loyalty'),
      false
    )
  } finally {
    globalThis.game.user.isGM = true
  }

  actor.system.npcType = 'monster'
  assert.equal(
    await handler.dispatchAction('hyp3e|check|npc-loyalty'),
    false
  )
})

test('Charisma reaction resolves its current modifier through rollReaction', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  assert.equal(await handler.dispatchAction('hyp3e|reaction|charisma'), true)
  assert.deepEqual(calls.reaction, [
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Reaction',
      roll: '2d6+-1',
      rollType: 'reaction',
      tokenId: 'selected-token'
    }
  ])
})

test('light actions validate the item and delegate to toggleLightSource', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  assert.equal(await handler.dispatchAction('hyp3e|light|torch-id'), true)
  assert.equal(await handler.dispatchAction('hyp3e|light|ordinary-item'), false)
  assert.deepEqual(calls.light, ['torch-id'])
})

test('charged-item spell actions validate references and delegate to useItemSpell', async () => {
  const spellUuid = 'Compendium.hyp3e.spells.Item.magic-missile'
  const spellSheetRenders = []
  referencedSpells.set(spellUuid, {
    documentName: 'Item',
    name: 'Magic Missile',
    sheet: {
      render(force) {
        spellSheetRenders.push(force)
      }
    },
    type: 'spell'
  })
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })
  const encodedAction = `hyp3e|item-spell|magic-item:${encodeURIComponent(spellUuid)}`

  assert.equal(await handler.dispatchAction(encodedAction), true)
  assert.deepEqual(calls.itemSpell, [
    {
      item: actor.items.get('magic-item'),
      spellUuid
    }
  ])

  const { handler: rightClickHandler } = createHandler({
    actor,
    modifiers: {
      isRightClick: true
    }
  })
  assert.equal(await rightClickHandler.dispatchAction(encodedAction), true)
  assert.deepEqual(spellSheetRenders, [true])
  assert.equal(calls.itemSpell.length, 1)

  actor.items.get('magic-item').system.identified = false
  assert.equal(await handler.dispatchAction(encodedAction), false)
  actor.items.get('magic-item').system.identified = true

  actor.items.get('feature-id').system.spellcasting = {
    hasSpells: true,
    spellRefs: [{ charges: 1, uuid: spellUuid }]
  }
  assert.equal(
    await handler.dispatchAction(
      `hyp3e|item-spell|feature-id:${encodeURIComponent(spellUuid)}`
    ),
    false
  )

  actor.items.get('magic-item').system.spellcasting.spellRefs = [null]
  assert.equal(await handler.dispatchAction(encodedAction), false)

  assert.equal(
    await handler.dispatchAction(
      'hyp3e|item-spell|magic-item:Compendium.hyp3e.spells.Item.missing'
    ),
    false
  )

  const { actor: itemToken } = createActor('itemToken')
  const { handler: itemTokenHandler } = createHandler({ actor: itemToken })
  assert.equal(await itemTokenHandler.dispatchAction(encodedAction), false)
})

test('all five save actions resolve their current targets at click time', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  for (const saveKey of ['death', 'device', 'transformation', 'avoidance', 'sorcery']) {
    assert.equal(await handler.dispatchAction(`hyp3e|save|${saveKey}`), true)
  }

  assert.deepEqual(calls.save, [
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Save vs. Death',
      roll: '1d20',
      rollTarget: 9,
      rollType: 'save',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Save vs. Device',
      roll: '1d20',
      rollTarget: 10,
      rollType: 'save',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Save vs. Transformation',
      roll: '1d20',
      rollTarget: 12,
      rollType: 'save',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Save vs. Avoidance',
      roll: '1d20',
      rollTarget: 13,
      rollType: 'save',
      tokenId: 'selected-token'
    },
    {
      actorId: 'character-actor',
      baseClass: 'fighter',
      label: 'Save vs. Sorcery',
      roll: '1d20',
      rollTarget: 14,
      rollType: 'save',
      tokenId: 'selected-token'
    }
  ])
})

test('an unmodified right-click renders the owned item without rolling it', async () => {
  const { actor, calls, itemSheetRenders } = createActor()
  const { handler } = createHandler({
    actor,
    modifiers: {
      isRightClick: true
    }
  })

  assert.equal(await handler.dispatchAction('hyp3e|item|weapon-id'), true)
  assert.deepEqual(itemSheetRenders, [{ force: true, id: 'weapon-id' }])
  assert.deepEqual(calls.item, [])
})

test('a modified right-click follows the normal item action path', async () => {
  const { actor, calls, itemSheetRenders } = createActor()
  const { handler } = createHandler({
    actor,
    modifiers: {
      isRightClick: true,
      isShift: true
    }
  })

  assert.equal(await handler.dispatchAction('hyp3e|item|weapon-id'), true)
  assert.equal(calls.item.length, 1)
  assert.deepEqual(itemSheetRenders, [])
})

test('an unmodified light-action right-click opens the light item sheet', async () => {
  const { actor, calls, itemSheetRenders } = createActor()
  const { handler } = createHandler({
    actor,
    modifiers: {
      isRightClick: true
    }
  })

  assert.equal(await handler.dispatchAction('hyp3e|light|torch-id'), true)
  assert.deepEqual(itemSheetRenders, [{ force: true, id: 'torch-id' }])
  assert.deepEqual(calls.light, [])
})

test('an unlinked NPC dispatches through the selected synthetic token actor', async () => {
  const { actor: syntheticActor, calls: syntheticCalls } = createActor('npc')
  const { actor: baseActor, calls: baseCalls } = createActor('npc')
  syntheticActor.baseActor = baseActor
  const { handler } = createHandler({
    actor: syntheticActor,
    tokenId: 'unlinked-token'
  })

  assert.equal(await handler.dispatchAction('hyp3e|item|weapon-id'), true)
  assert.equal(syntheticCalls.item.length, 1)
  assert.equal(syntheticCalls.item[0].tokenId, 'unlinked-token')
  assert.deepEqual(baseCalls.item, [])
})

test('itemToken actors dispatch light but not generic item actions', async () => {
  const { actor, calls } = createActor('itemToken')
  const { handler } = createHandler({
    actor,
    tokenId: 'item-token'
  })

  assert.equal(await handler.dispatchAction('hyp3e|item|gear-id'), false)
  assert.equal(await handler.dispatchAction('hyp3e|light|torch-id'), true)
  assert.equal(await handler.dispatchAction('hyp3e|item|weapon-id'), false)
  assert.deepEqual(calls.item, [])
  assert.deepEqual(calls.light, ['torch-id'])
})

test('malformed, unknown, and missing-document actions fail safely', async () => {
  const { actor, calls } = createActor()
  const { handler } = createHandler({ actor })

  assert.equal(await handler.dispatchAction(''), false)
  assert.equal(await handler.dispatchAction('other|item|weapon-id'), false)
  assert.equal(await handler.dispatchAction('hyp3e|unknown|weapon-id'), false)
  assert.equal(await handler.dispatchAction('hyp3e|item|missing'), false)
  assert.equal(await handler.dispatchAction('hyp3e|check|missing'), false)
  assert.equal(await handler.dispatchAction('hyp3e|light|missing'), false)
  assert.equal(await handler.dispatchAction('hyp3e|reaction|missing'), false)
  assert.equal(await handler.dispatchAction('hyp3e|save|missing'), false)
  assert.deepEqual(calls, {
    check: [],
    item: [],
    itemSpell: [],
    light: [],
    reaction: [],
    save: []
  })
})

test('handleActionClick catches rejected Hyperborea workflows', async () => {
  const { actor } = createActor()
  actor.rollItem = async () => {
    throw new Error('simulated failure')
  }
  const { errors, handler } = createHandler({ actor })

  assert.equal(handler.handleActionClick(null, 'hyp3e|item|weapon-id'), undefined)
  await waitForImmediate()

  assert.equal(errors.length, 1)
  assert.match(errors[0], /simulated failure/)
})
