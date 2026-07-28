import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAttributeActions,
  buildFeatureActions,
  buildItemSpellActions,
  buildLightActions,
  buildNpcCheckActions,
  buildSpellActionGroups,
  buildTaskActions,
  createActionHandlerClass
} from '../scripts/action-handler.mjs'

const translations = {
  'HYP3E.attributes.cha.reaction': 'Reaction',
  'HYP3E.attributes.con.feat': 'Constitution Feat',
  'HYP3E.attributes.con.test': 'Constitution Test',
  'HYP3E.attributes.con.traumaSurvive': 'Trauma Survival',
  'HYP3E.attributes.dex.feat': 'Dexterity Feat',
  'HYP3E.attributes.dex.test': 'Dexterity Test',
  'HYP3E.attributes.int.check': 'Intelligence Check',
  'HYP3E.attributes.int.learnSpell': 'Learn Spell (Intelligence)',
  'HYP3E.attributes.str.feat': 'Strength Feat',
  'HYP3E.attributes.str.test': 'Strength Test',
  'HYP3E.attributes.wis.check': 'Wisdom Check',
  'HYP3E.attributes.wis.learnSpell': 'Learn Spell (Wisdom)',
  'HYP3E.loyalty': 'Loyalty',
  'HYP3E.morale': 'Morale',
  'HYP3E.saves.avoidance.name': 'Avoidance',
  'HYP3E.saves.death.name': 'Death',
  'HYP3E.saves.device.name': 'Device',
  'HYP3E.saves.sorcery.name': 'Sorcery',
  'HYP3E.saves.transformation.name': 'Transformation',
  'tokenActionHudHyp3e.info.armorClass': 'Armor Class',
  'tokenActionHudHyp3e.info.castingAbility': 'Casting Ability',
  'tokenActionHudHyp3e.info.chargeCost': 'Charge Cost',
  'tokenActionHudHyp3e.info.charges': 'Charges',
  'tokenActionHudHyp3e.info.checkFormula': 'Formula',
  'tokenActionHudHyp3e.info.checkTarget': 'Target',
  'tokenActionHudHyp3e.info.damageReduction': 'Damage Reduction',
  'tokenActionHudHyp3e.info.equipped': 'Equipped',
  'tokenActionHudHyp3e.info.hitPoints': 'Hit Points',
  'tokenActionHudHyp3e.info.memorized': 'Memorized',
  'tokenActionHudHyp3e.info.quantity': 'Quantity',
  'tokenActionHudHyp3e.info.saveTarget': 'Save Target',
  'tokenActionHudHyp3e.info.spellLevel': 'Spell Level',
  'tokenActionHudHyp3e.info.unequipped': 'Unequipped',
  'tokenActionHudHyp3e.info.weightCarried': 'Weight Carried',
  'tokenActionHudHyp3e.rolls.task': 'task',
  'tokenActionHudHyp3e.groups.itemSpells': 'Item Spells',
  'tokenActionHudHyp3e.tooltips.castItemSpell': 'Cast {spell} from {item}'
}

globalThis.game = {
  i18n: {
    localize: (key) => translations[key] ?? key,
    format: (key, values) => Object.entries(values).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, value),
      translations[key] ?? key
    )
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

class CoreActionHandler {
  constructor() {
    this.addedActions = []
    this.addedGroups = []
    this.groupInfo = []
    this.removedGroups = []
    this.hudManager = {}
    this.groupHandler = {
      addGroup: (group, parent) => this.addedGroups.push({ group, parent }),
      addGroupInfo: (group) => this.groupInfo.push(group),
      removeGroup: (group) => this.removedGroups.push(group)
    }
  }

  addActions(actions, group) {
    this.addedActions.push({ actions, group })
  }

  get actor() {
    return this.hudManager.actor
  }
}

class CoreFaithfulRemovalActionHandler extends CoreActionHandler {
  constructor() {
    super()
    const removedGroups = this.removedGroups
    this.groupHandler.removeGroup = function removeGroup(group) {
      if (!group?.nestId && group?.id) {
        void this.hud.groups
      }
      removedGroups.push(group)
    }
  }
}

