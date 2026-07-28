import { createActionHandlerClass } from './action-handler.mjs'
import { ROLL_HANDLERS } from './constants.mjs'
import { getDefaults } from './defaults.mjs'
import { createRollHandlerClass } from './roll-handler.mjs'

function localize(key) {
  return globalThis.game?.i18n?.localize?.(key) ?? key
}

export function createSystemManagerClass(coreApi) {
  const CoreSystemManager = coreApi?.SystemManager
  if (typeof CoreSystemManager !== 'function') {
    throw new TypeError('Token Action HUD Core did not provide a SystemManager class')
  }

  const Hyp3eActionHandler = createActionHandlerClass(coreApi)
  const Hyp3eRollHandler = createRollHandlerClass(coreApi)

  return class Hyp3eSystemManager extends CoreSystemManager {
    getActionHandler() {
      return new Hyp3eActionHandler()
    }

    getAvailableRollHandlers() {
      return {
        [ROLL_HANDLERS.CORE]: localize('tokenActionHudHyp3e.rollHandlers.core')
      }
    }

    getRollHandler(rollHandlerId) {
      if (rollHandlerId !== ROLL_HANDLERS.CORE) return null
      return new Hyp3eRollHandler()
    }

    async registerDefaults() {
      return getDefaults()
    }
  }
}
