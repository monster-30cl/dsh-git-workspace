/** Code-comparison zoom preference stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the Git review feature. */
export const GIT_HISTORY_SETTINGS_NAMESPACE = 'ui-sidebar-git-history'

/** Field carrying the modifier used with the mouse wheel. */
export const DIFF_ZOOM_MODIFIER_FIELD = 'diffZoomModifier'

/** Keyboard modifiers accepted by the code-comparison zoom gesture. */
export const DIFF_ZOOM_MODIFIERS = ['alt', 'control', 'shift'] as const

/** Keyboard modifier used with the wheel to resize comparison text. */
export type DiffZoomModifier = typeof DIFF_ZOOM_MODIFIERS[number]

/** Default avoids the browser's Ctrl+wheel page-zoom gesture. */
export const DEFAULT_DIFF_ZOOM_MODIFIER: DiffZoomModifier = 'alt'

/** Durable Git review section shared by the Host schema and browser scope. */
export interface GitHistorySettings {
  /** Modifier used with the wheel inside a code comparison. */
  diffZoomModifier: DiffZoomModifier
}

/** Durable Git review schema; also validates the browser scope envelope. */
export const GitHistorySettingsSchema: z<GitHistorySettings> = z.object({
  [DIFF_ZOOM_MODIFIER_FIELD]: z.union([...DIFF_ZOOM_MODIFIERS]).default(DEFAULT_DIFF_ZOOM_MODIFIER),
})

/** Ctrl is always available; settings may enable an additional modifier. */
export function matchesDiffZoomModifier(
  event: Pick<WheelEvent, 'altKey' | 'ctrlKey' | 'shiftKey'>,
  modifier: DiffZoomModifier,
): boolean {
  if (event.ctrlKey) return true
  switch (modifier) {
    case 'alt': return event.altKey
    case 'control': return event.ctrlKey
    case 'shift': return event.shiftKey
  }
}
