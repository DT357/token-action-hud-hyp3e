import {
  HOOKS,
  MODULE,
  REQUIRED_CORE_MODULE_VERSION,
  SYSTEM_ID
} from './constants.mjs'
import { createSystemManagerClass } from './system-manager.mjs'

function reportRegistrationFailure(error) {
  const messageKey = 'tokenActionHudHyp3e.notifications.registrationFailed'
  const message = globalThis.game?.i18n?.localize?.(messageKey) ?? messageKey

  console.error(`${MODULE.TITLE} | ${message}`, error)
  globalThis.ui?.notifications?.error?.(message)
}

export function registerSystemModule(coreModule) {
  if (globalThis.game?.system?.id !== SYSTEM_ID) return false

  try {
    const systemModule = globalThis.game?.modules?.get(MODULE.ID)
    if (!systemModule) {
      throw new Error(`Foundry module '${MODULE.ID}' is unavailable`)
    }

    const SystemManager = createSystemManagerClass(coreModule?.api)
    systemModule.api = {
      requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
      SystemManager
    }

    globalThis.Hooks.callAll(HOOKS.SYSTEM_READY, systemModule)
    return true
  } catch (error) {
    reportRegistrationFailure(error)
    return false
  }
}

globalThis.Hooks.once(HOOKS.CORE_API_READY, registerSystemModule)
