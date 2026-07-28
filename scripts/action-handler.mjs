import {
  ACTION_NAMESPACE,
  ACTION_TYPES,
  ATTRIBUTE_CHECK_DEFINITIONS,
  GROUPS,
  MODULE,
  NPC_CHECK_DEFINITIONS,
  SAVE_DEFINITIONS,
  TASK_DEFINITIONS
} from './constants.mjs'

const ITEM_SPELL_PARENT_TYPES = new Set(['armor', 'item', 'shield', 'weapon'])
const LIGHT_ITEM_TYPES = new Set(['armor', 'item', 'shield', 'weapon'])
const SYSTEM_GROUP_TYPE = 'system'
const SYSTEM_DERIVED_GROUP_TYPE = 'system-derived'
const TOP_LEVEL_GROUPS = Object.freeze([
  GROUPS.COMBAT,
  GROUPS.ABILITIES,
  GROUPS.SPELLS,
  GROUPS.INVENTORY
])

function localize(key) {
  return globalThis.game?.i18n?.localize?.(key) ?? key
}

function format(key, values) {
  return globalThis.game?.i18n?.format?.(key, values) ?? localize(key)
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function getPathValue(source, path) {
  return path.reduce((value, key) => value?.[key], source)
}

function getActorItems(actor) {
  if (!actor?.items) return []
  if (Array.isArray(actor.items)) return actor.items
  if (Array.isArray(actor.items.contents)) return actor.items.contents
  if (typeof actor.items.values === 'function') {
    return Array.from(actor.items.values())
  }
  return Array.from(actor.items)
}

function sortItems(items) {
  return [...items].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
}

function getItemName(item) {
  const friendlyName = item.system?.friendlyName
  if (typeof friendlyName === 'string' && friendlyName.trim()) {
    return friendlyName.trim()
  }
  return item.name ?? ''
}

function getItemImage(item, imageResolver) {
  if (typeof imageResolver === 'function') return imageResolver(item)
  return item.img ?? ''
}

function getQuantityInfo(item, titleKey = 'tokenActionHudHyp3e.info.quantity') {
  const quantity = item.system?.quantity?.value
  if (!hasValue(quantity)) return undefined

  return {
    text: String(quantity),
    title: localize(titleKey)
  }
}

function getEquipmentInfo(item) {
  const isEquipped = item.system?.equipped
  if (typeof isEquipped !== 'boolean') return undefined

  return {
    icon: isEquipped
      ? '<i class="fa-solid fa-hand-fist"></i>'
      : '<i class="fa-solid fa-hand"></i>',
    title: localize(
      isEquipped
        ? 'tokenActionHudHyp3e.info.equipped'
        : 'tokenActionHudHyp3e.info.unequipped'
    )
  }
}

function createItemAction(
  item,
  {
    actionId = item.id,
    actionType = ACTION_TYPES.ITEM,
    imageResolver,
    info1,
    info2,
    info3
  } = {}
) {
  const name = getItemName(item)
  const img = getItemImage(item, imageResolver)

  return {
    id: actionId,
    name,
    listName: name,
    encodedValue: `${ACTION_NAMESPACE}|${actionType}|${item.id}`,
    ...(img && { img }),
    ...(info1 && { info1 }),
    ...(info2 && { info2 }),
    ...(info3 && { info3 }),
    isItem: true,
    system: {
      itemId: item.id,
      kind: actionType
    }
  }
}

function createCheckAction({ id, name, target }) {
  return {
    id,
    name,
    listName: name,
    encodedValue: `${ACTION_NAMESPACE}|${ACTION_TYPES.CHECK}|${id}`,
    ...(hasValue(target) && {
      info1: {
        text: String(target),
        title: localize('tokenActionHudHyp3e.info.checkTarget')
      }
    }),
    system: {
      checkId: id,
      kind: ACTION_TYPES.CHECK
    }
  }
}

function formatSigned(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value ?? '')
  return number >= 0 ? `+${number}` : String(number)
}

