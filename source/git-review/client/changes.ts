/**
 * The working-changes read: the uncommitted files and the stash list behind one
 * call, and the face the region component receives.
 *
 * The component never awaits anything itself: it calls `readChanges` on mount
 * and on reload, and keeps the settled result in local state. The status,
 * pending-push, and stash Remote reads run together. A section-specific failure
 * keeps the other sections on screen; a failed status read fails the whole read.
 *
 * A selected working-tree file opens the shared review comparison directly.
 */
import type { ClientRemote, RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  GitWorkspaceCommit, GitWorkspaceCommitDiffState, GitWorkspaceStashEntry, GitWorkspaceStashFile,
  GitWorkspaceStatusFile,
} from '@monster-30cl/dsh-git-workspace-controller/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import type { ReadGitCommitDiff, ReadGitCommitFiles } from './face.ts'
import type { DiffZoomPreferenceInjected } from './diff-zoom-preference.ts'

/** What one working-changes read settled to. */
export interface GitChangesRead {
  /** Whether the workspace is a Git repository at all. */
  readonly repository: boolean
  /** Every changed or untracked file the status reported. */
  readonly files: readonly GitWorkspaceStatusFile[]
  /** Stash entries, newest first; empty when the stash read failed. */
  readonly stashes: readonly GitWorkspaceStashEntry[]
  /** Current-branch commits absent from its configured upstream. */
  readonly pendingPush: readonly GitWorkspaceCommit[]
  readonly hasUpstream: boolean
  readonly pendingMore: boolean
  /** Why the status read failed. */
  readonly failure: RemoteFailure | undefined
  /** Why the pending-push read failed without hiding other sections. */
  readonly pendingFailure: RemoteFailure | undefined
  /** Why the stash read failed without hiding other sections. */
  readonly stashFailure: RemoteFailure | undefined
}

/** One working-changes read, bound to a Remote face. */
export type ReadGitChanges = (workspaceId: WorkspaceId, signal: AbortSignal) => Promise<GitChangesRead>

/** One working-tree mutation, returning a displayable failure when refused. */
export type GitChangesMutation = (
  workspaceId: WorkspaceId, signal: AbortSignal, paths: readonly string[], message?: string,
) => Promise<RemoteFailure | undefined>

/** Permanently discard selected status rows. */
export type RollbackGitChanges = (
  workspaceId: WorkspaceId, signal: AbortSignal, files: readonly GitWorkspaceStatusFile[],
) => Promise<RemoteFailure | undefined>

/** Pull or push the current branch through its configured upstream. */
export type SyncGitChanges = (workspaceId: WorkspaceId, signal: AbortSignal) => Promise<RemoteFailure | undefined>

/** One selected stash read, preserving a displayable Remote failure. */
export type ReadGitStashFiles = (
  workspaceId: WorkspaceId, selector: string, signal: AbortSignal,
) => Promise<{ readonly files: readonly GitWorkspaceStashFile[]; readonly failure?: RemoteFailure }>

/** Mutate one selected stash in its Workspace. */
export type GitStashMutation = (
  workspaceId: WorkspaceId, selector: string, signal: AbortSignal,
) => Promise<RemoteFailure | undefined>

/** Read one working-tree file through the review comparison response. */
export type ReadGitWorkingDiff = (
  workspaceId: WorkspaceId, file: GitWorkspaceStatusFile, signal: AbortSignal,
) => Promise<RemoteResult<GitWorkspaceCommitDiffState>>

/**
 * The slice of the Client Remote face this region calls: the `gitWorkspace`
 * namespace's inspection and mutation methods as the generated Client declares them.
 */
export type GitWorkspaceChangesRemote = {
  readonly gitWorkspace: Pick<
    ClientRemote['gitWorkspace'], 'status' | 'workingDiff' | 'stash' | 'pendingPush' | 'commit' | 'push' | 'pull' | 'stashCreate' | 'stashFiles' | 'stashPop' | 'stashDrop' | 'rollback'
  >
}

/**
 * Bind the read to one Remote face.
 * @param remote - the Client Remote face carrying the `gitWorkspace` namespace.
 * @returns the read the working-changes region performs.
 */
export function createReadChanges(remote: GitWorkspaceChangesRemote): ReadGitChanges {
  return async (workspaceId, signal) => {
    const [status, stash, pending] = await Promise.all([
      remote.gitWorkspace.status({ workspaceId }, signal),
      remote.gitWorkspace.stash({ workspaceId }, signal),
      remote.gitWorkspace.pendingPush({ workspaceId }, signal),
    ])
    if (!status.ok) return {
      repository: false, files: [], stashes: [], pendingPush: [], hasUpstream: false, pendingMore: false,
      failure: status.error, pendingFailure: undefined, stashFailure: undefined,
    }
    if (!status.value.repository) return {
      repository: false, files: [], stashes: [], pendingPush: [], hasUpstream: false, pendingMore: false,
      failure: undefined, pendingFailure: undefined, stashFailure: undefined,
    }
    return {
      repository: true,
      files: status.value.files,
      stashes: stash.ok && stash.value.repository ? stash.value.entries : [],
      pendingPush: pending.ok && pending.value.repository ? pending.value.commits : [],
      hasUpstream: pending.ok && pending.value.repository ? pending.value.upstream : false,
      pendingMore: pending.ok && pending.value.repository ? pending.value.more : false,
      failure: undefined,
      pendingFailure: pending.ok ? undefined : pending.error,
      stashFailure: stash.ok ? undefined : stash.error,
    }
  }
}

/** The working-changes region's injected business face, as the component receives it. */
export interface GitChangesInjected extends DiffZoomPreferenceInjected {
  /** Read pending commits, uncommitted files, and stashes for one workspace. */
  readonly readChanges: ReadGitChanges
  readonly commitChanges: GitChangesMutation
  readonly commitAndPushChanges: GitChangesMutation
  readonly pushChanges: SyncGitChanges
  readonly pullChanges: SyncGitChanges
  readonly stashChanges: GitChangesMutation
  readonly rollbackChanges: RollbackGitChanges
  readonly readStashFiles: ReadGitStashFiles
  readonly restoreStash: GitStashMutation
  readonly dropStash: GitStashMutation
  readonly readWorkingDiff: ReadGitWorkingDiff
  readonly readCommitFiles: ReadGitCommitFiles
  readonly readCommitDiff: ReadGitCommitDiff
}
