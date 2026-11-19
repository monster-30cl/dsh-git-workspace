/**
 * Stage one of this package's registration: what the `gitHistory` tab type IS.
 *
 * The type is a page, not a viewer: it claims no address. The guide page offers
 * it as an entry box, and picking that box opens the commit history for the
 * session's workspace. Nothing in `ui-sidebar-right` knows this package.
 */
import type { ShortcutCommandId } from '@deepseek-ai/dsh-client-shortcuts/client'
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type {} from './locales.ts'
import { GitReviewIcon } from './GitReviewIcon.tsx'

/** The tab kind this package owns. */
export const GIT_HISTORY_KIND = 'gitHistory'

/** This implementation's identity in the tab system, and the key its body registers under. */
export const GIT_HISTORY_ID = '@deepseek-ai/dsh-client-ui-sidebar-git-history'

/**
 * The commit-history type's registry definition.
 * @param t - namespace-bound translate, read fresh on every label call.
 * @returns the definition to register.
 */
export function gitHistoryDefinition(t: TranslateNS<'sidebarGitHistory'>): SidebarRightTabDefinition {
  return {
    id: GIT_HISTORY_ID,
    kind: GIT_HISTORY_KIND,
    priority: 'builtin',
    title: () => t('type.label'),
    guide: [{
      commandId: 'git.workspace.review.open' as ShortcutCommandId,
      order: 25,
      title: () => t('guide.title'),
      description: () => t('guide.description'),
      icon: GitReviewIcon,
    }],
  }
}