function createActor(type = 'character') {
  const items = [
    {
      id: 'weapon-late',
      img: 'late.webp',
      name: 'Late Weapon',
      sort: 20,
      type: 'weapon',
      system: {
        equipped: true,
        friendlyName: '',
        quantity: { value: 1 }
      }
    },
    {
      id: 'weapon-first',
      img: 'first.webp',
      name: 'Original Name',
      sort: 10,
      type: 'weapon',
      system: {
        equipped: false,
        friendlyName: '  Friendly Name  ',
        quantity: { value: 0 }
      }
    },
    {
      id: 'weapon-storage',
      img: 'storage.webp',
      name: 'Stored Weapon',
      sort: 5,
      type: 'weapon',
      system: {
        equipped: true,
        inStorage: true,
        quantity: { value: 1 }
      }
    },
    {
      id: 'not-a-weapon',
      img: 'feature.webp',
      name: 'Feature',
      sort: 1,
      type: 'feature',
      system: {
        formula: '1d6',
        friendlyName: '  Friendly Feature  ',
        tn: '3'
      }
    },
    {
      id: 'passive-feature',
      name: 'Passive Feature',
      sort: 2,
      type: 'feature',
      system: {
        formula: '',
        tn: '4'
      }
    },
    {
      id: 'whitespace-feature',
      name: 'Whitespace Feature',
      sort: 3,
      type: 'feature',
      system: {
        formula: '   ',
        tn: '5'
      }
    },
    {
      id: 'spell-low',
      img: 'spell-low.webp',
      name: 'Low Spell',
      sort: 12,
      type: 'spell',
      system: {
        friendlyName: '',
        quantity: { value: 0 },
        spellLevel: 0
      }
    },
    {
      id: 'spell-three',
      img: 'spell-three.webp',
      name: 'Third Level Spell',
      sort: 11,
      type: 'spell',
      system: {
        friendlyName: '',
        quantity: { value: 2 },
        spellLevel: 3
      }
    },
    {
      id: 'spell-high',
      img: 'spell-high.webp',
      name: 'High Spell',
      sort: 13,
      type: 'spell',
      system: {
        friendlyName: '',
        quantity: { value: 1 },
        spellLevel: 8
      }
    },
    {
      id: 'pack',
      img: 'pack.webp',
      name: 'Pack',
      sort: 14,
      type: 'item',
      system: {
        equipped: true,
        isContainer: true,
        quantity: { value: 1 }
      }
    },
    {
      id: 'gear-contained',
      img: 'gear.webp',
      name: 'Contained Gear',
      sort: 15,
      type: 'item',
      system: {
        containerId: 'pack',
        equipped: false,
        quantity: { value: 2 }
      }
    },
    {
      id: 'armor',
      img: 'armor.webp',
      name: 'Armor',
      sort: 16,
      type: 'armor',
      system: {
        equipped: true,
        quantity: { value: 1 }
      }
    },
    {
      id: 'shield',
      img: 'shield.webp',
      name: 'Shield',
      sort: 17,
      type: 'shield',
      system: {
        equipped: false,
        quantity: { value: 1 }
      }
    },
    {
      id: 'torch',
      img: 'torch.webp',
      name: 'Torch',
      sort: 18,
      type: 'item',
      system: {
        equipped: true,
        isLightSource: true,
        quantity: { value: 0 }
      }
    },
    {
      id: 'stored-gear',
      name: 'Stored Gear',
      sort: 2,
      type: 'item',
      system: {
        inStorage: true,
        isLightSource: true,
        quantity: { value: 1 }
      }
    },
    {
      id: 'effect-template',
      name: 'Effect Template',
      sort: 3,
      type: 'effectTemplate',
      system: {}
    }
  ]

  return {
    effects: [],
    id: `${type}-actor`,
    type,
    items: new Map(items.map((item) => [item.id, item])),
    system: {
      ac: {
        dr: 2,
        value: 4
      },
      attributes: {
        cha: { reaction: 1 },
        con: { feat: 75, test: 3, traumaSurvive: 80 },
        dex: { feat: 70, test: 4 },
        int: { curr: 15, learnSpell: 85 },
        str: { feat: 65, test: 5 },
        wis: { curr: 13, learnSpell: 75 }
      },
      ca: 6,
      hp: {
        max: 20,
        value: 14
      },
      loyalty: 6,
      morale: 8,
      npcType: 'npc',
      saves: {
        avoidance: { curr: 13 },
        death: { curr: 9 },
        device: { curr: 10 },
        sorcery: { curr: 14 },
        transformation: { curr: 12 }
      },
      taskResolution: {
        simple: { name: 'Simple', tn: 5 },
        moderate: { name: 'Moderate', tn: 4 },
        challenging: { name: 'Challenging', tn: 3 },
        difficult: { name: 'Difficult', tn: 2 },
        veryDifficult: { name: 'Very Difficult', tn: 1 }
      },
      weightCarried: 37.5
    }
  }
}

