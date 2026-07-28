import assert from 'node:assert/strict'
import test from 'node:test'

import { getDefaults } from '../scripts/defaults.mjs'

const translations = {
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
  'tokenActionHudHyp3e.groups.weapons': 'Weapons'
}

globalThis.game = {
  i18n: {
    localize: (key) => translations[key] ?? key
  }
}

test('current defaults provide the streamlined action groups', () => {
  const defaults = getDefaults()

  assert.deepEqual(defaults.layout, [
    {
      id: 'combat',
      name: 'Combat',
      nestId: 'combat',
      type: 'system',
      groups: [
        {
          id: 'weapons',
          name: 'Weapons',
          nestId: 'combat_weapons',
          type: 'system'
        },
        {
          id: 'saves',
          name: 'Saving Throws',
          nestId: 'combat_saves',
          type: 'system'
        }
      ]
    },
    {
      id: 'abilities',
      name: 'Abilities',
      nestId: 'abilities',
      type: 'system',
      groups: [
        {
          id: 'attribute-checks',
          name: 'Attribute Checks',
          nestId: 'abilities_attribute-checks',
          type: 'system'
        },
        {
          id: 'tasks',
          name: 'Tasks',
          nestId: 'abilities_tasks',
          type: 'system'
        },
        {
          id: 'features',
          name: 'Features',
          nestId: 'abilities_features',
          type: 'system'
        },
        {
          id: 'npc-checks',
          name: 'NPC Checks',
          nestId: 'abilities_npc-checks',
          type: 'system'
        }
      ]
    },
    {
      id: 'spells',
      name: 'Spells',
      nestId: 'spells',
      type: 'system',
      groups: []
    },
    {
      id: 'inventory',
      name: 'Inventory',
      nestId: 'inventory',
      type: 'system',
      groups: [
        {
          id: 'light-sources',
          name: 'Light Sources',
          nestId: 'inventory_light-sources',
          type: 'system'
        }
      ]
    }
  ])
  assert.deepEqual(defaults.groups.map(({ id, type }) => ({ id, type })), [
    { id: 'weapons', type: 'system' },
    { id: 'saves', type: 'system' },
    { id: 'attribute-checks', type: 'system' },
    { id: 'tasks', type: 'system' },
    { id: 'features', type: 'system' },
    { id: 'npc-checks', type: 'system' },
    { id: 'light-sources', type: 'system' }
  ])
})

test('each defaults request returns independently mutable data', () => {
  const firstDefaults = getDefaults()
  const secondDefaults = getDefaults()

  firstDefaults.layout[0].groups.pop()
  firstDefaults.groups[0].name = 'Changed'

  assert.equal(secondDefaults.layout[0].groups.length, 2)
  assert.equal(secondDefaults.layout.length, 4)
  assert.equal(secondDefaults.groups[0].name, 'Weapons')
})
