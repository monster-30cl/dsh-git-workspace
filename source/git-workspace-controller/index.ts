/** Workspace-scoped Git branch discovery and checkout over Typert Remote. */

import type { Context } from '@deepseek-ai/cordis'
import { stripVTControlCharacters } from 'node:util'
import z from '@deepseek-ai/schemastery'
import type { SubprocessHandle } from '@deepseek-ai/dsh-subprocess'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { Workspace } from '@deepseek-ai/dsh-workspace'
import type {
  GitWorkspaceBranchRequest,
  GitWorkspaceBranchState,
  GitWorkspaceCommit,
  GitWorkspaceCommitDiffState,
  GitWorkspaceCommitFileRequest,
  GitWorkspaceCommitFilesState,
  GitWorkspaceCommitRequest,
  GitWorkspaceCommitSelectionRequest,
  GitWorkspaceLogRequest,
  GitWorkspaceLogState,
  GitWorkspaceMutationState,
  GitWorkspacePendingPushState,
  GitWorkspaceRequest,
  GitWorkspaceRollbackRequest,
  GitWorkspaceStashEntry,
  GitWorkspaceStashCreateRequest,
  GitWorkspaceStashFile,
  GitWorkspaceStashFilesState,
  GitWorkspaceStashSelectionRequest,
  GitWorkspaceStashState,
  GitWorkspaceStatusFile,
  GitWorkspaceStatusState,
  GitWorkspaceWorkingDiffRequest,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host owner of the `gitWorkspace` Remote namespace. */
    gitWorkspaceController: GitWorkspaceController
  }
}

/** Recent commits scanned to build the author dropdown's options. */
const AUTHOR_SCAN_COMMITS = 500

/** Process collection policy for Git commands. */
export interface Config {
  /** Maximum retained bytes for each Git output stream. */
  readonly maxOutputBytes: number
  /** Maximum retained bytes for each complete file side in commit comparison. */
  readonly maxCommitFileBytes: number
  /** Grace available to the subprocess provider during cancellation. */
  readonly terminationGraceMs: number
  /** Largest commit page one `log` call may return. */
  readonly maxLogCommits: number
}

interface GitResult {
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
  readonly truncated: boolean
}

/** Workspace-scoped Git branch controller. */
export class GitWorkspaceController extends TypertRemoteService {
  static inject = ['workspaceRegistry', 'subprocess']
  static Config: z<Config> = z.object({
    maxOutputBytes: z.number().step(1).min(4096).max(4 * 1024 * 1024).default(256 * 1024),
    maxCommitFileBytes: z.number().step(1).min(4096).max(64 * 1024 * 1024).default(8 * 1024 * 1024),
    terminationGraceMs: z.number().step(1).min(1).max(30_000).default(1000),
    maxLogCommits: z.number().step(1).min(10).max(500).default(200),
  })