test('character and NPC actors build sorted weapon and current save actions', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })

  for (const actorType of ['character', 'npc']) {
    const handler = new Hyp3eActionHandler()
    handler.hudManager = { actor: createActor(actorType) }

    await handler.buildSystemActions(['combat', 'weapons', 'saves'])

    assert.equal(handler.addedActions.length, 2)
    assert.deepEqual(handler.addedActions.map(({ group }) => group), [
      { id: 'weapons', type: 'system' },
      { id: 'saves', type: 'system' }
    ])

    const weaponActions = handler.addedActions[0].actions
    assert.deepEqual(weaponActions.map(({ id }) => id), ['weapon-first', 'weapon-late'])
    assert.deepEqual(weaponActions[0], {
      id: 'weapon-first',
      name: 'Friendly Name',
      listName: 'Friendly Name',
      encodedValue: 'hyp3e|item|weapon-first',
      img: 'first.webp',
      info1: {
        text: '0',
        title: 'Quantity'
      },
      info2: {
        icon: '<i class="fa-solid fa-hand"></i>',
        title: 'Unequipped'
      },
      isItem: true,
      system: {
        itemId: 'weapon-first',
        kind: 'item'
      }
    })

    const saveActions = handler.addedActions[1].actions
    assert.deepEqual(saveActions.map(({ name }) => name), [
      'Death',
      'Device',
      'Transformation',
      'Avoidance',
      'Sorcery'
    ])
    assert.deepEqual(saveActions[0], {
      id: 'save-death',
      name: 'Death',
      listName: 'Death',
      encodedValue: 'hyp3e|save|death',
      info1: {
        text: '9',
        title: 'Save Target'
      },
      system: {
        kind: 'save',
        saveId: 'death'
      }
    })
  }
})

test('only actions for groups present in the current Core layout are built', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })
  const handler = new Hyp3eActionHandler()
  handler.hudManager = { actor: createActor() }

  await handler.buildSystemActions(['saves'])

  assert.equal(handler.addedActions.length, 1)
  assert.equal(handler.addedActions[0].group.id, 'saves')
})

test('NPC checks expose morale and GM-only NPC loyalty', () => {
  const actor = createActor('npc')

  assert.deepEqual(buildNpcCheckActions(actor, true), [
    {
      id: 'npc-morale',
      name: 'Morale',
      listName: 'Morale',
      encodedValue: 'hyp3e|check|npc-morale',
      info1: {
        text: '8',
        title: 'Target'
      },
      system: {
        checkId: 'npc-morale',
        kind: 'check'
      }
    },
    {
      id: 'npc-loyalty',
      name: 'Loyalty',
      listName: 'Loyalty',
      encodedValue: 'hyp3e|check|npc-loyalty',
      info1: {
        text: '6',
        title: 'Target'
      },
      system: {
        checkId: 'npc-loyalty',
        kind: 'check'
      }
    }
  ])

  assert.deepEqual(
    buildNpcCheckActions(actor, false).map(({ id }) => id),
    ['npc-morale']
  )

  actor.system.npcType = 'monster'
  assert.deepEqual(
    buildNpcCheckActions(actor, true).map(({ id }) => id),
    ['npc-morale']
  )

  actor.system.morale = null
  actor.system.loyalty = null
  assert.deepEqual(buildNpcCheckActions(actor, true), [])
})

