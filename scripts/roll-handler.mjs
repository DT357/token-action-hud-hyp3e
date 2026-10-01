import {
  ACTION_NAMESPACE,
  ACTION_TYPES,
  ATTRIBUTE_CHECK_DEFINITIONS,
  ITEM_ACTION_TYPES,
  MODULE,
  NPC_CHECK_DEFINITIONS,
  SAVE_DEFINITIONS,
  TASK_DEFINITIONS
} from './constants.mjs'

const SUPPORTED_ACTOR_TYPES = new Set(['character', 'itemToken', 'npc'])
const ITEM_ACTION_TYPE_SET = new Set(ITEM_ACTION_TYPES)
const ITEM_SPELL_PARENT_TYPES = new Set(['armor', 'item', 'shield', 'weapon'])

function localize(key) {
  return globalThis.game?.i18n?.localize?.(key) ?? key
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function getPathValue(source, path) {
  return path.reduce((value, key) => value?.[key], source)
}

function getOwnedItem(actor, itemId) {
  if (!actor?.items || !itemId) return null
  if (typeof actor.items.get === 'function') {
    return actor.items.get(itemId) ?? null
  }
  return Array.from(actor.items).find((item) => item.id === itemId) ?? null
}

function getBaseDataset(actor, token, rollType) {
  return {
    actorId: actor.id,
    baseClass: actor.system?.baseClass ?? '',
    rollType,
    tokenId: token?.id ?? null
  }
}

function isItemDocument(document) {
  if (document?.documentName === 'Item') return true
  return typeof globalThis.Item === 'function' && document instanceof globalThis.Item
}

function parseItemSpellId(actionId) {
  const separatorIndex = actionId.indexOf(':')
  if (separatorIndex < 1 || separatorIndex === actionId.length - 1) return null

  try {
    return {
      itemId: actionId.slice(0, separatorIndex),
      spellUuid: decodeURIComponent(actionId.slice(separatorIndex + 1))
    }
  } catch {
    return null
  }
}

export function parseActionValue(buttonValue) {
  if (typeof buttonValue !== 'string' || !buttonValue) return null

  const parts = buttonValue.split('|')
  if (parts.length !== 3 || parts.some((part) => !part)) return null

  const [namespace, type, id] = parts
  if (namespace !== ACTION_NAMESPACE) return null

  return { id, type }
}

export function createRollHandlerClass(coreApi) {
  const CoreRollHandler = coreApi?.RollHandler
  if (typeof CoreRollHandler !== 'function') {
    throw new TypeError('Token Action HUD Core did not provide a RollHandler class')
  }
  const CoreLogger = coreApi?.Logger
  if (typeof CoreLogger?.error !== 'function') {
    throw new TypeError('Token Action HUD Core did not provide a Logger class')
  }

  return class Hyp3eRollHandler extends CoreRollHandler {
    handleActionClick(_event, buttonValue) {
      void this.dispatchAction(buttonValue).catch((error) => {
        const detail = error instanceof Error ? error.message : String(error)
        const message = localize('tokenActionHudHyp3e.errors.workflowFailed')
        CoreLogger.error(`${MODULE.TITLE} | ${message}: ${detail}`)
      })
    }

    async dispatchAction(buttonValue) {
      const action = parseActionValue(buttonValue)
      const actor = this.actor
      if (!action || !actor?.id || !SUPPORTED_ACTOR_TYPES.has(actor.type)) {
        return false
      }

      CoreLogger.debug?.(`${MODULE.TITLE} | Dispatching Hyperborea action`, {
        actorId: actor.id,
        action
      })

      if (action.type === ACTION_TYPES.ITEM) {
        return this.#dispatchItem(actor, action.id)
      }
      if (action.type === ACTION_TYPES.ITEM_SPELL) {
        return this.#dispatchItemSpell(actor, action.id)
      }
      if (action.type === ACTION_TYPES.CHECK) {
        return this.#dispatchCheck(actor, action.id)
      }
      if (action.type === ACTION_TYPES.LIGHT) {
        return this.#dispatchLight(actor, action.id)
      }
      if (action.type === ACTION_TYPES.REACTION) {
        return this.#dispatchReaction(actor, action.id)
      }
      if (action.type === ACTION_TYPES.SAVE) {
        return this.#dispatchSave(actor, action.id)
      }
      return false
    }

    async #dispatchItem(actor, itemId) {
      const item = getOwnedItem(actor, itemId)
      if (
        actor.type === 'itemToken'
        || !item
        || !ITEM_ACTION_TYPE_SET.has(item.type)
      ) {
        return false
      }

      if (this.isRenderItem()) {
        return this.renderItem(actor, itemId)
      }
      if (typeof actor.rollItem !== 'function') return false

      await actor.rollItem({
        ...getBaseDataset(actor, this.token, ACTION_TYPES.ITEM),
        itemId,
        ...(item.type === 'feature' && hasValue(item.system?.rollMode) && {
          rollMode: item.system.rollMode
        })
      })
      return true
    }

    async #dispatchItemSpell(actor, actionId) {
      if (!['character', 'npc'].includes(actor.type)) return false

      const parsed = parseItemSpellId(actionId)
      if (!parsed) return false

      const item = getOwnedItem(actor, parsed.itemId)
      const spellcasting = item?.system?.spellcasting
      const hasSpellRef = spellcasting?.spellRefs?.some(
        (spellRef) => spellRef?.uuid === parsed.spellUuid
      )
      if (
        !item
        || !ITEM_SPELL_PARENT_TYPES.has(item.type)
        || item.system?.inStorage
        || !spellcasting?.hasSpells
        || !hasSpellRef
        || (
          actor.type === 'character'
          && item.system?.identified === false
        )
        || typeof globalThis.fromUuid !== 'function'
      ) {
        return false
      }

      let spell
      try {
        spell = await globalThis.fromUuid(parsed.spellUuid)
      } catch (error) {
        CoreLogger.debug?.(
          `${MODULE.TITLE} | Failed to resolve an item spell UUID`,
          {
            error: error instanceof Error ? error.message : String(error),
            itemId: item.id,
            spellUuid: parsed.spellUuid
          }
        )
        return false
      }
      if (!isItemDocument(spell)) return false

      if (this.isRenderItem()) {
        if (typeof spell.sheet?.render !== 'function') return false
        spell.sheet.render(true)
        return true
      }
      if (typeof actor.useItemSpell !== 'function') return false

      await actor.useItemSpell(item, parsed.spellUuid)
      return true
    }

    async #dispatchCheck(actor, checkId) {
      if (typeof actor.rollCheck !== 'function') {
        return false
      }

      if (actor.type === 'npc') {
        const definition = NPC_CHECK_DEFINITIONS.find(
          ({ id }) => id === checkId
        )
        if (
          !definition
          || (definition.gmOnly && !globalThis.game?.user?.isGM)
          || (
            definition.npcType
            && actor.system?.npcType !== definition.npcType
          )
        ) {
          return false
        }

        const rollTarget = actor.system?.[definition.key]
        if (!hasValue(rollTarget)) return false

        await actor.rollCheck({
          ...getBaseDataset(actor, this.token, ACTION_TYPES.CHECK),
          label: localize(definition.label),
          roll: '2d6',
          rollTarget
        })
        return true
      }

      if (actor.type !== 'character') return false

      const taskDefinition = TASK_DEFINITIONS.find(({ id }) => id === checkId)
      if (taskDefinition) {
        const task = actor.system?.taskResolution?.[taskDefinition.key]
        if (!task || !hasValue(task.tn)) return false

        await actor.rollCheck({
          ...getBaseDataset(actor, this.token, ACTION_TYPES.CHECK),
          label: `${task.name || taskDefinition.key} ${localize(
            'tokenActionHudHyp3e.rolls.task'
          )}`,
          roll: 'd6',
          rollTarget: task.tn
        })
        return true
      }

      const definition = ATTRIBUTE_CHECK_DEFINITIONS.find(
        ({ id }) => id === checkId
      )
      if (!definition) return false

      const roll = definition.optionalAttributeCheck
        ? globalThis.CONFIG?.HYP3E?.enableAttrChecks
        : definition.formula
      const rollTarget = getPathValue(actor.system, definition.path)
      if (!roll || !hasValue(rollTarget)) return false

      await actor.rollCheck({
        ...getBaseDataset(actor, this.token, ACTION_TYPES.CHECK),
        label: localize(definition.label),
        roll,
        rollTarget
      })
      return true
    }

    async #dispatchLight(actor, itemId) {
      const item = getOwnedItem(actor, itemId)
      if (!item?.system?.isLightSource) return false

      if (this.isRenderItem()) {
        return this.renderItem(actor, itemId)
      }
      if (typeof actor.toggleLightSource !== 'function') return false

      await actor.toggleLightSource(itemId)
      return true
    }

    async #dispatchReaction(actor, reactionId) {
      if (
        actor.type !== 'character'
        || reactionId !== 'charisma'
        || typeof actor.rollReaction !== 'function'
      ) {
        return false
      }

      const reactionModifier = actor.system?.attributes?.cha?.reaction
      if (!hasValue(reactionModifier)) return false

      await actor.rollReaction({
        ...getBaseDataset(actor, this.token, ACTION_TYPES.REACTION),
        label: localize('HYP3E.attributes.cha.reaction'),
        roll: `2d6+${reactionModifier}`
      })
      return true
    }

    async #dispatchSave(actor, saveId) {
      const save = SAVE_DEFINITIONS.find(({ id }) => id === saveId)
      const saveData = actor.system?.saves?.[saveId]
      const rollTarget = saveData?.curr ?? saveData?.value
      if (
        !save
        || !hasValue(rollTarget)
        || typeof actor.rollSave !== 'function'
      ) {
        return false
      }

      await actor.rollSave({
        ...getBaseDataset(actor, this.token, ACTION_TYPES.SAVE),
        label: localize(save.rollLabel),
        roll: '1d20',
        rollTarget
      })
      return true
    }

  }
}