function isItemDocument(document) {
  if (document?.documentName === 'Item') return true
  return typeof globalThis.Item === 'function' && document instanceof globalThis.Item
}

function encodeItemSpellId(itemId, spellUuid) {
  return `${itemId}:${encodeURIComponent(spellUuid)}`
}

export function buildWeaponActions(actor, imageResolver) {
  return sortItems(
    getActorItems(actor)
      .filter((item) => item.type === 'weapon' && !item.system?.inStorage)
  ).map((item) => createItemAction(item, {
    imageResolver,
    info1: getQuantityInfo(item),
    info2: getEquipmentInfo(item)
  }))
}

export function buildSaveActions(actor) {
  return SAVE_DEFINITIONS.map((save) => {
    const name = localize(save.actionName)
    const target = actor.system?.saves?.[save.id]?.curr

    return {
      id: `save-${save.id}`,
      name,
      listName: name,
      encodedValue: `${ACTION_NAMESPACE}|${ACTION_TYPES.SAVE}|${save.id}`,
      ...(hasValue(target) && {
        info1: {
          text: String(target),
          title: localize('tokenActionHudHyp3e.info.saveTarget')
        }
      }),
      system: {
        kind: ACTION_TYPES.SAVE,
        saveId: save.id
      }
    }
  })
}

export function buildTaskActions(actor) {
  return TASK_DEFINITIONS.flatMap((definition) => {
    const task = actor.system?.taskResolution?.[definition.key]
    if (!task) return []

    return [createCheckAction({
      id: definition.id,
      name: task.name || definition.key,
      target: task.tn
    })]
  })
}

export function buildNpcCheckActions(
  actor,
  isGm = globalThis.game?.user?.isGM === true
) {
  return NPC_CHECK_DEFINITIONS.flatMap((definition) => {
    if (definition.gmOnly && !isGm) return []
    if (definition.npcType && actor.system?.npcType !== definition.npcType) {
      return []
    }

    const target = actor.system?.[definition.key]
    if (!hasValue(target)) return []

    return [createCheckAction({
      id: definition.id,
      name: localize(definition.label),
      target
    })]
  })
}

export function buildAttributeActions(actor) {
  const actions = ATTRIBUTE_CHECK_DEFINITIONS.flatMap((definition) => {
    if (
      definition.optionalAttributeCheck
      && !globalThis.CONFIG?.HYP3E?.enableAttrChecks
    ) {
      return []
    }

    return [createCheckAction({
      id: definition.id,
      name: localize(definition.label),
      target: getPathValue(actor.system, definition.path)
    })]
  })

  const reactionModifier = actor.system?.attributes?.cha?.reaction
  const reactionName = localize('HYP3E.attributes.cha.reaction')
  actions.push({
    id: 'attribute-cha-reaction',
    name: reactionName,
    listName: reactionName,
    encodedValue: `${ACTION_NAMESPACE}|${ACTION_TYPES.REACTION}|charisma`,
    ...(hasValue(reactionModifier) && {
      info1: {
        text: formatSigned(reactionModifier),
        title: localize('tokenActionHudHyp3e.info.checkFormula')
      }
    }),
    system: {
      kind: ACTION_TYPES.REACTION,
      reactionId: 'charisma'
    }
  })

  return actions
}

export function buildFeatureActions(actor, imageResolver) {
  return sortItems(
    getActorItems(actor)
      .filter((item) =>
        item.type === 'feature'
        && typeof item.system?.formula === 'string'
        && item.system.formula.trim().length > 0
        && !item.system?.inStorage
      )
  ).map((item) => createItemAction(item, {
    imageResolver,
    ...(hasValue(item.system?.formula) && {
      info1: {
        text: String(item.system.formula),
        title: localize('tokenActionHudHyp3e.info.checkFormula')
      }
    }),
    ...(hasValue(item.system?.tn) && {
      info2: {
        text: String(item.system.tn),
        title: localize('tokenActionHudHyp3e.info.checkTarget')
      }
    })
  }))
}

