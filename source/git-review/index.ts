/** Host registration for the browser Git review preferences. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import {
  GIT_HISTORY_SETTINGS_NAMESPACE, GitHistorySettingsSchema,
} from './diff-zoom-settings.ts'

export {
  DEFAULT_DIFF_ZOOM_MODIFIER, DIFF_ZOOM_MODIFIER_FIELD, DIFF_ZOOM_MODIFIERS,
  GIT_HISTORY_SETTINGS_NAMESPACE, type DiffZoomModifier, type GitHistorySettings,
} from './diff-zoom-settings.ts'

/** Register the durable Git review section when a settings provider exists. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(GIT_HISTORY_SETTINGS_NAMESPACE, GitHistorySettingsSchema)
  })
}
