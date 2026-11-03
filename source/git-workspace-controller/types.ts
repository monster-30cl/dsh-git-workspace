/** Browser-safe Git branch requests and results. */

import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'

/** Request that identifies one registered Workspace. */
export interface GitWorkspaceRequest {
  readonly workspaceId: WorkspaceId
}

/** Request that identifies one registered Workspace and local branch. */
export interface GitWorkspaceBranchRequest extends GitWorkspaceRequest {
  readonly branch: string
}

/** Request that commits selected Workspace changes with one message. */
export interface GitWorkspaceCommitRequest extends GitWorkspaceRequest {
  readonly message: string
  /** Workspace-relative paths selected from the current status result. */
  readonly paths: readonly string[]
  /** Push the current branch after the commit succeeds. */
  readonly push?: boolean
}

/** Request that creates one named stash from current Workspace changes. */
export interface GitWorkspaceStashCreateRequest extends GitWorkspaceRequest {
  readonly message: string
  /** Workspace-relative paths selected from the current status result. */
  readonly paths: readonly string[]
}

/** Request that permanently discards selected working-tree changes. */
export interface GitWorkspaceRollbackRequest extends GitWorkspaceRequest {
  /** Tracked paths restored from HEAD in both the index and working tree. */
  readonly trackedPaths: readonly string[]
  /** Untracked paths permanently removed from the working tree. */
  readonly untrackedPaths: readonly string[]
}

/** Request that identifies one stash returned by this controller. */
export interface GitWorkspaceStashSelectionRequest extends GitWorkspaceRequest {
  readonly selector: string
}

/** Successful Git mutation result. */
export interface GitWorkspaceMutationState {
  readonly repository: true
}

/** Request that identifies one Workspace and one commit-history page. */
export interface GitWorkspaceLogRequest extends GitWorkspaceRequest {
  /** Commits skipped from the tip; the paging offset. Values below zero are clamped. */
  readonly skip?: number
  /** Commits to return; the Host clamps to its page cap. */
  readonly limit?: number
  /** Case-insensitive subject substring filter; blank means no filter. */
  readonly search?: string
  /** Case-insensitive, literal author-name filter; blank means every author. */
  readonly author?: string
  /** Inclusive `YYYY-MM-DD` lower bound on the commit date; blank means unbounded. */
  readonly since?: string
  /** Inclusive `YYYY-MM-DD` upper bound on the commit date; blank means unbounded. */
  readonly until?: string
}

/** Request that identifies one commit returned by this controller. */
export interface GitWorkspaceCommitSelectionRequest extends GitWorkspaceRequest {
  readonly commit: string
}

/** Request that identifies one changed file in one returned commit. */
export interface GitWorkspaceCommitFileRequest extends GitWorkspaceCommitSelectionRequest {
  readonly path: string
  readonly previousPath?: string
}

/** Request that identifies one changed working-tree file returned by {@link GitWorkspaceStatusState}. */
export interface GitWorkspaceWorkingDiffRequest extends GitWorkspaceRequest {
  readonly path: string
  readonly previousPath?: string
  readonly untracked: boolean
}

/** One commit row as Git reported it. */
export interface GitWorkspaceCommit {
  /** Full commit hash. */
  readonly hash: string
  /** Abbreviated hash as Git rendered it. */
  readonly shortHash: string
  /** Commit subject line. */
  readonly subject: string
  readonly authorName: string
  readonly authorEmail: string
  /** Author date in strict ISO 8601. */
  readonly date: string
}

/** One file changed by a selected commit. */
export interface GitWorkspaceCommitFile {
  readonly status: string
  readonly path: string
  readonly renamedFrom?: string
}

/** Files changed by one selected commit. */
export interface GitWorkspaceCommitFilesState {
  readonly repository: true
  readonly files: readonly GitWorkspaceCommitFile[]
}

/** Complete before/after contents and unified patch for one file in one selected commit. */
export interface GitWorkspaceCommitDiffState {
  readonly repository: true
  readonly binary: boolean
  readonly before: string
  readonly after: string
  readonly patch: string
}