export function buildSpellActionGroups(actor, imageResolver) {
  const groups = new Map()
  const spells = sortItems(
    getActorItems(actor)
      .filter((item) => item.type === 'spell' && !item.system?.inStorage)
  )

  for (const spell of spells) {
    const rawLevel = Number(spell.system?.spellLevel)
    if (!Number.isFinite(rawLevel)) continue
    const level = Math.min(6, Math.max(1, rawLevel))
    const actions = groups.get(level) ?? []
    actions.push(createItemAction(spell, {
      imageResolver,
      info1: {
        text: `L${level}`,
        title: localize('tokenActionHudHyp3e.info.spellLevel')
      },
      info2: getQuantityInfo(
        spell,
        'tokenActionHudHyp3e.info.memorized'
      )
    }))
    groups.set(level, actions)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, actions]) => ({ actions, level }))
}

export function buildLightActions(actor, imageResolver) {
  return sortItems(
    getActorItems(actor).filter((item) =>
      LIGHT_ITEM_TYPES.has(item.type)
      && item.system?.isLightSource
      && !item.system?.inStorage
    )
  ).map((item) => createItemAction(item, {
    actionId: `light-${item.id}`,
    actionType: ACTION_TYPES.LIGHT,
    imageResolver,
    info1: getQuantityInfo(item)
  }))
}

export async function buildItemSpellActions(
  actor,
  {
    debug,
    imageResolver,
    isGm = globalThis.game?.user?.isGM === true,
    uuidResolver = globalThis.fromUuid
  } = {}
) {
  if (
    !['character', 'npc'].includes(actor?.type)
    || typeof uuidResolver !== 'function'
  ) {
    return []
  }

  const candidates = sortItems(getActorItems(actor)).flatMap((item) => {
    const spellcasting = item.system?.spellcasting
    if (
      !ITEM_SPELL_PARENT_TYPES.has(item.type)
      || item.system?.inStorage
      || !spellcasting?.hasSpells
      || !Array.isArray(spellcasting.spellRefs)
      || (
        actor.type === 'character'
        && item.system?.identified === false
      )
    ) {
      return []
    }

    return spellcasting.spellRefs.flatMap((spellRef) =>
      spellRef?.uuid
        ? [{
            item,
            spellRef,
            spellcasting
          }]
        : []
    )
  })

  const resolvedActions = await Promise.all(candidates.map(async ({
    item,
    spellRef,
    spellcasting
  }) => {
    let spell
    try {
      spell = await uuidResolver(spellRef.uuid)
    } catch (error) {
      debug?.('Skipping an item spell whose UUID could not be resolved', {
        error: error instanceof Error ? error.message : String(error),
        itemId: item.id,
        spellUuid: spellRef.uuid
      })
      return null
    }

    if (!isItemDocument(spell)) {
      debug?.('Skipping a missing or invalid item spell UUID', {
        itemId: item.id,
        spellUuid: spellRef.uuid
      })
      return null
    }

    const itemName = getItemName(item)
    const name = spell.name ?? spellRef.uuid
    const fullName = `${name} — ${itemName}`
    const chargeValue = spellcasting.charges?.value
    const chargeMax = spellcasting.charges?.max
    const chargeText = spellcasting.hideCharges && !isGm
      ? '??'
      : hasValue(chargeValue)
        ? hasValue(chargeMax)
          ? `${chargeValue}/${chargeMax}`
          : String(chargeValue)
        : null
    const img = getItemImage(spell, imageResolver)

    return {
      id: `item-spell-${item.id}-${encodeURIComponent(spellRef.uuid)}`,
      name,
      fullName,
      listName: fullName,
      encodedValue: `${ACTION_NAMESPACE}|${ACTION_TYPES.ITEM_SPELL}|${
        encodeItemSpellId(item.id, spellRef.uuid)
      }`,
      ...(img && { img }),
      ...(hasValue(spellRef.charges) && {
        info1: {
          text: String(spellRef.charges),
          title: localize('tokenActionHudHyp3e.info.chargeCost')
        }
      }),
      ...(chargeText && {
        info2: {
          text: chargeText,
          title: localize('tokenActionHudHyp3e.info.charges')
        }
      }),
      isItem: true,
      tooltip: format('tokenActionHudHyp3e.tooltips.castItemSpell', {
        item: itemName,
        spell: name
      }),
      system: {
        itemId: item.id,
        kind: ACTION_TYPES.ITEM_SPELL,
        spellUuid: spellRef.uuid
      }
    }
  }))

  return resolvedActions.filter(Boolean)
}

