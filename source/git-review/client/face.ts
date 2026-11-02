/**
 * The history's asynchronous half: reading commit pages into the store.
 *
 * The component never awaits anything. It calls `start` / `reload` / `search` /
 * `loadMore`, and this face performs the read and writes the outcome through the
 * store's own actions — the Slot-standard `inject` shape, so the write set stays
 * the store's.
 *
 * The read itself is bound here to the Client Remote face: the `gitWorkspace`
 * namespace's `log`, exactly as the Host's generated client declares it. The
 * workspace is named by id, which the component derives from the framework's
 * Workspace hook.
 *
 * One tab has one read in force: asking again — a reload, a new search, a
 * load-more — retires the read still in flight for it, whose settlement then
 * writes nothing. Cleanup rides the owner's `signal`: a request is not made for
 * a record that already ended, and when the record goes away the bucket and the
 * tab's read bookkeeping are forgotten.
 */
import type { ClientRemote, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-store'
import type { TabId } from '@deepseek-ai/dsh-client-ui-dockkit'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  GitWorkspaceCommitDiffState, GitWorkspaceCommitFile, GitWorkspaceCommitFilesState, GitWorkspaceLogState,
} from '@deepseek-ai/dsh-api-git-workspace-controller/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import type { GitPage, createGitHistoryStore } from './store.ts'

/** Commits one read asks for. The Host clamps a larger page to its own cap. */
export const GIT_HISTORY_PAGE_SIZE = 50

/**
 * One commit page, bound to a Remote face.
 *
 * The workspace travels with the call because the endpoint reads that
 * Workspace's repository; a Remote call does not reject — the result carries the
 * failure.
 */
export type LogGitHistory = (
  workspaceId: WorkspaceId,
  page: { readonly skip: number; readonly limit: number; readonly search: string },
  signal: AbortSignal,
) => Promise<RemoteResult<GitWorkspaceLogState>>

/** Read the file list for a selected commit. */
export type ReadGitCommitFiles = (
  workspaceId: WorkspaceId, commit: string, signal: AbortSignal,
) => Promise<RemoteResult<GitWorkspaceCommitFilesState>>

/** Read one selected file's complete before/after contents and commit patch. */
export type ReadGitCommitDiff = (
  workspaceId: WorkspaceId, commit: string, file: GitWorkspaceCommitFile, signal: AbortSignal,
) => Promise<RemoteResult<GitWorkspaceCommitDiffState>>

/**
 * The slice of the Client Remote face this package calls: the `gitWorkspace`
 * namespace's `log`, exactly as the Host's generated client declares it.
 */
export type GitWorkspaceLogRemote = {
  readonly gitWorkspace: Pick<ClientRemote['gitWorkspace'], 'log' | 'commitFiles' | 'commitDiff'>
}

/**
 * Bind the read to one Remote face.
 * @param remote - the Client Remote face carrying the `gitWorkspace` namespace.
 * @returns the read the history's face performs.
 */
export function createLog(remote: GitWorkspaceLogRemote): LogGitHistory {
  return (workspaceId, page, signal) => remote.gitWorkspace.log({ workspaceId, ...page }, signal)
}

/** Bind commit-detail reads to one Remote face. */
export function createCommitReaders(remote: GitWorkspaceLogRemote): {
  readCommitFiles: ReadGitCommitFiles
  readCommitDiff: ReadGitCommitDiff
} {
  return {
    readCommitFiles: (workspaceId, commit, signal) => remote.gitWorkspace.commitFiles({ workspaceId, commit }, signal),
    readCommitDiff: (workspaceId, commit, file, signal) => (
      remote.gitWorkspace.commitDiff({
        workspaceId,
        commit,
        path: file.path,
        ...(file.renamedFrom === undefined ? {} : { previousPath: file.renamedFrom }),
      }, signal)
    ),
  }
}

