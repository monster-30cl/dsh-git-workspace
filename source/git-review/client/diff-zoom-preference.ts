/** Live code-comparison zoom preference shared by review surfaces and Settings. */

import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  DEFAULT_DIFF_ZOOM_MODIFIER, DIFF_ZOOM_MODIFIER_FIELD, type DiffZoomModifier, type GitHistorySettings,
} from '../diff-zoom-settings.ts'

/** Reactive preference face injected into Git review bodies and its Settings row. */
export interface DiffZoomPreferenceInjected {
  hooks: {
    /** Current modifier used with the wheel inside code comparisons. */
    diffZoomModifier: SnapshotStore<DiffZoomModifier>
  }
}

/** Owns the live zoom modifier and its durable settings write. */
export class DiffZoomPreferenceController {
  /** Reactive modifier shared by all mounted review surfaces. */
  readonly diffZoomModifier = createSnapshotStore<DiffZoomModifier>(DEFAULT_DIFF_ZOOM_MODIFIER)

  /** @param host - durable Git review settings scope. */
  constructor(private readonly host: SettingsScope<GitHistorySettings>) {
    host.subscribe(() => { this.adopt() })
    this.adopt()
  }

  /** Persist and publish the modifier selected in Settings. */
  setDiffZoomModifier(modifier: DiffZoomModifier): void {
    if (this.diffZoomModifier.getSnapshot() === modifier) return
    this.diffZoomModifier.set(modifier)
    void this.host.set(DIFF_ZOOM_MODIFIER_FIELD, modifier)
  }

  /** Adopt the latest accepted durable setting without writing it back. */
  private adopt(): void {
    const modifier = this.host.getSnapshot().value?.diffZoomModifier
    if (modifier === undefined || modifier === this.diffZoomModifier.getSnapshot()) return
    this.diffZoomModifier.set(modifier)
  }
}