  /** @param ctx - Host context carrying Workspace and subprocess services. */
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'gitWorkspaceController', { namespace: 'gitWorkspace' })
  }

  /**
   * Read local, remote-tracking, and checked-out branches for one Workspace.
   * @param request - target Workspace.
   * @param signal - carrier cancellation.
   * @returns repository absence or the complete branch lists.
   */
  @Remote('list')
  async list(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspaceBranchState> {
    const workspace = this.workspace(request.workspaceId)
    const inside = await this.git(workspace, ['rev-parse', '--is-inside-work-tree'], signal, 'list')
    if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return { repository: false }
    const result = await this.git(
      workspace,
      ['for-each-ref', '--format=%(refname)%00%(refname:short)%00%(HEAD)%00%(symref)', 'refs/heads', 'refs/remotes'],
      signal,
      'list',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'list', result)
    const rows = result.stdout.split(/\r?\n/u).filter(Boolean).map((line) => {
      const [ref = '', branch = '', marker = '', symref = ''] = line.split('\0')
      return { ref, branch, current: marker.trim() === '*', symbolic: symref !== '' }
    }).filter(row => row.branch !== '')
    const current = rows.find(row => row.current)?.branch
    return {
      repository: true,
      localBranches: rows.filter(row => row.ref.startsWith('refs/heads/')).map(row => row.branch),
      remoteBranches: rows
        .filter(row => row.ref.startsWith('refs/remotes/') && !row.symbolic)
        .map(row => row.branch),
      ...(current === undefined ? {} : { current }),
      detached: current === undefined,
    }
  }

  /**
   * Check out one existing local branch in the Workspace directory.
   * @param request - target Workspace and exact branch name.
   * @param signal - carrier cancellation.
   * @returns refreshed local branch state.
   */
  @Remote('checkout')
  async checkout(request: GitWorkspaceBranchRequest, signal: AbortSignal): Promise<GitWorkspaceBranchState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['switch', '--', request.branch], signal, 'checkout')
    if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) {
      throw new RemoteError(
        'git/worktree-dirty',
        'Local changes would be overwritten by the branch switch.',
        { workspaceId: workspace.id, operation: 'checkout', branch: request.branch },
      )
    }
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'checkout', result)
    return await this.list(request, signal)
  }

  /** Create a tracking local branch from one remote-tracking branch and check it out. */
  @Remote('checkoutRemote')
  async checkoutRemote(request: GitWorkspaceBranchRequest, signal: AbortSignal): Promise<GitWorkspaceBranchState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['switch', '--track', request.branch], signal, 'checkout-remote')
    if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) {
      throw new RemoteError(
        'git/worktree-dirty',
        'Local changes would be overwritten by the branch switch.',
        { workspaceId: workspace.id, operation: 'checkout-remote', branch: request.branch },
      )
    }
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'checkout-remote', result)
    return await this.list(request, signal)
  }

  /**
   * Create and check out one local branch in the Workspace directory.
   * @param request - target Workspace and proposed branch name.
   * @param signal - carrier cancellation.
   * @returns refreshed local branch state.
   */
  @Remote('create')
  async create(request: GitWorkspaceBranchRequest, signal: AbortSignal): Promise<GitWorkspaceBranchState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['switch', '-c', request.branch], signal, 'create')
    if (result.exitCode !== 0 && wouldOverwriteLocalChanges(result.stderr)) {
      throw new RemoteError(
        'git/worktree-dirty',
        'Local changes would be overwritten by the branch switch.',
        { workspaceId: workspace.id, operation: 'create', branch: request.branch },
      )
    }
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'create', result)
    return await this.list(request, signal)
  }

  /** Safely delete one merged local branch; Git refuses the current or unmerged branch. */
  @Remote('delete')
  async delete(request: GitWorkspaceBranchRequest, signal: AbortSignal): Promise<GitWorkspaceBranchState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['branch', '-d', '--', request.branch], signal, 'delete')
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'delete', result)
    return await this.list(request, signal)
  }

  /**
   * Read one bounded page of commit history for one Workspace.
   * @param request - target Workspace, page bounds, and optional subject, author, and date filters.
   * @param signal - carrier cancellation.
   * @returns repository absence or the page with the checked-out branch.
   */
  @Remote('log')
  async log(request: GitWorkspaceLogRequest, signal: AbortSignal): Promise<GitWorkspaceLogState> {
    const workspace = this.workspace(request.workspaceId)
    const inside = await this.git(workspace, ['rev-parse', '--is-inside-work-tree'], signal, 'log')
    if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return { repository: false }
    const branch = await this.git(workspace, ['branch', '--show-current'], signal, 'log')
    if (branch.exitCode !== 0 || branch.truncated) this.failed(workspace, 'log', branch)
    const skip = Math.max(0, Math.trunc(request.skip ?? 0))
    const limit = Math.min(Math.max(1, Math.trunc(request.limit ?? 50)), this.config.maxLogCommits)
    const args = ['log', '--pretty=format:%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1e', '-n', String(limit + 1)]
    if (skip > 0) args.push('--skip', String(skip))
    const search = request.search?.trim() ?? ''
    const author = request.author?.trim() ?? ''
    // Both pattern options are case-insensitive and literal: the reader types a
    // message fragment or picks a name, never a regular expression.
    if (search !== '' || author !== '') args.push('-i', '-F')
    if (search !== '') args.push(`--grep=${search}`)
    if (author !== '') args.push(`--author=${author}`)
    // Git compares these bounds with the commit's own timestamp, while the
    // reader picks whole calendar days: a lower bound starts that day and an
    // upper bound ends it, so both bounds include the days they name.
    const since = calendarDate(request.since)
    const until = calendarDate(request.until)
    if (since !== undefined) args.push(`--since=${since}T00:00:00`)
    if (until !== undefined) args.push(`--until=${until}T23:59:59`)
    const result = await this.git(workspace, args, signal, 'log')
    if (result.exitCode !== 0 && !hasNoCommitsYet(result.stderr)) this.failed(workspace, 'log', result)
    if (result.truncated) this.failed(workspace, 'log', result)
    const rows = result.exitCode === 0
      ? result.stdout.split('\x1e').filter(row => row !== '').map(parseCommitRow)
      : []
    const current = branch.stdout.trim()
    // The dropdown's options travel with the first page so opening the history
    // cost one read, not two; a later page leaves the list with the window.
    const authors = skip === 0 ? await this.authors(workspace, signal) : undefined
    return {
      repository: true,
      commits: rows.slice(0, limit),
      more: rows.length > limit,
      ...(current === '' ? {} : { branch: current }),
      ...(authors === undefined ? {} : { authors }),
    }
  }

  /** Read the changed files in one commit returned by {@link log}. */
  @Remote('commitFiles')
  async commitFiles(
    request: GitWorkspaceCommitSelectionRequest, signal: AbortSignal,
  ): Promise<GitWorkspaceCommitFilesState> {
    const workspace = this.workspace(request.workspaceId)
    const commit = selectedCommit(request.commit, workspace.id, 'commit-files')
    const result = await this.git(
      workspace, ['show', '--format=', '--name-status', '-z', commit], signal, 'commit-files',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'commit-files', result)
    return { repository: true, files: parseCommitFiles(result.stdout) }
  }

  /** Read one file's complete before/after contents and patch from one commit returned by {@link log}. */
  @Remote('commitDiff')
  async commitDiff(request: GitWorkspaceCommitFileRequest, signal: AbortSignal): Promise<GitWorkspaceCommitDiffState> {
    const workspace = this.workspace(request.workspaceId)
    const commit = selectedCommit(request.commit, workspace.id, 'commit-diff')
    const [path = ''] = selectedPathspecs([request.path], workspace.id, 'commit-diff')
    if (request.previousPath !== undefined) {
      selectedPathspecs([request.previousPath], workspace.id, 'commit-diff')
    }
    const previousPath = request.previousPath ?? request.path
    const result = await this.git(
      workspace, ['show', '--format=', '--no-ext-diff', '--no-color', '--unified=3', commit, '--', path],
      signal, 'commit-diff',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'commit-diff', result)
    const binary = /(?:^|\n)(?:Binary files .* differ|GIT binary patch)(?:\n|$)/u.test(result.stdout)
    if (binary) return { repository: true, binary: true, before: '', after: '', patch: result.stdout }
    const [before, after] = await Promise.all([
      this.git(
        workspace, ['show', `${commit}^:${previousPath}`], signal, 'commit-diff', this.config.maxCommitFileBytes,
      ),
      this.git(
        workspace, ['show', `${commit}:${request.path}`], signal, 'commit-diff', this.config.maxCommitFileBytes,
      ),
    ])
    if (before.truncated) this.failed(workspace, 'commit-diff', before)
    if (after.truncated) this.failed(workspace, 'commit-diff', after)
    return {
      repository: true,
      binary: false,
      before: before.exitCode === 0 ? before.stdout : '',
      after: after.exitCode === 0 ? after.stdout : '',
      patch: result.stdout,
    }
  }

  /** Read one working-tree file as the same complete comparison used by commit review. */
  @Remote('workingDiff')
  async workingDiff(request: GitWorkspaceWorkingDiffRequest, signal: AbortSignal): Promise<GitWorkspaceCommitDiffState> {
    const workspace = this.workspace(request.workspaceId)
    const [path = ''] = selectedPaths([request.path], workspace.id, 'working-diff')
    const previousPath = request.previousPath === undefined
      ? undefined
      : selectedPaths([request.previousPath], workspace.id, 'working-diff')[0]
    const args = request.untracked
      ? ['diff', '--no-index', '--no-ext-diff', '--no-color', '--unified=2147483647', '--', '/dev/null', path]
      : [
        'diff', '--no-ext-diff', '--no-color', '--unified=2147483647', 'HEAD', '--',
        ...(previousPath === undefined ? [] : [previousPath]), path,
      ]
    const result = await this.git(
      workspace, args, signal, 'working-diff', this.config.maxCommitFileBytes * 2,
    )
    const expectedDifference = request.untracked && result.exitCode === 1
    if ((!expectedDifference && result.exitCode !== 0) || result.truncated) this.failed(workspace, 'working-diff', result)
    const binary = /(?:^|\n)(?:Binary files .* differ|GIT binary patch)(?:\n|$)/u.test(result.stdout)
    if (binary) return { repository: true, binary: true, before: '', after: '', patch: result.stdout }
    const contents = completeTextFromPatch(result.stdout)
    if (contents !== undefined) {
      return { repository: true, binary: false, ...contents, patch: result.stdout }
    }
    if (!request.untracked) {
      const baseline = await this.git(
        workspace, ['show', `HEAD:${previousPath ?? path}`], signal, 'working-diff', this.config.maxCommitFileBytes,
      )
      if (baseline.truncated) this.failed(workspace, 'working-diff', baseline)
      if (baseline.exitCode === 0) {
        return {
          repository: true, binary: false, before: baseline.stdout, after: baseline.stdout, patch: result.stdout,
        }
      }
    }
    return { repository: true, binary: false, before: '', after: '', patch: result.stdout }
  }

  /** Read bounded commits on the current branch that its upstream does not contain. */
  @Remote('pendingPush')
  async pendingPush(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspacePendingPushState> {
    const workspace = this.workspace(request.workspaceId)
    const inside = await this.git(workspace, ['rev-parse', '--is-inside-work-tree'], signal, 'pending-push')
    if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return { repository: false }
    const upstream = await this.git(
      workspace, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], signal, 'pending-push',
    )
    if (upstream.exitCode !== 0 && hasNoUpstream(upstream.stderr)) {
      return { repository: true, upstream: false, commits: [], more: false }
    }
    if (upstream.exitCode !== 0 || upstream.truncated) this.failed(workspace, 'pending-push', upstream)
    const limit = this.config.maxLogCommits
    const result = await this.git(
      workspace,
      ['log', '--pretty=format:%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1e', '-n', String(limit + 1), '@{upstream}..HEAD'],
      signal,
      'pending-push',
    )
    if (result.exitCode !== 0 && !hasNoCommitsYet(result.stderr)) this.failed(workspace, 'pending-push', result)
    if (result.truncated) this.failed(workspace, 'pending-push', result)
    const rows = result.exitCode === 0
      ? result.stdout.split('\x1e').filter(row => row !== '').map(parseCommitRow)
      : []
    return { repository: true, upstream: true, commits: rows.slice(0, limit), more: rows.length > limit }
  }

  /**
   * Read the uncommitted working-tree state for one Workspace.
   * @param request - target Workspace.
   * @param signal - carrier cancellation.
   * @returns repository absence or every changed and untracked file.
   */
  @Remote('status')
  async status(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspaceStatusState> {
    const workspace = this.workspace(request.workspaceId)
    const inside = await this.git(workspace, ['rev-parse', '--is-inside-work-tree'], signal, 'status')
    if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return { repository: false }
    const result = await this.git(
      workspace,
      ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
      signal,
      'status',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'status', result)
    return { repository: true, files: parseStatusRecords(result.stdout) }
  }

  /**
   * List the stash entries for one Workspace, newest first.
   * @param request - target Workspace.
   * @param signal - carrier cancellation.
   * @returns repository absence or the complete stash list.
   */
  @Remote('stash')
  async stash(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspaceStashState> {
    const workspace = this.workspace(request.workspaceId)
    const inside = await this.git(workspace, ['rev-parse', '--is-inside-work-tree'], signal, 'stash')
    if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return { repository: false }
    const result = await this.git(
      workspace,
      ['stash', 'list', '--pretty=format:%gd%x1f%cI%x1f%gs%x1e'],
      signal,
      'stash',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'stash', result)
    return { repository: true, entries: parseStashRows(result.stdout) }
  }

  /** Commit selected tracked and untracked Workspace changes, then optionally push. */
  @Remote('commit')
  async commit(request: GitWorkspaceCommitRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const message = request.message.trim()
    if (message === '' || message.includes('\0')) {
      throw new RemoteError('git/operation-failed', 'Commit message must not be empty.', {
        workspaceId: workspace.id, operation: 'commit',
      })
    }
    const paths = selectedPathspecs(request.paths, workspace.id, 'commit')
    const add = await this.git(workspace, ['add', '-A', '--', ...paths], signal, 'add')
    if (add.exitCode !== 0 || add.truncated) this.failed(workspace, 'add', add)
    const commit = await this.git(workspace, ['commit', '--only', '-m', message, '--', ...paths], signal, 'commit')
    if (commit.exitCode !== 0 || commit.truncated) this.failed(workspace, 'commit', commit)
    if (request.push === true) {
      const push = await this.git(workspace, ['push'], signal, 'push')
      if (push.exitCode !== 0 || push.truncated) this.failed(workspace, 'push', push)
    }
    return { repository: true }
  }

  /** Push the current branch to its configured upstream. */
  @Remote('push')
  async push(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['push'], signal, 'push')
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'push', result)
    return { repository: true }
  }

  /** Pull the configured upstream into the current branch with a merge when histories diverge. */
  @Remote('pull')
  async pull(request: GitWorkspaceRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const result = await this.git(workspace, ['pull', '--no-rebase', '--no-edit'], signal, 'pull')
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'pull', result)
    return { repository: true }
  }

  /** Stash selected tracked and untracked Workspace changes under a caller-supplied message. */
  @Remote('stashCreate')
  async stashCreate(request: GitWorkspaceStashCreateRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const message = request.message.trim()
    if (message === '' || message.includes('\0')) {
      throw new RemoteError('git/operation-failed', 'Stash message must not be empty.', {
        workspaceId: workspace.id, operation: 'stash-create',
      })
    }
    const paths = selectedPathspecs(request.paths, workspace.id, 'stash-create')
    const result = await this.git(
      workspace, ['stash', 'push', '--include-untracked', '-m', message, '--', ...paths], signal, 'stash-create',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'stash-create', result)
    return { repository: true }
  }

  /** Permanently discard selected tracked changes and untracked files. */
  @Remote('rollback')
  async rollback(request: GitWorkspaceRollbackRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const tracked = optionalPathspecs(request.trackedPaths, workspace.id, 'rollback')
    const untracked = optionalPathspecs(request.untrackedPaths, workspace.id, 'rollback')
    if (tracked.length + untracked.length === 0) {
      throw new RemoteError('git/operation-failed', 'At least one valid Workspace-relative path is required.', {
        workspaceId: workspace.id, operation: 'rollback',
      })
    }
    if (tracked.length > 0) {
      const restore = await this.git(
        workspace, ['restore', '--source=HEAD', '--staged', '--worktree', '--', ...tracked], signal, 'rollback',
      )
      if (restore.exitCode !== 0 || restore.truncated) this.failed(workspace, 'rollback', restore)
    }
    if (untracked.length > 0) {
      const clean = await this.git(workspace, ['clean', '-f', '--', ...untracked], signal, 'rollback')
      if (clean.exitCode !== 0 || clean.truncated) this.failed(workspace, 'rollback', clean)
    }
    return { repository: true }
  }

  /** Read the files stored in one stash selector returned by {@link stash}. */
  @Remote('stashFiles')
  async stashFiles(request: GitWorkspaceStashSelectionRequest, signal: AbortSignal): Promise<GitWorkspaceStashFilesState> {
    const workspace = this.workspace(request.workspaceId)
    const selector = stashSelector(request.selector, workspace.id, 'stash-files')
    const result = await this.git(
      workspace,
      ['stash', 'show', '--name-status', '-z', '--include-untracked', '--format=', selector],
      signal,
      'stash-files',
    )
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'stash-files', result)
    return { repository: true, files: parseStashFiles(result.stdout) }
  }

  /** Restore one stash's index and working-tree state, removing it on success. */
  @Remote('stashPop')
  async stashPop(request: GitWorkspaceStashSelectionRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const selector = stashSelector(request.selector, workspace.id, 'stash-pop')
    const result = await this.git(workspace, ['stash', 'pop', '--index', selector], signal, 'stash-pop')
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'stash-pop', result)
    return { repository: true }
  }

  /** Permanently remove one stash without restoring its files. */
  @Remote('stashDrop')
  async stashDrop(request: GitWorkspaceStashSelectionRequest, signal: AbortSignal): Promise<GitWorkspaceMutationState> {
    const workspace = this.workspace(request.workspaceId)
    const selector = stashSelector(request.selector, workspace.id, 'stash-drop')
    const result = await this.git(workspace, ['stash', 'drop', selector], signal, 'stash-drop')
    if (result.exitCode !== 0 || result.truncated) this.failed(workspace, 'stash-drop', result)
    return { repository: true }
  }

  private workspace(workspaceId: GitWorkspaceRequest['workspaceId']): Workspace {
    const workspace = this.ctx.workspaceRegistry.get(workspaceId)
    if (workspace !== undefined) return workspace
    throw new RemoteError('workspace/not-found', `workspace "${workspaceId}" not found`, { workspaceId })
  }

  private async git(
    workspace: Workspace,
    args: readonly string[],
    signal: AbortSignal,
    operation: 'list' | 'checkout' | 'checkout-remote' | 'create' | 'delete' | 'log' | 'commit-files' | 'commit-diff' | 'working-diff' | 'pending-push' | 'status' | 'stash' | 'stash-files' | 'stash-pop' | 'stash-drop' | 'add' | 'commit' | 'push' | 'pull' | 'stash-create' | 'rollback',
    maxOutputBytes = this.config.maxOutputBytes,
  ): Promise<GitResult> {
    let executable: string
    try {
      executable = await this.ctx.subprocess.resolveExecutable('git', undefined, signal)
    } catch (error) {
      throw new RemoteError(
        'git/unavailable',
        `Git is unavailable for Workspace "${workspace.id}": ${error instanceof Error ? error.message : String(error)}`,
        { workspaceId: workspace.id },
        { cause: error },
      )
    }
    let handle: SubprocessHandle
    try {
      handle = this.ctx.subprocess.spawn({
        argv: [executable, ...args],
        cwd: workspace.path,
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: maxOutputBytes },
          stderr: { maxBytes: this.config.maxOutputBytes },
        },
        graceMs: this.config.terminationGraceMs,
        signal,
      })
      const outcome = await handle.done
      const stdout = handle.collected.stdout?.readFrom(0)
      const stderr = handle.collected.stderr?.readFrom(0)
      return {
        exitCode: outcome.exitCode,
        stdout: stdout?.text ?? '',
        stderr: stderr?.text ?? '',
        truncated: stdout?.lossy === true || stderr?.lossy === true,
      }
    } catch (error) {
      throw new RemoteError(
        'git/operation-failed',
        `Git ${operation} failed for Workspace "${workspace.id}": ${error instanceof Error ? error.message : String(error)}`,
        { workspaceId: workspace.id, operation },
        { cause: error },
      )
    }
  }

  private failed(
    workspace: Workspace,
    operation: 'list' | 'checkout' | 'checkout-remote' | 'create' | 'delete' | 'log' | 'commit-files' | 'commit-diff' | 'working-diff' | 'pending-push' | 'status' | 'stash' | 'stash-files' | 'stash-pop' | 'stash-drop' | 'add' | 'commit' | 'push' | 'pull' | 'stash-create' | 'rollback',
    result: GitResult,
  ): never {
    const detail = result.truncated
      ? 'Git output exceeded the configured limit.'
      : stripVTControlCharacters(result.stderr).trim() || `Git exited with code ${String(result.exitCode)}.`
    throw new RemoteError(
      'git/operation-failed',
      detail,
      { workspaceId: workspace.id, operation },
    )
  }

  /**
   * List the distinct author names among the checked-out branch's recent commits.
   *
   * The names feed the client's author dropdown. A refused or clipped scan leaves
   * the list absent rather than failing the page that carries it: the history the
   * reader asked for is complete either way, and the dropdown simply stays bare.
   * @param workspace - the Workspace whose history is listed.
   * @param signal - carrier cancellation.
   * @returns the sorted names, or undefined when Git could not list them.
   */
  private async authors(workspace: Workspace, signal: AbortSignal): Promise<readonly string[] | undefined> {
    const result = await this.git(
      workspace, ['log', '-n', String(AUTHOR_SCAN_COMMITS), '--pretty=format:%an'], signal, 'log',
    )
    if (result.exitCode !== 0 || result.truncated) return undefined
    const names = new Set<string>()
    for (const line of result.stdout.split(/\r?\n/u)) {
      const name = line.trim()
      if (name !== '') names.add(name)
    }
    return [...names].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
  }
}