test('character tasks and natural abilities mirror current Hyperborea values', () => {
  const actor = createActor()
  const taskActions = buildTaskActions(actor)
  const attributeActions = buildAttributeActions(actor)

  assert.deepEqual(taskActions.map(({ id }) => id), [
    'task-simple',
    'task-moderate',
    'task-challenging',
    'task-difficult',
    'task-veryDifficult'
  ])
  assert.deepEqual(taskActions[0], {
    id: 'task-simple',
    name: 'Simple',
    listName: 'Simple',
    encodedValue: 'hyp3e|check|task-simple',
    info1: {
      text: '5',
      title: 'Target'
    },
    system: {
      checkId: 'task-simple',
      kind: 'check'
    }
  })

  assert.equal(attributeActions.length, 12)
  assert.deepEqual(
    attributeActions.map(({ encodedValue }) => encodedValue),
    [
      'hyp3e|check|attribute-str-test',
      'hyp3e|check|attribute-str-feat',
      'hyp3e|check|attribute-dex-test',
      'hyp3e|check|attribute-dex-feat',
      'hyp3e|check|attribute-con-trauma',
      'hyp3e|check|attribute-con-test',
      'hyp3e|check|attribute-con-feat',
      'hyp3e|check|attribute-int-check',
      'hyp3e|check|attribute-int-learn-spell',
      'hyp3e|check|attribute-wis-check',
      'hyp3e|check|attribute-wis-learn-spell',
      'hyp3e|reaction|charisma'
    ]
  )
  assert.deepEqual(attributeActions[7].info1, {
    text: '15',
    title: 'Target'
  })
  assert.deepEqual(attributeActions.at(-1), {
    id: 'attribute-cha-reaction',
    name: 'Reaction',
    listName: 'Reaction',
    encodedValue: 'hyp3e|reaction|charisma',
    info1: {
      text: '+1',
      title: 'Formula'
    },
    system: {
      kind: 'reaction',
      reactionId: 'charisma'
    }
  })

  globalThis.CONFIG.HYP3E.enableAttrChecks = ''
  assert.deepEqual(
    buildAttributeActions(actor).map(({ id }) => id),
    attributeActions
      .filter(({ id }) => !['attribute-int-check', 'attribute-wis-check'].includes(id))
      .map(({ id }) => id)
  )
  globalThis.CONFIG.HYP3E.enableAttrChecks = '3d6'
})

test('rollable features, spells, and lights retain item order and state', () => {
  const actor = createActor()

  const featureActions = buildFeatureActions(actor)
  assert.deepEqual(featureActions, [
    {
      id: 'not-a-weapon',
      name: 'Friendly Feature',
      listName: 'Friendly Feature',
      encodedValue: 'hyp3e|item|not-a-weapon',
      img: 'feature.webp',
      info1: {
        text: '1d6',
        title: 'Formula'
      },
      info2: {
        text: '3',
        title: 'Target'
      },
      isItem: true,
      system: {
        itemId: 'not-a-weapon',
        kind: 'item'
      }
    }
  ])

  const spellGroups = buildSpellActionGroups(actor)
  assert.deepEqual(spellGroups.map(({ level }) => level), [1, 3, 6])
  assert.deepEqual(spellGroups.map(({ actions }) => actions[0].id), [
    'spell-low',
    'spell-three',
    'spell-high'
  ])
  assert.deepEqual(spellGroups[0].actions[0].info1, {
    text: 'L1',
    title: 'Spell Level'
  })
  assert.deepEqual(spellGroups[0].actions[0].info2, {
    text: '0',
    title: 'Memorized'
  })

  const lightActions = buildLightActions(actor)
  assert.deepEqual(lightActions, [
    {
      id: 'light-torch',
      name: 'Torch',
      listName: 'Torch',
      encodedValue: 'hyp3e|light|torch',
      img: 'torch.webp',
      info1: {
        text: '0',
        title: 'Quantity'
      },
      isItem: true,
      system: {
        itemId: 'torch',
        kind: 'light'
      }
    }
  ])
})