/** Reduce one settled state to the page the store keeps. */
function pageOf(state: GitWorkspaceLogState): GitPage {
  if (!state.repository) return { commits: [], more: false, repository: false }
  return {
    commits: state.commits,
    more: state.more,
    ...(state.branch === undefined ? {} : { branch: state.branch }),
    repository: true,
  }
}

/** The history's injected business face, as the body receives it. */
export interface GitHistoryInjected {
  readonly readCommitFiles: ReadGitCommitFiles
  readonly readCommitDiff: ReadGitCommitDiff
  /**
   * Seed this tab's history and read its first page.
   * @param tabId - the tab being drawn.
   * @param workspaceId - the workspace whose history is shown.
   * @param signal - the tab record's lifetime.
   */
  readonly start: (tabId: TabId, workspaceId: WorkspaceId, signal: AbortSignal) => void
  /**
   * Re-read the first page with a subject filter; the window the reader sees is
   * replaced. The reload control passes the window's own query; the search form
   * passes the query it just submitted.
   * @param tabId - the tab being drawn.
   * @param workspaceId - the workspace whose history is shown.
   * @param search - the subject filter to ask for.
   * @param signal - the tab record's lifetime.
   */
  readonly reload: (tabId: TabId, workspaceId: WorkspaceId, search: string, signal: AbortSignal) => void
  /**
   * Append the page after the one already loaded.
   * @param tabId - the tab being drawn.
   * @param workspaceId - the workspace whose history is shown.
   * @param search - the subject filter the window carries.
   * @param skip - commits already loaded; the next page's offset.
   * @param signal - the tab record's lifetime.
   */
  readonly loadMore: (
    tabId: TabId,
    workspaceId: WorkspaceId,
    search: string,
    skip: number,
    signal: AbortSignal,
  ) => void
}

/**
 * Bind the history's face to one commit read.
 * @param log - the bound `gitWorkspace.log` call.
 * @returns the Slot `inject` factory: session and bound actions in, face out.
 */
export function gitHistoryFace(
  log: LogGitHistory,
  readers: Pick<GitHistoryInjected, 'readCommitFiles' | 'readCommitDiff'>,
): (_sessionId: SessionId, actions: BoundActions<ReturnType<typeof createGitHistoryStore>>) => GitHistoryInjected {
  return (_sessionId, actions): GitHistoryInjected => {
    /** Per tab: the read generation a settlement must match; the latest request wins. */
    const generations = new Map<TabId, number>()
    const nextGeneration = (tabId: TabId): number => {
      const generation = (generations.get(tabId) ?? 0) + 1
      generations.set(tabId, generation)
      return generation
    }
    const read = (
      tabId: TabId,
      workspaceId: WorkspaceId,
      search: string,
      skip: number,
      signal: AbortSignal,
    ): void => {
      if (signal.aborted) return
      const generation = nextGeneration(tabId)
      if (skip === 0) actions.loading(tabId, search)
      else actions.moreLoading(tabId)
      void log(workspaceId, { skip, limit: GIT_HISTORY_PAGE_SIZE, search }, signal).then((result) => {
        // A newer read of this tab was asked for since, or the record is gone and
        // its bookkeeping with it: nothing left for this one to write.
        if (generations.get(tabId) !== generation) return
        if (result.ok) {
          if (skip === 0) actions.loaded(tabId, pageOf(result.value))
          else actions.appended(tabId, pageOf(result.value))
        } else actions.failed(tabId, result.error)
      })
    }
    return {
      ...readers,
      start(tabId, workspaceId, signal) {
        actions.start(tabId, workspaceId)
        signal.addEventListener('abort', () => {
          generations.delete(tabId)
          actions.forget(tabId)
        }, { once: true })
        read(tabId, workspaceId, '', 0, signal)
      },
      reload(tabId, workspaceId, search, signal) {
        read(tabId, workspaceId, search, 0, signal)
      },
      loadMore(tabId, workspaceId, search, skip, signal) {
        read(tabId, workspaceId, search, skip, signal)
      },
    }
  }
}