function wouldOverwriteLocalChanges(stderr: string): boolean {
  return /local changes[\s\S]*would be overwritten by (?:checkout|switch)/iu.test(stderr)
}

/**
 * Read one `YYYY-MM-DD` calendar date, or undefined when the text names none.
 *
 * The value reaches a Git argument, so only a complete, real calendar date is
 * accepted: anything else leaves that bound unset instead of failing the read.
 * @param value - the date the Client sent, if any.
 * @returns the date as Git spells it, or undefined.
 */
function calendarDate(value: string | undefined): string | undefined {
  const candidate = value?.trim() ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(candidate)) return undefined
  const [year = 0, month = 0, day = 0] = candidate.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  const real = parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
  return real ? candidate : undefined
}

/** An empty repository is a complete history, not a failed read. */
function hasNoCommitsYet(stderr: string): boolean {
  return /does not have any commits yet|bad revision 'HEAD'/iu.test(stderr)
}

function hasNoUpstream(stderr: string): boolean {
  return /no upstream configured|no upstream branch|does not point to a branch/iu.test(stderr)
}

/** Recover both complete text sides from a maximum-context unified patch. */
function completeTextFromPatch(patch: string): { readonly before: string; readonly after: string } | undefined {
  const before: string[] = []
  const after: string[] = []
  let inHunk = false
  let foundHunk = false
  const lines = patch.split(/\r?\n/u)
  if (lines.at(-1) === '') lines.pop()
  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      inHunk = false
      continue
    }
    if (line.startsWith('@@ ')) {
      inHunk = true
      foundHunk = true
      continue
    }
    if (!inHunk || line.startsWith('\\ No newline at end of file')) continue
    if (line.startsWith('-')) before.push(line.slice(1))
    else if (line.startsWith('+')) after.push(line.slice(1))
    else {
      const text = line.startsWith(' ') ? line.slice(1) : line
      before.push(text)
      after.push(text)
    }
  }
  if (!foundHunk) return undefined
  return { before: before.join('\n'), after: after.join('\n') }
}

