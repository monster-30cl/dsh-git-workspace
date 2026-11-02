/** General Settings row for the code-comparison zoom modifier. */

import { useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { IconChevronDownOutline14, Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DiffZoomModifier } from '../diff-zoom-settings.ts'
import type { DiffZoomPreferenceInjected } from './diff-zoom-preference.ts'
import type { SidebarGitHistoryKey } from './locales.ts'
import css from './DiffZoomShortcutRow.module.css'

/** Settings-row write face. */
export interface DiffZoomShortcutRowInjected extends DiffZoomPreferenceInjected {
  /** Change the modifier used with the wheel inside code comparisons. */
  setDiffZoomModifier: (modifier: DiffZoomModifier) => void
}

/** Full Settings-row props. */
export type DiffZoomShortcutRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsLocale<'sidebarGitHistory'>
  & InjectFace<DiffZoomShortcutRowInjected>

const DEFAULT_OPTION = { id: 'alt', label: 'settings.diffZoom.alt' } as const
const OPTIONS: readonly { id: DiffZoomModifier; label: SidebarGitHistoryKey }[] = [
  DEFAULT_OPTION,
  { id: 'control', label: 'settings.diffZoom.control' },
  { id: 'shift', label: 'settings.diffZoom.shift' },
]

/** Render the code-comparison zoom shortcut selector. */
export function DiffZoomShortcutRow({ useDiffZoomModifier, setDiffZoomModifier, t }: DiffZoomShortcutRowProps) {
  const modifier = useDiffZoomModifier(value => value)
  const [open, setOpen] = useState(false)
  const selected = OPTIONS.find(option => option.id === modifier) ?? DEFAULT_OPTION
  return (
    <div className={css.row}>
      <div className={css.rowText}>
        <div className={css.title}>{t('settings.diffZoom.title')}</div>
        <div className={css.desc}>{t('settings.diffZoom.description')}</div>
      </div>
      <Menu
        open={open}
        onClose={() => { setOpen(false) }}
        items={OPTIONS.map(option => ({ id: option.id, label: t(option.label) }))}
        selectedId={modifier}
        onSelect={(id) => {
          setOpen(false)
          setDiffZoomModifier(id as DiffZoomModifier)
        }}
        align="end"
        portal
        anchor={(
          <button
            type="button"
            className={css.selector}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => { setOpen(value => !value) }}
          >
            {t(selected.label)}
            <IconChevronDownOutline14 className={css.chevron} />
          </button>
        )}
      />
    </div>
  )
}
