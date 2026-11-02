/**
 * The right-Sidebar Git page: the commit history above the working-changes
 * region, in one pane.
 *
 * This generation of the Sidebar has no `sidebar.right.panel.changes` seat, so
 * the region that used to dock below the history is composed here instead of
 * registering as a separate page. Both bodies keep their own faces; this
 * component only assigns the split, so opening the tab shows the history and
 * the commit controls together.
 */
import type { ReactNode } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { GitChangesBody } from './GitChangesBody.tsx'
import { GitHistoryBody } from './GitHistoryBody.tsx'
import type { GitChangesInjected } from './changes.ts'
import type { GitHistoryInjected } from './face.ts'
import type { createGitHistoryStore } from './store.ts'
import css from './GitReviewPage.module.css'

/**
 * The page's composed props: the tab's runtime, the history store, both
 * business faces, and the history copy.
 */
export type GitReviewPageProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsStore<ReturnType<typeof createGitHistoryStore>>
  & InjectFace<GitHistoryInjected & GitChangesInjected>
  & PropsLocale<'sidebarGitHistory'>

/**
 * Render the commit history with the working-changes region docked beneath it.
 * @param props - the tab's runtime props plus both bodies' faces.
 * @returns the composed page.
 */
export function GitReviewPage(props: GitReviewPageProps): ReactNode {
  return (
    <div className={css.page}>
      <GitHistoryBody {...props} />
      <GitChangesBody {...props} />
    </div>
  )
}