/**
 * Decode one `log` record: `hash`, short hash, author name, author email, strict
 * ISO author date, then the subject (the last field, so it may contain anything
 * else, including the field separator's own text).
 */
function parseCommitRow(row: string): GitWorkspaceCommit {
  const cleanRow = row.replace(/^[\r\n]+/u, '')
  const [hash = '', shortHash = '', authorName = '', authorEmail = '', date = '', ...subject] = cleanRow.split('\x1f')
  return { hash, shortHash, authorName, authorEmail, date, subject: subject.join('\x1f') }
}

/**
 * Decode `status --porcelain=v1 -z` records: `XY path`, where a rename or copy
 * record is followed by its original path as the next record. An unchanged side
 * (Git's space) is reported as `.`.
 */
export function parseStatusRecords(stdout: string): GitWorkspaceStatusFile[] {
  const records = stdout.split('\0').filter(record => record !== '')
  const files: GitWorkspaceStatusFile[] = []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index] ?? ''
    const indexStatus = statusLetter(record.slice(0, 1))
    const worktreeStatus = statusLetter(record.slice(1, 2))
    const renamed = indexStatus === 'R' || indexStatus === 'C'
    if (renamed) index += 1
    files.push({
      path: record.slice(3),
      indexStatus,
      worktreeStatus,
      untracked: indexStatus === '?' && worktreeStatus === '?',
      ...(renamed ? { renamedFrom: records[index] ?? '' } : {}),
    })
  }
  return files
}

