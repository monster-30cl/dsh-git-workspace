/**
 * Browser half: register `gitHistory` as a right-Sidebar tab type whose page
 * carries both the commit history and the working-changes region.
 *
 * The tab follows the public two-stage path: the type into
 * `ctx.sidebarRightTabs`, the body into the keyed `sidebar.right.pane.tab` seat
 * under the type's `id`. One registration supplies both faces — the history's
 * commit readers and the changes region's status, commit, and stash operations —
 * so the page opens with the review and its commit controls together. The
 * changes region is no longer a second tab type: this generation of the panel
 * has no `sidebar.right.panel.changes` seat to dock it into.
 *
 * The file split is this package's layering: what the type IS
 * (`definition.ts`), what it keeps (`store.ts`), how it reads (`face.ts` and
 * `changes.ts`), what it draws (`GitReviewPage.tsx`, `GitHistoryBody.tsx`,
 * `GitChangesBody.tsx`), what it says (`locales.ts`), and this module, which only
 * wires them together.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import { GIT_HISTORY_SETTINGS_NAMESPACE, type GitHistorySettings } from '../diff-zoom-settings.ts'
import { createReadChanges } from './changes.ts'
import type { GitChangesInjected } from './changes.ts'
import { GIT_HISTORY_ID, gitHistoryDefinition } from './definition.ts'
import { DiffZoomShortcutRow, type DiffZoomShortcutRowInjected } from './DiffZoomShortcutRow.tsx'
import { DiffZoomPreferenceController } from './diff-zoom-preference.ts'
import { createCommitReaders, createLog, gitHistoryFace } from './face.ts'
import { GitReviewPage } from './GitReviewPage.tsx'
import { en, zh } from './locales.ts'
import { createGitHistoryStore } from './store.ts'

export type { SidebarGitHistoryKey } from './locales.ts'
export type { GitHistoryState, GitPage, GitTabState } from './store.ts'
export type { GitHistoryInjected, GitWorkspaceLogRemote, LogGitHistory } from './face.ts'
export type { GitChangesInjected, GitChangesRead, GitWorkspaceChangesRemote, ReadGitChanges } from './changes.ts'
export type { GitHistoryBodyProps } from './GitHistoryBody.tsx'
export type { GitChangesBodyProps } from './GitChangesBody.tsx'
export type { GitReviewPageProps } from './GitReviewPage.tsx'
export type { DiffZoomShortcutRowInjected, DiffZoomShortcutRowProps } from './DiffZoomShortcutRow.tsx'
export type { DiffZoomPreferenceInjected } from './diff-zoom-preference.ts'

/** This package's copy namespace. */
const NS = 'sidebarGitHistory'

/**
 * Required browser services: the tab registry, the keyed seat, the Remote
 * carrier and its namespace, the settings scope, and copy.
 */
export const inject = [
  'slots', 'locale', 'sidebarRightTabs', 'sidebarRight', 'remote', 'remote.gitWorkspace', 'settingsScope',
]

/**
 * Client plugin body: register the type, its dictionaries, then its page.
 * @param ctx - client root context carrying the registry, the slots, and the Remote face.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.sidebarRightTabs.register(gitHistoryDefinition(t)), 'ui-sidebar-git-history: gitHistory type')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar-git-history: dictionaries')

  const store = createGitHistoryStore()
  const historyFace = gitHistoryFace(createLog(ctx.remote), createCommitReaders(ctx.remote))
  const zoomPreference = new DiffZoomPreferenceController(
    ctx.settingsScope.bind<GitHistorySettings>({ namespace: GIT_HISTORY_SETTINGS_NAMESPACE }),
  )
  const zoomHooks = { diffZoomModifier: zoomPreference.diffZoomModifier }
  const readChanges = createReadChanges(ctx.remote)
  const commitReaders = createCommitReaders(ctx.remote)
  const changesFace: Omit<GitChangesInjected, 'hooks'> = {
    readChanges,
    commitChanges: async (workspaceId, signal, paths, message) => {
      const result = await ctx.remote.gitWorkspace.commit({ workspaceId, message: message ?? '', paths }, signal)
      return result.ok ? undefined : result.error
    },
    commitAndPushChanges: async (workspaceId, signal, paths, message) => {
      const result = await ctx.remote.gitWorkspace.commit({ workspaceId, message: message ?? '', paths, push: true }, signal)
      return result.ok ? undefined : result.error
    },
    pushChanges: async (workspaceId, signal) => {
      const result = await ctx.remote.gitWorkspace.push({ workspaceId }, signal)
      return result.ok ? undefined : result.error
    },
    pullChanges: async (workspaceId, signal) => {
      const result = await ctx.remote.gitWorkspace.pull({ workspaceId }, signal)
      return result.ok ? undefined : result.error
    },
    stashChanges: async (workspaceId, signal, paths, message) => {
      const result = await ctx.remote.gitWorkspace.stashCreate({ workspaceId, message: message ?? '', paths }, signal)
      return result.ok ? undefined : result.error
    },
    rollbackChanges: async (workspaceId, signal, files) => {
      const trackedPaths = files.filter(file => !file.untracked).flatMap(file => [
        file.path, ...(file.renamedFrom === undefined ? [] : [file.renamedFrom]),
      ])
      const untrackedPaths = files.filter(file => file.untracked).map(file => file.path)
      const result = await ctx.remote.gitWorkspace.rollback({ workspaceId, trackedPaths, untrackedPaths }, signal)
      return result.ok ? undefined : result.error
    },
    readStashFiles: async (workspaceId, selector, signal) => {
      const result = await ctx.remote.gitWorkspace.stashFiles({ workspaceId, selector }, signal)
      return result.ok ? { files: result.value.files } : { files: [], failure: result.error }
    },
    restoreStash: async (workspaceId, selector, signal) => {
      const result = await ctx.remote.gitWorkspace.stashPop({ workspaceId, selector }, signal)
      return result.ok ? undefined : result.error
    },
    dropStash: async (workspaceId, selector, signal) => {
      const result = await ctx.remote.gitWorkspace.stashDrop({ workspaceId, selector }, signal)
      return result.ok ? undefined : result.error
    },
    readWorkingDiff: (workspaceId, file, signal) => ctx.remote.gitWorkspace.workingDiff({
      workspaceId,
      path: file.path,
      ...(file.renamedFrom === undefined ? {} : { previousPath: file.renamedFrom }),
      untracked: file.untracked,
    }, signal),
    ...commitReaders,
  }
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    {
      name: 'sidebar.right.pane.tab', key: GIT_HISTORY_ID, locale: NS, store,
      inject: (sessionId, actions) => ({
        ...historyFace(sessionId, actions),
        ...changesFace,
        hooks: zoomHooks,
      }),
    },
    GitReviewPage,
  )), 'ui-sidebar-git-history: review page body')

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'git-diff-zoom-shortcut',
    order: 25,
    locale: NS,
    inject: (): DiffZoomShortcutRowInjected => ({
      hooks: zoomHooks,
      setDiffZoomModifier: (modifier) => { zoomPreference.setDiffZoomModifier(modifier) },
    }),
  }, DiffZoomShortcutRow))
}
