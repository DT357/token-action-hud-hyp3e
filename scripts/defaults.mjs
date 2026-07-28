import { GROUPS } from './constants.mjs'

const SYSTEM_GROUP_TYPE = 'system'

function localize(key) {
  return globalThis.game?.i18n?.localize?.(key) ?? key
}

export function getDefaults() {
  const names = {
    abilities: localize('tokenActionHudHyp3e.groups.abilities'),
    attributeChecks: localize('tokenActionHudHyp3e.groups.attributeChecks'),
    combat: localize('tokenActionHudHyp3e.groups.combat'),
    features: localize('tokenActionHudHyp3e.groups.features'),
    inventory: localize('tokenActionHudHyp3e.groups.inventory'),
    lightSources: localize('tokenActionHudHyp3e.groups.lightSources'),
    npcChecks: localize('tokenActionHudHyp3e.groups.npcChecks'),
    saves: localize('tokenActionHudHyp3e.groups.saves'),
    spells: localize('tokenActionHudHyp3e.groups.spells'),
    tasks: localize('tokenActionHudHyp3e.groups.tasks'),
    weapons: localize('tokenActionHudHyp3e.groups.weapons')
  }

  return {
    layout: [
      {
        id: GROUPS.COMBAT,
        name: names.combat,
        nestId: GROUPS.COMBAT,
        type: SYSTEM_GROUP_TYPE,
        groups: [
          {
            id: GROUPS.WEAPONS,
            name: names.weapons,
            nestId: `${GROUPS.COMBAT}_${GROUPS.WEAPONS}`,
            type: SYSTEM_GROUP_TYPE
          },
          {
            id: GROUPS.SAVES,
            name: names.saves,
            nestId: `${GROUPS.COMBAT}_${GROUPS.SAVES}`,
            type: SYSTEM_GROUP_TYPE
          }
        ]
      },
      {
        id: GROUPS.ABILITIES,
        name: names.abilities,
        nestId: GROUPS.ABILITIES,
        type: SYSTEM_GROUP_TYPE,
        groups: [
          {
            id: GROUPS.ATTRIBUTE_CHECKS,
            name: names.attributeChecks,
            nestId: `${GROUPS.ABILITIES}_${GROUPS.ATTRIBUTE_CHECKS}`,
            type: SYSTEM_GROUP_TYPE
          },
          {
            id: GROUPS.TASKS,
            name: names.tasks,
            nestId: `${GROUPS.ABILITIES}_${GROUPS.TASKS}`,
            type: SYSTEM_GROUP_TYPE
          },
          {
            id: GROUPS.FEATURES,
            name: names.features,
            nestId: `${GROUPS.ABILITIES}_${GROUPS.FEATURES}`,
            type: SYSTEM_GROUP_TYPE
          },
          {
            id: GROUPS.NPC_CHECKS,
            name: names.npcChecks,
            nestId: `${GROUPS.ABILITIES}_${GROUPS.NPC_CHECKS}`,
            type: SYSTEM_GROUP_TYPE
          }
        ]
      },
      {
        id: GROUPS.SPELLS,
        name: names.spells,
        nestId: GROUPS.SPELLS,
        type: SYSTEM_GROUP_TYPE,
        groups: []
      },
      {
        id: GROUPS.INVENTORY,
        name: names.inventory,
        nestId: GROUPS.INVENTORY,
        type: SYSTEM_GROUP_TYPE,
        groups: [
          {
            id: GROUPS.LIGHT_SOURCES,
            name: names.lightSources,
            nestId: `${GROUPS.INVENTORY}_${GROUPS.LIGHT_SOURCES}`,
            type: SYSTEM_GROUP_TYPE
          }
        ]
      }
    ],
    groups: [
      {
        id: GROUPS.WEAPONS,
        name: names.weapons,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.SAVES,
        name: names.saves,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.ATTRIBUTE_CHECKS,
        name: names.attributeChecks,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.TASKS,
        name: names.tasks,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.FEATURES,
        name: names.features,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.NPC_CHECKS,
        name: names.npcChecks,
        type: SYSTEM_GROUP_TYPE
      },
      {
        id: GROUPS.LIGHT_SOURCES,
        name: names.lightSources,
        type: SYSTEM_GROUP_TYPE
      }
    ]
  }
}