test('charged-item spells resolve independently with charge state and tooltips', async () => {
  const actor = createActor()
  const spellUuid = 'Compendium.hyp3e.spells.Item.ice-storm'
  const missingUuid = 'Compendium.hyp3e.spells.Item.missing'
  actor.items.set('wand', {
    id: 'wand',
    img: 'wand.webp',
    name: 'Wand of Frost',
    sort: 30,
    type: 'item',
    system: {
      identified: true,
      spellcasting: {
        charges: {
          max: 10,
          value: 4
        },
        hasSpells: true,
        hideCharges: false,
        spellRefs: [
          {
            charges: 2,
            uuid: spellUuid
          },
          {
            charges: 1,
            uuid: missingUuid
          }
        ]
      }
    }
  })
  actor.items.set('unidentified-wand', {
    id: 'unidentified-wand',
    name: 'Unknown Wand',
    sort: 31,
    type: 'item',
    system: {
      identified: false,
      spellcasting: {
        hasSpells: true,
        spellRefs: [
          {
            charges: 1,
            uuid: spellUuid
          }
        ]
      }
    }
  })
  const debugMessages = []

  const actions = await buildItemSpellActions(actor, {
    debug: (message, details) => debugMessages.push({ message, details }),
    uuidResolver: async (uuid) => uuid === spellUuid
      ? {
          documentName: 'Item',
          img: 'ice.webp',
          name: 'Ice Storm',
          type: 'spell'
        }
      : null
  })

  assert.deepEqual(actions, [
    {
      id: `item-spell-wand-${encodeURIComponent(spellUuid)}`,
      name: 'Ice Storm',
      fullName: 'Ice Storm — Wand of Frost',
      listName: 'Ice Storm — Wand of Frost',
      encodedValue: `hyp3e|item-spell|wand:${encodeURIComponent(spellUuid)}`,
      img: 'ice.webp',
      info1: {
        text: '2',
        title: 'Charge Cost'
      },
      info2: {
        text: '4/10',
        title: 'Charges'
      },
      isItem: true,
      tooltip: 'Cast Ice Storm from Wand of Frost',
      system: {
        itemId: 'wand',
        kind: 'item-spell',
        spellUuid
      }
    }
  ])
  assert.equal(debugMessages.length, 1)
  assert.match(debugMessages[0].message, /missing/i)
  assert.equal(debugMessages[0].details.spellUuid, missingUuid)
})

test('charged-item spell charges respect Hyperborea hidden-charge visibility', async () => {
  const actor = createActor('npc')
  const spellUuid = 'Compendium.hyp3e.spells.Item.secret'
  actor.items.set('staff', {
    id: 'staff',
    name: 'Secret Staff',
    type: 'item',
    system: {
      spellcasting: {
        charges: {
          max: 8,
          value: 6
        },
        hasSpells: true,
        hideCharges: true,
        spellRefs: [{ charges: 3, uuid: spellUuid }]
      }
    }
  })
  const uuidResolver = async () => ({
    documentName: 'Item',
    name: 'Secret Spell',
    type: 'spell'
  })

  const playerActions = await buildItemSpellActions(actor, {
    isGm: false,
    uuidResolver
  })
  const gmActions = await buildItemSpellActions(actor, {
    isGm: true,
    uuidResolver
  })

  assert.equal(playerActions[0].info2.text, '??')
  assert.equal(gmActions[0].info2.text, '6/8')
})

test('Phase 2 character groups, derived spell levels, and summaries are populated', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })
  const handler = new Hyp3eActionHandler()
  handler.hudManager = { actor: createActor() }

  await handler.buildSystemActions([
    'combat',
    'weapons',
    'saves',
    'abilities',
    'attribute-checks',
    'tasks',
    'features',
    'npc-checks',
    'spells',
    'inventory',
    'light-sources'
  ])

  assert.deepEqual(handler.addedGroups.map(({ group }) => group.id), [
    'spell-level-1',
    'spell-level-3',
    'spell-level-6'
  ])
  assert.ok(handler.addedGroups.every(({ parent }) => parent.id === 'spells'))
  assert.deepEqual(handler.removedGroups, [{ id: 'npc-checks' }])
  assert.deepEqual(handler.groupInfo, [
    {
      id: 'combat',
      info: {
        info1: { text: '14/20', title: 'Hit Points' },
        info2: { text: 'AC 4', title: 'Armor Class' },
        info3: { text: 'DR 2', title: 'Damage Reduction' }
      }
    },
    {
      id: 'spells',
      info: {
        info1: { text: 'CA 6', title: 'Casting Ability' }
      }
    },
    {
      id: 'inventory',
      info: {
        info1: { text: '37.5 lb.', title: 'Weight Carried' }
      }
    }
  ])
})

test('NPC actors receive their intended Phase 3 groups and actions', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })
  const handler = new Hyp3eActionHandler()
  handler.hudManager = { actor: createActor('npc') }

  await handler.buildSystemActions([
    'combat',
    'weapons',
    'saves',
    'abilities',
    'attribute-checks',
    'tasks',
    'features',
    'npc-checks',
    'spells',
    'inventory',
    'light-sources'
  ])

  assert.deepEqual(handler.removedGroups, [
    { id: 'attribute-checks' },
    { id: 'tasks' }
  ])
  assert.deepEqual(handler.addedActions.map(({ group }) => group.id), [
    'weapons',
    'saves',
    'features',
    'npc-checks',
    'spell-level-1',
    'spell-level-3',
    'spell-level-6',
    'light-sources'
  ])
  assert.ok(
    !handler.addedActions
      .flatMap(({ actions }) => actions)
      .some(({ id }) => id === 'npc-hit-dice')
  )
  assert.deepEqual(handler.groupInfo.map(({ id }) => id), ['combat', 'spells'])
})

