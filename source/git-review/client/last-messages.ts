/** Persist the most recent successful commit and stash messages per Workspace. */

import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'

const STORAGE_KEY = 'dsh.gitWorkspace.lastMessages'

/** Git mutation whose last successful message is remembered. */
export type GitMessageKind = 'commit' | 'stash'

type StoredMessages = Record<string, Partial<Record<GitMessageKind, string>>>

/**
 * Read one previously successful message; unavailable storage behaves as empty.
 * @param workspaceId - Workspace that owns the message history.
 * @param kind - Commit or stash message slot.
 * @returns the stored message, or undefined when none is available.
 */
export function readLastGitMessage(workspaceId: WorkspaceId, kind: GitMessageKind): string | undefined {
  if (typeof localStorage === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return undefined
    const value = (JSON.parse(raw) as StoredMessages)[workspaceId]?.[kind]
    return typeof value === 'string' && value !== '' ? value : undefined
  } catch {
    // Invalid or unavailable browser storage only removes the optional hint.
    return undefined
  }
}

/**
 * Save one successful message; storage failure never changes the Git result.
 * @param workspaceId - Workspace that owns the message history.
 * @param kind - Commit or stash message slot.
 * @param message - successful mutation message to remember.
 */
export function writeLastGitMessage(workspaceId: WorkspaceId, kind: GitMessageKind, message: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored = raw === null ? {} : JSON.parse(raw) as StoredMessages
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...stored,
      [workspaceId]: { ...stored[workspaceId], [kind]: message },
    }))
  } catch {
    // Quota, private mode, or invalid prior data only disables the optional hint.
  }
}
