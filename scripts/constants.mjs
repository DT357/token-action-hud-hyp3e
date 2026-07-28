export const MODULE = Object.freeze({
  ID: 'token-action-hud-hyp3e',
  TITLE: 'Token Action HUD Hyperborea 3e'
})

export const CORE_MODULE_ID = 'token-action-hud-core'
export const REQUIRED_CORE_MODULE_VERSION = '2.1'
export const SYSTEM_ID = 'hyp3e'
export const ACTION_NAMESPACE = 'hyp3e'

export const ACTION_TYPES = Object.freeze({
  CHECK: 'check',
  ITEM: 'item',
  ITEM_SPELL: 'item-spell',
  LIGHT: 'light',
  REACTION: 'reaction',
  SAVE: 'save'
})

export const GROUPS = Object.freeze({
  ABILITIES: 'abilities',
  ATTRIBUTE_CHECKS: 'attribute-checks',
  COMBAT: 'combat',
  FEATURES: 'features',
  INVENTORY: 'inventory',
  ITEM_SPELLS: 'item-spells',
  LIGHT_SOURCES: 'light-sources',
  NPC_CHECKS: 'npc-checks',
  SAVES: 'saves',
  SPELLS: 'spells',
  TASKS: 'tasks',
  WEAPONS: 'weapons'
})

export const HOOKS = Object.freeze({
  CORE_API_READY: 'tokenActionHudCoreApiReady',
  SYSTEM_READY: 'tokenActionHudSystemReady'
})

export const ROLL_HANDLERS = Object.freeze({
  CORE: 'core'
})

export const SAVE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'death',
    actionName: 'HYP3E.saves.death.name',
    rollLabel: 'HYP3E.dataLabel.deathSave'
  }),
  Object.freeze({
    id: 'device',
    actionName: 'HYP3E.saves.device.name',
    rollLabel: 'HYP3E.dataLabel.deviceSave'
  }),
  Object.freeze({
    id: 'transformation',
    actionName: 'HYP3E.saves.transformation.name',
    rollLabel: 'HYP3E.dataLabel.xformSave'
  }),
  Object.freeze({
    id: 'avoidance',
    actionName: 'HYP3E.saves.avoidance.name',
    rollLabel: 'HYP3E.dataLabel.avoidanceSave'
  }),
  Object.freeze({
    id: 'sorcery',
    actionName: 'HYP3E.saves.sorcery.name',
    rollLabel: 'HYP3E.dataLabel.sorcerySave'
  })
])

export const TASK_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'task-simple', key: 'simple' }),
  Object.freeze({ id: 'task-moderate', key: 'moderate' }),
  Object.freeze({ id: 'task-challenging', key: 'challenging' }),
  Object.freeze({ id: 'task-difficult', key: 'difficult' }),
  Object.freeze({ id: 'task-veryDifficult', key: 'veryDifficult' })
])

export const NPC_CHECK_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'npc-morale',
    key: 'morale',
    label: 'HYP3E.morale'
  }),
  Object.freeze({
    gmOnly: true,
    id: 'npc-loyalty',
    key: 'loyalty',
    label: 'HYP3E.loyalty',
    npcType: 'npc'
  })
])

export const ATTRIBUTE_CHECK_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'attribute-str-test',
    formula: '1d6',
    label: 'HYP3E.attributes.str.test',
    path: Object.freeze(['attributes', 'str', 'test'])
  }),
  Object.freeze({
    id: 'attribute-str-feat',
    formula: '1d100',
    label: 'HYP3E.attributes.str.feat',
    path: Object.freeze(['attributes', 'str', 'feat'])
  }),
  Object.freeze({
    id: 'attribute-dex-test',
    formula: '1d6',
    label: 'HYP3E.attributes.dex.test',
    path: Object.freeze(['attributes', 'dex', 'test'])
  }),
  Object.freeze({
    id: 'attribute-dex-feat',
    formula: '1d100',
    label: 'HYP3E.attributes.dex.feat',
    path: Object.freeze(['attributes', 'dex', 'feat'])
  }),
  Object.freeze({
    id: 'attribute-con-trauma',
    formula: '1d100',
    label: 'HYP3E.attributes.con.traumaSurvive',
    path: Object.freeze(['attributes', 'con', 'traumaSurvive'])
  }),
  Object.freeze({
    id: 'attribute-con-test',
    formula: '1d6',
    label: 'HYP3E.attributes.con.test',
    path: Object.freeze(['attributes', 'con', 'test'])
  }),
  Object.freeze({
    id: 'attribute-con-feat',
    formula: '1d100',
    label: 'HYP3E.attributes.con.feat',
    path: Object.freeze(['attributes', 'con', 'feat'])
  }),
  Object.freeze({
    id: 'attribute-int-check',
    label: 'HYP3E.attributes.int.check',
    optionalAttributeCheck: true,
    path: Object.freeze(['attributes', 'int', 'curr'])
  }),
  Object.freeze({
    id: 'attribute-int-learn-spell',
    formula: '1d100',
    label: 'HYP3E.attributes.int.learnSpell',
    path: Object.freeze(['attributes', 'int', 'learnSpell'])
  }),
  Object.freeze({
    id: 'attribute-wis-check',
    label: 'HYP3E.attributes.wis.check',
    optionalAttributeCheck: true,
    path: Object.freeze(['attributes', 'wis', 'curr'])
  }),
  Object.freeze({
    id: 'attribute-wis-learn-spell',
    formula: '1d100',
    label: 'HYP3E.attributes.wis.learnSpell',
    path: Object.freeze(['attributes', 'wis', 'learnSpell'])
  })
])

export const ITEM_ACTION_TYPES = Object.freeze([
  'feature',
  'spell',
  'weapon'
])