function addGroupInfo(groupHandler, id, info) {
  if (typeof groupHandler?.addGroupInfo !== 'function') return
  if (!Object.values(info).some(Boolean)) return
  groupHandler.addGroupInfo({ id, info })
}

function addCombatSummary(groupHandler, actor) {
  const hp = actor.system?.hp
  const ac = actor.system?.ac

  addGroupInfo(groupHandler, GROUPS.COMBAT, {
    ...(hasValue(hp?.value) && hasValue(hp?.max) && {
      info1: {
        text: `${hp.value}/${hp.max}`,
        title: localize('tokenActionHudHyp3e.info.hitPoints')
      }
    }),
    ...(hasValue(ac?.value) && {
      info2: {
        text: `AC ${ac.value}`,
        title: localize('tokenActionHudHyp3e.info.armorClass')
      }
    }),
    ...(hasValue(ac?.dr) && {
      info3: {
        text: `DR ${ac.dr}`,
        title: localize('tokenActionHudHyp3e.info.damageReduction')
      }
    })
  })
}

function addSpellSummary(groupHandler, actor) {
  const castingAbility = actor.system?.ca
  addGroupInfo(groupHandler, GROUPS.SPELLS, {
    ...(hasValue(castingAbility) && {
      info1: {
        text: `CA ${castingAbility}`,
        title: localize('tokenActionHudHyp3e.info.castingAbility')
      }
    })
  })
}

function addInventorySummary(groupHandler, actor) {
  const weightCarried = actor.system?.weightCarried
  addGroupInfo(groupHandler, GROUPS.INVENTORY, {
    ...(hasValue(weightCarried) && {
      info1: {
        text: `${weightCarried} lb.`,
        title: localize('tokenActionHudHyp3e.info.weightCarried')
      }
    })
  })
}