/** Commit-history page for one Workspace directory. */
export type GitWorkspaceLogState =
  | { readonly repository: false }
  | {
    readonly repository: true
    readonly commits: readonly GitWorkspaceCommit[]
    /** More commits exist beyond this page; the Client asks again with a larger `skip`. */
    readonly more: boolean
    /** Checked-out branch name; absent in detached HEAD. */
    readonly branch?: string
    /** Distinct author names in the read branch; sent with the first page only. */
    readonly authors?: readonly string[]
  }

/** Commits on the current branch that are not present on its configured upstream. */
export type GitWorkspacePendingPushState =
  | { readonly repository: false }
  | {
    readonly repository: true
    /** False when the current branch has no configured upstream. */
    readonly upstream: boolean
    readonly commits: readonly GitWorkspaceCommit[]
    /** More unpublished commits exist beyond the configured response cap. */
    readonly more: boolean
  }

/** Current local-branch state for one Workspace directory. */
export type GitWorkspaceBranchState =
  | { readonly repository: false }
  | {
    readonly repository: true
    readonly localBranches: readonly string[]
    /** Remote-tracking branches, excluding symbolic remote HEAD aliases. */
    readonly remoteBranches: readonly string[]
    readonly current?: string
    readonly detached: boolean
  }

/** One working-tree file as `status` reported it. */
export interface GitWorkspaceStatusFile {
  /** Workspace-relative path with forward slashes, as Git spelled it. */
  readonly path: string
  /** Index status letter; `.` means unchanged in the index. */
  readonly indexStatus: string
  /** Work-tree status letter; `.` means unchanged against the index. */
  readonly worktreeStatus: string
  /** The file is untracked. */
  readonly untracked: boolean
  /** Original path of a rename or copy record. */
  readonly renamedFrom?: string
}

/** Uncommitted working-tree state for one Workspace directory. */
export type GitWorkspaceStatusState =
  | { readonly repository: false }
  | {
    readonly repository: true
    /** Every reported file: tracked changes and untracked files together. */
    readonly files: readonly GitWorkspaceStatusFile[]
  }

/** One stash entry as `stash list` reported it, newest first. */
export interface GitWorkspaceStashEntry {
  /** Reflog selector, e.g. `stash@{0}`. */
  readonly selector: string
  /** Entry date in strict ISO 8601. */
  readonly date: string
  /** Stash subject line. */
  readonly subject: string
}

/** One file stored in a stash. */
export interface GitWorkspaceStashFile {
  readonly status: string
  readonly path: string
  readonly renamedFrom?: string
}

/** Files stored in one selected stash. */
export interface GitWorkspaceStashFilesState {
  readonly repository: true
  readonly files: readonly GitWorkspaceStashFile[]
}

/** Stash list for one Workspace directory. */
export type GitWorkspaceStashState =
  | { readonly repository: false }
  | {
    readonly repository: true
    readonly entries: readonly GitWorkspaceStashEntry[]
  }

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** Git could not be resolved in the execution environment. */
    'git/unavailable': { readonly workspaceId: WorkspaceId }
    /** Git refused a branch read, history read, status read, stash read, or mutation. */
    'git/operation-failed': {
      readonly workspaceId: WorkspaceId
      readonly operation: 'list' | 'checkout' | 'checkout-remote' | 'create' | 'delete' | 'log' | 'commit-files' | 'commit-diff' | 'working-diff' | 'pending-push' | 'status' | 'stash' | 'stash-files' | 'stash-pop' | 'stash-drop' | 'add' | 'commit' | 'push' | 'pull' | 'stash-create' | 'rollback'
    }
    /** A branch change would overwrite uncommitted Workspace files. */
    'git/worktree-dirty': {
      readonly workspaceId: WorkspaceId
      readonly operation: 'checkout' | 'checkout-remote' | 'create'
      readonly branch: string
    }
  }
}
