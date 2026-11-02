/**
 * The commit history's view state: the loaded page, the search that produced it,
 * and how far the paging has walked.
 *
 * One tab shows one workspace's history, so a tab's bucket is one page window,
 * not a per-path map like the file tree. The bucket is keyed by tab id because
 * two tabs of this kind in one session search and page independently.
 *
 * Writers run between `start` and `forget`: the owner's `signal` ends a bucket's
 * life, and the face stops dispatching once it aborts.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { TabId } from '@deepseek-ai/dsh-client-ui-dockkit'
import type { GitWorkspaceCommit } from '@monster-30cl/dsh-git-workspace-controller/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'

/** One settled page, as the face hands it to the store. */
export interface GitPage {
  /** The commits on this page, newest first. */
  readonly commits: readonly GitWorkspaceCommit[]
  /** More commits exist beyond this page. */
  readonly more: boolean
  /** Checked-out branch; absent in detached HEAD or when the page is not a repository. */
  readonly branch?: string
  /** Whether the workspace is a Git repository at all. */
  readonly repository: boolean
  /** Distinct author names seen in the read branch; sent with the first page only. */
  readonly authors?: readonly string[]
}

/**
 * One tab's history window.
 *
 * `search` and `skip` describe the page set already loaded, so reload and
 * load-more re-ask the exact window the reader is looking at. `author` is the
 * author filter that page set was read with, so the dropdown shows what is
 * applied rather than what is merely selected.
 */
export interface GitTabState {
  workspaceId: WorkspaceId
  /** Current branch, or undefined for a detached HEAD. */
  branch: string | undefined
  repository: boolean
  commits: GitWorkspaceCommit[]
  search: string
  /** Applied author filter; blank means every author. */
  author: string
  /** Selectable author names, newest-read first page's list. */
  authors: readonly string[]
  /** Commits already loaded for the current filter; the next page's offset. */
  skip: number
  more: boolean
  status: 'loading' | 'ready' | 'failed'
  loadingMore: boolean
  failure: RemoteFailure | undefined
}

/** Every tab's history, keyed by tab id. */
export interface GitHistoryState {
  byTab: Record<TabId, GitTabState>
}

/**
 * One tab's bucket, which every writer after `start` relies on.
 * @param state - the draft.
 * @param tabId - the tab being written.
 * @returns the tab's history window.
 */
function bucket(state: GitHistoryState, tabId: TabId): GitTabState {
  const history = state.byTab[tabId]
  if (history === undefined) throw new Error(`ui-sidebar-git-history: no history for tab "${tabId}"`)
  return history
}

/** Apply one settled page to a bucket; `append` keeps what is already loaded. */
function applyPage(draft: GitTabState, page: GitPage, append: boolean): void {
  draft.repository = page.repository
  draft.branch = page.branch
  draft.failure = undefined
  draft.loadingMore = false
  draft.status = 'ready'
  if (page.repository) {
    draft.commits = append ? [...draft.commits, ...page.commits] : [...page.commits]
    draft.skip = append ? draft.skip + page.commits.length : page.commits.length
    draft.more = page.more
    // Only a first page carries the author list; a later page keeps what the
    // window already offers so the dropdown does not empty while paging.
    if (page.authors !== undefined) draft.authors = [...page.authors]
  } else {
    draft.commits = []
    draft.skip = 0
    draft.more = false
    draft.authors = []
  }
}

/** The history store's write set; every action names the tab it writes. */
type GitHistoryActions = {
  start: (draft: GitHistoryState, tabId: TabId, workspaceId: WorkspaceId) => void
  loading: (draft: GitHistoryState, tabId: TabId, search: string, author: string) => void
  loaded: (draft: GitHistoryState, tabId: TabId, page: GitPage) => void
  moreLoading: (draft: GitHistoryState, tabId: TabId) => void
  appended: (draft: GitHistoryState, tabId: TabId, page: GitPage) => void
  failed: (draft: GitHistoryState, tabId: TabId, failure: RemoteFailure) => void
  forget: (draft: GitHistoryState, tabId: TabId) => void
}

/**
 * Declare the commit history's store.
 * @returns the store handle to declare on the registration.
 */
export function createGitHistoryStore(): EngineStoreHandle<GitHistoryState, GitHistoryActions> {
  return defineStore({
    init: (): GitHistoryState => ({ byTab: {} }),
    actions: {
      /**
       * Seed one tab's history window as loading its first page.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param workspaceId - the workspace whose history is shown.
       */
      start: (d, tabId: TabId, workspaceId: WorkspaceId) => {
        d.byTab[tabId] = {
          workspaceId,
          branch: undefined,
          repository: true,
          commits: [],
          search: '',
          author: '',
          authors: [],
          skip: 0,
          more: false,
          status: 'loading',
          loadingMore: false,
          failure: undefined,
        }
      },
      /**
       * Mark a first-page read (open, reload, or a new filter) as in flight.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param search - the subject filter the read carries.
       * @param author - the author filter the read carries; blank means every author.
       */
      loading: (d, tabId: TabId, search: string, author: string) => {
        const state = bucket(d, tabId)
        state.search = search
        state.author = author
        state.status = 'loading'
        state.failure = undefined
      },
      /**
       * Record a settled first page, replacing the window.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param page - the settled page.
       */
      loaded: (d, tabId: TabId, page: GitPage) => {
        applyPage(bucket(d, tabId), page, false)
      },
      /**
       * Mark a later page as in flight, keeping the loaded window on screen.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       */
      moreLoading: (d, tabId: TabId) => {
        bucket(d, tabId).loadingMore = true
      },
      /**
       * Append a settled later page to the window.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param page - the settled page.
       */
      appended: (d, tabId: TabId, page: GitPage) => {
        applyPage(bucket(d, tabId), page, true)
      },
      /**
       * Record why a read failed, for either page kind.
       * @param d - draft state.
       * @param tabId - the tab being drawn.
       * @param failure - the settled Remote failure.
       */
      failed: (d, tabId: TabId, failure: RemoteFailure) => {
        const state = bucket(d, tabId)
        state.status = 'failed'
        state.loadingMore = false
        state.failure = failure
      },
      /**
       * Forget one tab's history, for a tab record that is gone.
       * @param d - draft state.
       * @param tabId - the tab that went away.
       */
      forget: (d, tabId: TabId) => {
        d.byTab = Object.fromEntries(Object.entries(d.byTab).filter(([id]) => id !== tabId))
      },
    },
  })
}