test('Monster group pruning satisfies the Core 2.1 removeGroup HUD contract', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreFaithfulRemovalActionHandler
  })
  const handler = new Hyp3eActionHandler()
  handler.hudManager = {
    actor: createActor('npc'),
    hud: {
      groups: []
    }
  }

  await handler.buildSystemActions(['attribute-checks', 'tasks'])

  assert.equal(handler.groupHandler.hud, handler.hudManager.hud)
  assert.deepEqual(handler.removedGroups, [
    { id: 'attribute-checks' },
    { id: 'tasks' }
  ])
})

test('NPC actors without casting ability do not expose the Spells group', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })
  const actor = createActor('npc')
  actor.system.ca = null
  const handler = new Hyp3eActionHandler()
  handler.hudManager = { actor }

  await handler.buildSystemActions(['spells'])

  assert.deepEqual(handler.addedGroups, [])
  assert.deepEqual(handler.addedActions, [])
  assert.deepEqual(handler.removedGroups, [{ id: 'spells' }])
})

test('charged items add a derived Item Spells group', async () => {
  const spellUuid = 'Compendium.hyp3e.spells.Item.magic-missile'
  const actor = createActor()
  actor.items.set('wand', {
    id: 'wand',
    name: 'Magic Wand',
    sort: 30,
    type: 'item',
    system: {
      identified: true,
      spellcasting: {
        charges: {
          max: 9,
          value: 7
        },
        hasSpells: true,
        spellRefs: [{ charges: 1, uuid: spellUuid }]
      }
    }
  })
  const previousFromUuid = globalThis.fromUuid
  globalThis.fromUuid = async () => ({
    documentName: 'Item',
    name: 'Magic Missile',
    type: 'spell'
  })

  try {
    const Hyp3eActionHandler = createActionHandlerClass({
      ActionHandler: CoreActionHandler
    })
    const handler = new Hyp3eActionHandler()
    handler.hudManager = { actor }

    await handler.buildSystemActions([
      'inventory'
    ])

    assert.deepEqual(handler.addedGroups, [
      {
        group: {
          id: 'item-spells',
          name: 'Item Spells',
          type: 'system-derived'
        },
        parent: {
          id: 'inventory'
        }
      }
    ])
    assert.deepEqual(handler.addedActions.map(({ group }) => group.id), [
      'item-spells'
    ])
    assert.deepEqual(
      handler.addedActions[0].actions.map(({ name }) => name),
      ['Magic Missile']
    )
  } finally {
    globalThis.fromUuid = previousFromUuid
  }
})

test('itemToken actors expose only light actions', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })
  const handler = new Hyp3eActionHandler()
  handler.hudManager = { actor: createActor('itemToken') }

  await handler.buildSystemActions([
    'combat',
    'weapons',
    'saves',
    'abilities',
    'attribute-checks',
    'tasks',
    'features',
    'npc-checks',
    'spells',
    'inventory',
    'light-sources'
  ])

  assert.deepEqual(handler.removedGroups, [
    { id: 'combat' },
    { id: 'abilities' },
    { id: 'spells' }
  ])
  assert.deepEqual(handler.addedActions.map(({ group }) => group.id), [
    'light-sources'
  ])
  assert.ok(
    !handler.addedActions
      .flatMap(({ actions }) => actions)
      .some(({ id }) => id.startsWith('weapon-'))
  )
})

test('merchant and treasure actors produce no system HUD groups', async () => {
  const Hyp3eActionHandler = createActionHandlerClass({
    ActionHandler: CoreActionHandler
  })

  for (const actorType of ['merchant', 'treasure']) {
    const handler = new Hyp3eActionHandler()
    handler.hudManager = { actor: createActor(actorType) }

    await handler.buildSystemActions([
      'combat',
      'abilities',
      'spells',
      'inventory'
    ])

    assert.deepEqual(handler.addedActions, [])
    assert.deepEqual(handler.removedGroups, [
      { id: 'combat' },
      { id: 'abilities' },
      { id: 'spells' },
      { id: 'inventory' }
    ])
  }
})
