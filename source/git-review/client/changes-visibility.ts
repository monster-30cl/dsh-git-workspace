/** Session-local visibility shared by the Git history page and its changes region. */
import { useCallback, useSyncExternalStore } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/**
 * A session with no recorded choice shows the region: the Git page opens with
 * the working changes and its commit controls in view, and the history header's
 * control hides them again.
 */
const DEFAULT_VISIBLE = true

const visible = new Map<SessionId, boolean>()
const listeners = new Map<SessionId, Set<() => void>>()
const historyListeners = new Map<SessionId, Set<() => void>>()

/** Notify the history tab after this session successfully changes repository history. */
export function notifyGitHistoryRefresh(sessionId: SessionId): void {
  for (const listener of historyListeners.get(sessionId) ?? []) listener()
}

/** Follow successful mutations from the session's working-changes region. */
export function subscribeGitHistoryRefresh(sessionId: SessionId, listener: () => void): () => void {
  const sessionListeners = historyListeners.get(sessionId) ?? new Set<() => void>()
  sessionListeners.add(listener)
  historyListeners.set(sessionId, sessionListeners)
  return () => {
    sessionListeners.delete(listener)
    if (sessionListeners.size === 0) historyListeners.delete(sessionId)
  }
}

function subscribe(sessionId: SessionId, listener: () => void): () => void {
  const sessionListeners = listeners.get(sessionId) ?? new Set<() => void>()
  sessionListeners.add(listener)
  listeners.set(sessionId, sessionListeners)
  return () => {
    sessionListeners.delete(listener)
    if (sessionListeners.size === 0) {
      listeners.delete(sessionId)
      visible.delete(sessionId)
    }
  }
}

/** Set whether the working-changes region is visible for one session. */
export function setGitChangesVisible(sessionId: SessionId, next: boolean): void {
  if ((visible.get(sessionId) ?? DEFAULT_VISIBLE) === next) return
  visible.set(sessionId, next)
  for (const listener of listeners.get(sessionId) ?? []) listener()
}

/** Read and follow the working-changes region's visibility for one session. */
export function useGitChangesVisible(sessionId: SessionId): boolean {
  const subscribeSession = useCallback(
    (listener: () => void) => subscribe(sessionId, listener),
    [sessionId],
  )
  const getSnapshot = useCallback(() => visible.get(sessionId) ?? DEFAULT_VISIBLE, [sessionId])
  return useSyncExternalStore(
    subscribeSession,
    getSnapshot,
    () => DEFAULT_VISIBLE,
  )
}