export function createActionHandlerClass(coreApi) {
  const CoreActionHandler = coreApi?.ActionHandler
  if (typeof CoreActionHandler !== 'function') {
    throw new TypeError('Token Action HUD Core did not provide an ActionHandler class')
  }

  const imageResolver = typeof coreApi?.Utils?.getImage === 'function'
    ? (item) => coreApi.Utils.getImage(item)
    : undefined
  const debug = (message, details) => coreApi?.Logger?.debug?.(
    `${MODULE.TITLE} | ${message}`,
    details
  )

  return class Hyp3eActionHandler extends CoreActionHandler {
    async buildSystemActions(groupIds) {
      const actor = this.actor
      if (!actor?.type) return
      const activeGroupIds = new Set(groupIds ?? [])

      // Core 2.1 removeGroup() reads groupHandler.hud, but GroupHandler only
      // receives hudManager. Keep its compatibility alias on the current build.
      if (this.groupHandler && this.hudManager?.hud?.groups) {
        this.groupHandler.hud = this.hudManager.hud
      }

      const removeGroups = (ids) => {
        for (const id of ids) {
          if (activeGroupIds.has(id)) {
            this.groupHandler?.removeGroup?.({ id })
          }
        }
      }

      const addSpellGroups = () => {
        for (const { actions, level } of buildSpellActionGroups(
          actor,
          imageResolver
        )) {
          const id = `spell-level-${level}`
          this.groupHandler?.addGroup?.({
            id,
            name: `${localize('tokenActionHudHyp3e.groups.level')} ${level}`,
            type: SYSTEM_DERIVED_GROUP_TYPE
          }, {
            id: GROUPS.SPELLS
          })
          this.addActions(actions, {
            id,
            type: SYSTEM_DERIVED_GROUP_TYPE
          })
        }
        addSpellSummary(this.groupHandler, actor)
      }

      const addItemSpellGroup = async () => {
        const actions = await buildItemSpellActions(actor, {
          debug,
          imageResolver
        })
        if (!actions.length) return

        this.groupHandler?.addGroup?.({
          id: GROUPS.ITEM_SPELLS,
          name: localize('tokenActionHudHyp3e.groups.itemSpells'),
          type: SYSTEM_DERIVED_GROUP_TYPE
        }, {
          id: GROUPS.INVENTORY
        })
        this.addActions(actions, {
          id: GROUPS.ITEM_SPELLS,
          type: SYSTEM_DERIVED_GROUP_TYPE
        })
      }

      if (!['character', 'npc', 'itemToken'].includes(actor.type)) {
        removeGroups(TOP_LEVEL_GROUPS)
        return
      }

      if (actor.type === 'itemToken') {
        removeGroups([GROUPS.COMBAT, GROUPS.ABILITIES, GROUPS.SPELLS])
        if (activeGroupIds.has(GROUPS.LIGHT_SOURCES)) {
          this.addActions(buildLightActions(actor, imageResolver), {
            id: GROUPS.LIGHT_SOURCES,
            type: SYSTEM_GROUP_TYPE
          })
        }
        return
      }

      if (activeGroupIds.has(GROUPS.WEAPONS)) {
        this.addActions(buildWeaponActions(actor, imageResolver), {
          id: GROUPS.WEAPONS,
          type: SYSTEM_GROUP_TYPE
        })
      }
      if (activeGroupIds.has(GROUPS.SAVES)) {
        this.addActions(buildSaveActions(actor), {
          id: GROUPS.SAVES,
          type: SYSTEM_GROUP_TYPE
        })
      }
      if (activeGroupIds.has(GROUPS.COMBAT)) {
        addCombatSummary(this.groupHandler, actor)
      }

      if (actor.type === 'character') {
        removeGroups([GROUPS.NPC_CHECKS])
        if (activeGroupIds.has(GROUPS.ATTRIBUTE_CHECKS)) {
          this.addActions(buildAttributeActions(actor), {
            id: GROUPS.ATTRIBUTE_CHECKS,
            type: SYSTEM_GROUP_TYPE
          })
        }
        if (activeGroupIds.has(GROUPS.TASKS)) {
          this.addActions(buildTaskActions(actor), {
            id: GROUPS.TASKS,
            type: SYSTEM_GROUP_TYPE
          })
        }
      } else {
        removeGroups([GROUPS.ATTRIBUTE_CHECKS, GROUPS.TASKS])
        if (activeGroupIds.has(GROUPS.SPELLS) && !actor.system?.ca) {
          removeGroups([GROUPS.SPELLS])
        }
      }

      if (activeGroupIds.has(GROUPS.FEATURES)) {
        this.addActions(buildFeatureActions(actor, imageResolver), {
          id: GROUPS.FEATURES,
          type: SYSTEM_GROUP_TYPE
        })
      }
      if (
        actor.type === 'npc'
        && activeGroupIds.has(GROUPS.NPC_CHECKS)
      ) {
        this.addActions(buildNpcCheckActions(actor), {
          id: GROUPS.NPC_CHECKS,
          type: SYSTEM_GROUP_TYPE
        })
      }
      if (
        activeGroupIds.has(GROUPS.SPELLS)
        && (actor.type === 'character' || actor.system?.ca)
      ) {
        addSpellGroups()
      }
      if (activeGroupIds.has(GROUPS.LIGHT_SOURCES)) {
        this.addActions(buildLightActions(actor, imageResolver), {
          id: GROUPS.LIGHT_SOURCES,
          type: SYSTEM_GROUP_TYPE
        })
      }
      if (activeGroupIds.has(GROUPS.INVENTORY)) {
        await addItemSpellGroup()
      }
      if (
        actor.type === 'character'
        && activeGroupIds.has(GROUPS.INVENTORY)
      ) {
        addInventorySummary(this.groupHandler, actor)
      }
    }
  }
}