/** One porcelain status letter; the space that means "unchanged here" reads as `.`. */
function statusLetter(letter: string): string {
  return letter === ' ' ? '.' : letter
}

/**
 * Decode one `stash list` record: reflog selector, strict ISO entry date, then
 * the subject (the last field, so it may contain anything else, including the
 * field separator's own text).
 */
export function parseStashRows(stdout: string): GitWorkspaceStashEntry[] {
  return stdout.split('\x1e').filter(row => row !== '').map((row) => {
    const [selector = '', date = '', ...subject] = row.split('\x1f')
    return { selector, date, subject: subject.join('\x1f') }
  })
}

/** Decode `stash show --name-status -z` records, including rename path pairs. */
export function parseStashFiles(stdout: string): GitWorkspaceStashFile[] {
  const records = stdout.split('\0').filter(record => record !== '')
  const files: GitWorkspaceStashFile[] = []
  for (let index = 0; index < records.length;) {
    const status = records[index++] ?? ''
    const renamed = status.startsWith('R') || status.startsWith('C')
    const firstPath = records[index++] ?? ''
    const path = renamed ? records[index++] ?? '' : firstPath
    files.push({ status: status.slice(0, 1), path, ...(renamed ? { renamedFrom: firstPath } : {}) })
  }
  return files
}

/** Decode the NUL-delimited name-status output of one commit. */
export function parseCommitFiles(stdout: string): GitWorkspaceStashFile[] {
  return parseStashFiles(stdout)
}

function selectedCommit(
  commit: string,
  workspaceId: GitWorkspaceRequest['workspaceId'],
  operation: 'commit-files' | 'commit-diff',
): string {
  if (/^[0-9a-f]{7,64}$/iu.test(commit)) return commit
  throw new RemoteError('git/operation-failed', 'The commit identifier is invalid.', { workspaceId, operation })
}

function stashSelector(
  selector: string,
  workspaceId: GitWorkspaceRequest['workspaceId'],
  operation: 'stash-files' | 'stash-pop' | 'stash-drop',
): string {
  if (/^stash@\{\d+\}$/u.test(selector)) return selector
  throw new RemoteError('git/operation-failed', 'The stash selector is invalid.', { workspaceId, operation })
}

function selectedPathspecs(
  paths: readonly string[],
  workspaceId: GitWorkspaceRequest['workspaceId'],
  operation: 'commit' | 'commit-diff' | 'stash-create' | 'rollback',
): string[] {
  return selectedPaths(paths, workspaceId, operation).map(path => `:(literal)${path}`)
}

function selectedPaths(
  paths: readonly string[],
  workspaceId: GitWorkspaceRequest['workspaceId'],
  operation: 'commit' | 'commit-diff' | 'working-diff' | 'stash-create' | 'rollback',
): string[] {
  const unique = [...new Set(paths)]
  const invalid = unique.length === 0 || unique.some(path => (
    path === '' || path.includes('\0') || /^[\\/]|^[A-Za-z]:[\\/]/u.test(path)
    || path.split(/[\\/]/u).includes('..')
  ))
  if (!invalid) return unique
  throw new RemoteError('git/operation-failed', 'At least one valid Workspace-relative path is required.', {
    workspaceId, operation,
  })
}

function optionalPathspecs(
  paths: readonly string[],
  workspaceId: GitWorkspaceRequest['workspaceId'],
  operation: 'rollback',
): string[] {
  if (paths.length === 0) return []
  return selectedPathspecs(paths, workspaceId, operation)
}

export default GitWorkspaceController
