/**
 * The code-review region: pending commits, uncommitted files, and stash entries
 * drawn above the docked panes in the right Sidebar panel.
 *
 * The region reads only while the history header's session-local Changes
 * control reveals it. Each reveal and reload press starts a read, and everything
 * it shows lives in local component state — the region is not a tab, so it
 * declares no store. The workspace is named from the framework's Workspace
 * hooks exactly as the commit history names it (by session membership, else by
 * the session's working directory), never by a path the reader types. A file row opens the
 * file in the dock through the panel's own navigation. Each stash expands into
 * a lazy file read and can restore its index and working-tree state.
 */
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import clsx from 'clsx'
import type { InjectFace, PropsLocale, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  Button, IconChevronDownOutline14, IconCloseOutline16, IconRefreshOutline16, Input, Menu, Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  GitWorkspaceCommit, GitWorkspaceStashEntry, GitWorkspaceStashFile, GitWorkspaceStatusFile,
} from '@monster-30cl/dsh-git-workspace-controller/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type {
  GitChangesInjected, GitChangesMutation, GitChangesRead, GitStashMutation, SyncGitChanges, ReadGitStashFiles,
  RollbackGitChanges,
} from './changes.ts'
import { notifyGitHistoryRefresh, setGitChangesVisible, useGitChangesVisible } from './changes-visibility.ts'
import { CommitDetailModal, failureLine, formatCommitDate, WorkingTreeDiffModal } from './GitHistoryBody.tsx'
import { readLastGitMessage, writeLastGitMessage } from './last-messages.ts'
import type {} from './locales.ts'
import { CommitMessageDialog } from './CommitMessageDialog'
import css from './GitChangesBody.module.css'

const MIN_REGION_HEIGHT = 96

/**
 * The height a drag to `pointerY` asks for. The region hugs the bottom of the
 * panel, so the pointer's distance to that edge is the height; both regions keep
 * at least their own minimum.
 * @param panelRect - the split panel's box.
 * @param pointerY - the pointer's viewport Y during the drag.
 * @returns the clamped region height in pixels.
 */
export function regionHeightAt(panelRect: { readonly height: number, readonly bottom: number }, pointerY: number): number {
  return Math.max(MIN_REGION_HEIGHT, Math.min(panelRect.height - MIN_REGION_HEIGHT, panelRect.bottom - pointerY))
}

/**
 * The height the reader last dragged the region to. It is a layout preference
 * rather than component state, so it survives remounting the tab.
 */
let rememberedHeight: number | undefined

/** The region's composed props: the session it draws, its face, and its copy. */
export type GitChangesBodyProps =
  & PropsRuntime<'sidebar.right.panel.changes'>
  & InjectFace<GitChangesInjected>
  & PropsLocale<'sidebarGitHistory'>

/**
 * The badge a file row shows: the side that carries the change. An untracked
 * file reads as `?`; otherwise the work-tree letter wins, then the index one.
 * @param file - one settled status row.
 * @returns the single-letter badge text.
 */
export function statusBadgeOf(file: GitWorkspaceStatusFile): string {
  if (file.untracked) return '?'
  return file.worktreeStatus !== '.' ? file.worktreeStatus : file.indexStatus
}

/** Whether a status path is a repository ignore-rules file hidden from code actions. */
export function isGitIgnorePath(path: string): boolean {
  return /(^|\/)\.gitignore$/u.test(path)
}

/**
 * Split a workspace-relative path into its basename and parent directory for
 * display; the name carries the row, the directory only disambiguates it.
 * @param path - a `/`-separated workspace-relative path.
 * @returns the last segment and everything before it (empty for a root file).
 */
export function pathSegments(path: string): { name: string; dir: string } {
  const slash = path.lastIndexOf('/')
  if (slash < 0) return { name: path, dir: '' }
  return { name: path.slice(slash + 1), dir: path.slice(0, slash) }
}

/** The badge tints, one per status letter; an unlisted letter stays neutral. */
const BADGE_CLASS: Record<string, string | undefined> = {
  M: css.badgeModified,
  A: css.badgeAdded,
  D: css.badgeDeleted,
  R: css.badgeRenamed,
  C: css.badgeRenamed,
  U: css.badgeConflict,
  '?': css.badgeAdded,
}

/** One file row: badge, name, and dimmed directory; pressing it opens the file. */
function FileRow({
  file, selected, disabled, onSelect, onOpen, onRollback, onTrack, t,
}: {
  file: GitWorkspaceStatusFile
  selected: boolean
  disabled: boolean
  onTrack?: (file: GitWorkspaceStatusFile) => void
  onSelect: (selected: boolean) => void
  onOpen: (file: GitWorkspaceStatusFile) => void
  onRollback: (file: GitWorkspaceStatusFile) => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const badge = statusBadgeOf(file)
  const { name, dir } = pathSegments(file.path)
  return (
    <li className={css.item}>
      {!file.untracked && <input
        type="checkbox"
        className={css.fileCheckbox}
        checked={selected}
        aria-label={t('changes.selectFile', { path: file.path })}
        data-git-file-select={file.path}
        onChange={(event) => { onSelect(event.target.checked) }}
        disabled={disabled}
      />}
      <button
        type="button"
        className={css.fileRow}
        title={file.renamedFrom === undefined ? file.path : `${file.renamedFrom} → ${file.path}`}
        data-git-file={file.path}
        onClick={() => { onOpen(file) }}
      >
        <span className={clsx(css.badge, BADGE_CLASS[badge])} data-git-status={badge}>{badge}</span>
        <span className={css.fileName}>{name}</span>
        {dir !== '' && <span className={css.fileDir}>{dir}</span>}
      </button>
      {file.untracked && <button type="button" className={css.rowAction} disabled={disabled} aria-label={t('changes.track')} title={t('changes.track')} data-git-track-file={file.path} onClick={() => { onTrack?.(file) }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg></button>}
      <button
        type="button"
        className={css.rowAction}
        disabled={disabled}
        aria-label={t('rollback.single', { path: file.path })}
        title={t('rollback.single', { path: file.path })}
        data-git-rollback-file={file.path}
        onClick={() => { onRollback(file) }}
      >
        <RollbackIcon />
      </button>
    </li>
  )
}

/** One file stored inside an expanded stash collection. */
function StashFileRow({ file }: { file: GitWorkspaceStashFile }): ReactNode {
  const { name, dir } = pathSegments(file.path)
  return (
    <li className={css.stashFile} data-git-stash-file={file.path}>
      <span className={clsx(css.badge, BADGE_CLASS[file.status])}>{file.status}</span>
      <span className={css.fileName}>{name}</span>
      {dir !== '' && <span className={css.fileDir}>{dir}</span>}
    </li>
  )
}

type GitOperation = 'commit' | 'commit-push' | 'push' | 'pull' | 'stash' | 'stash-restore' | 'stash-delete' | 'rollback' | 'track'

/** One in-flight repository mutation shared by every control in the region. */
interface GitOperationState {
  readonly kind: GitOperation
}

function operationLabel(t: TranslateNS<'sidebarGitHistory'>, kind: GitOperation): string {
  return t(`operations.${kind}`)
}

function RollbackIcon(): ReactNode {
  return (
    <svg className={css.actionIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.5 4H2.25v3.25M2.5 6.75A5.5 5.5 0 1 1 3.75 12" />
    </svg>
  )
}

function StashIcon(): ReactNode {
  return (
    <svg className={css.actionIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.25v6.5M5.25 6 8 8.75 10.75 6M2.75 9.5v3.25h10.5V9.5" />
    </svg>
  )
}

function RollbackDialog({ workspaceId, files, rollback, operation, setOperation, onClose, onDone, t }: {
  workspaceId: WorkspaceId
  files: readonly GitWorkspaceStatusFile[] | undefined
  rollback: RollbackGitChanges
  operation: GitOperationState | undefined
  setOperation: (operation: GitOperationState | undefined) => void
  onClose: () => void
  onDone: () => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const operationRef = useRef<AbortController | undefined>(undefined)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  useEffect(() => () => { operationRef.current?.abort() }, [])
  const confirm = (): void => {
    if (files === undefined || files.length === 0 || operation !== undefined) return
    const controller = new AbortController()
    operationRef.current?.abort()
    operationRef.current = controller
    setFailure(undefined)
    setOperation({ kind: 'rollback' })
    void rollback(workspaceId, controller.signal, files).then((result) => {
      if (controller.signal.aborted) return
      operationRef.current = undefined
      setOperation(undefined)
      if (result !== undefined) { setFailure(failureLine(t, result)); return }
      onClose()
      onDone()
    })
  }
  const includesUntracked = files?.some(file => file.untracked) === true
  return (
    <Modal
      open={files !== undefined}
      {...(css.actionDialog === undefined ? {} : { className: css.actionDialog })}
      onClose={onClose}
      title={t(files?.length === 1 ? 'rollback.titleSingle' : 'rollback.titleBatch')}
      closeLabel={t('actions.cancel')}
      footer={(
        <>
          <Button variant="outline" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button disabled={operation !== undefined} onClick={confirm}>{t('rollback.confirm')}</Button>
        </>
      )}
    >
      <p className={css.rollbackWarning}>{t('rollback.warning', { count: files?.length ?? 0 })}</p>
      {includesUntracked && <p className={css.error}>{t('rollback.untrackedWarning')}</p>}
      {failure !== undefined && <p className={css.error} role="alert">{failure}</p>}
    </Modal>
  )
}

/** One expandable stash collection with lazy file loading and restore. */
function StashRow({ entry, workspaceId, readFiles, restore, drop, operation, setOperation, onDone, t }: {
  entry: GitWorkspaceStashEntry
  workspaceId: WorkspaceId
  readFiles: ReadGitStashFiles
  restore: GitStashMutation
  drop: GitStashMutation
  operation: GitOperationState | undefined
  setOperation: (operation: GitOperationState | undefined) => void
  onDone: () => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const mutationRef = useRef<AbortController | undefined>(undefined)
  const [expanded, setExpanded] = useState(false)
  const [files, setFiles] = useState<readonly GitWorkspaceStashFile[] | undefined>(undefined)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  const [deleteOpen, setDeleteOpen] = useState(false)
  useEffect(() => () => { mutationRef.current?.abort() }, [])
  useEffect(() => {
    if (!expanded || files !== undefined) return
    const controller = new AbortController()
    void readFiles(workspaceId, entry.selector, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      setFiles(result.files)
      setFailure(result.failure === undefined ? undefined : failureLine(t, result.failure))
    })
    return () => { controller.abort() }
  }, [entry.selector, expanded, files, readFiles, t, workspaceId])
  const restoreEntry = (): void => {
    if (operation !== undefined) return
    const controller = new AbortController()
    mutationRef.current?.abort()
    mutationRef.current = controller
    setOperation({ kind: 'stash-restore' })
    setFailure(undefined)
    void restore(workspaceId, entry.selector, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      mutationRef.current = undefined
      setOperation(undefined)
      if (result !== undefined) { setFailure(failureLine(t, result)); return }
      onDone()
    })
  }
  const dropEntry = (): void => {
    if (operation !== undefined) return
    const controller = new AbortController()
    mutationRef.current?.abort()
    mutationRef.current = controller
    setDeleteOpen(false)
    setOperation({ kind: 'stash-delete' })
    setFailure(undefined)
    void drop(workspaceId, entry.selector, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      mutationRef.current = undefined
      setOperation(undefined)
      if (result !== undefined) { setFailure(failureLine(t, result)); return }
      onDone()
    })
  }
  return (
    <li className={css.stashCollection} data-git-stash={entry.selector}>
      <div className={css.stashRow}>
        <button
          type="button"
          className={css.stashToggle}
          aria-expanded={expanded}
          onClick={() => { setExpanded(value => !value) }}
        >
          <IconChevronDownOutline14 className={clsx(css.stashChevron, expanded && css.stashChevronExpanded)} />
          <span className={css.stashSubject} title={entry.subject}>{entry.subject}</span>
          <span className={css.stashDate}>{formatCommitDate(entry.date)}</span>
        </button>
        {expanded && (
          <span className={css.stashActions}>
            <button type="button" className={css.restoreButton} disabled={operation !== undefined} onClick={restoreEntry}>
              {t('stash.restore')}
            </button>
            <button type="button" className={clsx(css.restoreButton, css.deleteButton)} disabled={operation !== undefined} onClick={() => { setDeleteOpen(true) }}>
              {t('stash.delete')}
            </button>
          </span>
        )}
      </div>
      {expanded && (
        <div className={css.stashDetails}>
          {files === undefined && failure === undefined && <p className={css.note}>{t('stash.loadingFiles')}</p>}
          {files?.length === 0 && failure === undefined && <p className={css.note}>{t('stash.noFiles')}</p>}
          {files !== undefined && files.length > 0 && <ul className={css.level}>{files.map(file => <StashFileRow key={`${file.status}:${file.path}`} file={file} />)}</ul>}
          {failure !== undefined && <p className={css.error} role="alert">{failure}</p>}
        </div>
      )}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false) }}
        title={t('stash.delete')}
        closeLabel={t('actions.cancel')}
        footer={(
          <>
            <Button variant="outline" onClick={() => { setDeleteOpen(false) }}>{t('actions.cancel')}</Button>
            <Button variant="primary" onClick={dropEntry}>{t('stash.confirmDelete')}</Button>
          </>
        )}
      >
        <p>{t('stash.deleteConfirm', { subject: entry.subject })}</p>
      </Modal>
    </li>
  )
}

/** One pending-push commit row. */
function PendingCommitRow({ commit, onOpen }: {
  commit: GitWorkspaceCommit
  onOpen: () => void
}): ReactNode {
  return (
    <li className={css.pendingCommit} data-git-pending-push={commit.hash}>
      <button type="button" className={css.pendingCommitButton} onClick={onOpen}>
        <span className={css.pendingHash}>{commit.shortHash}</span>
        <span className={css.pendingSubject} title={commit.subject}>{commit.subject}</span>
        <span className={css.pendingMeta}>{commit.authorName} · {formatCommitDate(commit.date)}</span>
      </button>
    </li>
  )
}

/** One independently collapsible review section header. */
function SectionHeader({
  section, title, count, expanded, onToggle, selection,
}: {
  section: 'pending' | 'changes' | 'stash'
  title: string
  count: number
  expanded: boolean
  onToggle: () => void
  selection?: ReactNode
}): ReactNode {
  return (
    <div className={css.header} data-git-changes-header={section}>
      {selection}
      <button type="button" className={css.sectionToggle} aria-expanded={expanded} onClick={onToggle}>
        <IconChevronDownOutline14 className={clsx(css.sectionChevron, expanded && css.sectionChevronExpanded)} />
        <span className={css.name}>{title}</span>
        <span className={css.count}>{count}</span>
      </button>
    </div>
  )
}

/** Persistent operations above all collapsible review sections. */
function ReviewToolbar({ operations, operation, onReload, onClose, t }: {
  operations: ReactNode
  operation: GitOperationState | undefined
  onReload: () => void
  onClose: () => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  return (
    <div className={css.reviewToolbar}>
      <span className={css.reviewTitle} data-git-review-title>{t('changes.title')}</span>
      <span className={css.headerActions}>
        {operation !== undefined && (
          <span className={css.operationStatus} role="status" data-git-operation={operation.kind}>
            <span className={css.operationSpinner} aria-hidden="true" />
            {operationLabel(t, operation.kind)}
          </span>
        )}
        {operations}
        <button type="button" className={css.tool} disabled={operation !== undefined} aria-label={t('reload')} title={t('reload')} data-git-changes-reload onClick={onReload}><IconRefreshOutline16 /></button>
        <button type="button" className={css.tool} aria-label={t('changes.close')} title={t('changes.close')} data-git-changes-close onClick={onClose}><IconCloseOutline16 /></button>
      </span>
    </div>
  )
}

type ActionMode = 'commit' | 'commit-push' | 'stash'

/** A matched 16px outline icon from the Git action menu's visual set. */
function GitActionIcon({ action }: { action: 'commit' | 'commit-push' | 'push' | 'pull' }): ReactNode {
  return (
    <svg className={css.actionIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {action === 'commit' && (
        <>
          <path d="M1.75 8h4M10.25 8h4" />
          <circle cx="8" cy="8" r="2.25" />
        </>
      )}
      {action === 'commit-push' && (
        <>
          <path d="M2 11.75h3.75M10.25 11.75H14M8 10V2.5M4.75 5.75 8 2.5l3.25 3.25" />
          <circle cx="8" cy="11.75" r="2.25" />
        </>
      )}
      {action === 'push' && <path d="M8 13.5v-11M3.75 6.75 8 2.5l4.25 4.25" />}
      {action === 'pull' && <path d="M8 2.5v11m-4.25-4.25L8 13.5l4.25-4.25" />}
    </svg>
  )
}

function actionFailureLine(t: TranslateNS<'sidebarGitHistory'>, failure: RemoteFailure): string {
  return t('actions.failedWithReason', { message: failure.message })
}

/** Mutation controls shown in the working-changes header. */
function GitActionControls({
  workspaceId, paths, generateCommitMessage, commit, commitAndPush, push, pull, stash, onRollback, operation, setOperation, error, setError, onDone, t,
}: {
  workspaceId: WorkspaceId
  paths: readonly string[]
  generateCommitMessage: GitChangesInjected['generateCommitMessage']
  commit: GitChangesMutation
  commitAndPush: GitChangesMutation
  push: SyncGitChanges
  pull: SyncGitChanges
  stash: GitChangesMutation
  onRollback: () => void
  operation: GitOperationState | undefined
  setOperation: (operation: GitOperationState | undefined) => void
  error: string | undefined
  setError: (error: string | undefined) => void
  onDone: (operation: ActionMode | 'push' | 'pull') => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const operationRef = useRef<AbortController | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setMode] = useState<ActionMode | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [lastCommitMessage, setLastCommitMessage] = useState(() => readLastGitMessage(workspaceId, 'commit'))
  const [lastStashMessage, setLastStashMessage] = useState(() => readLastGitMessage(workspaceId, 'stash'))
  useEffect(() => () => { operationRef.current?.abort() }, [])
  useEffect(() => {
    setLastCommitMessage(readLastGitMessage(workspaceId, 'commit'))
    setLastStashMessage(readLastGitMessage(workspaceId, 'stash'))
  }, [workspaceId])
  const startOperation = (): AbortController => {
    operationRef.current?.abort()
    const controller = new AbortController()
    operationRef.current = controller
    return controller
  }
  const runCommit = (): void => {
    if (mode === undefined || message.trim() === '' || operation !== undefined) return
    const selectedMode = mode
    const selectedMessage = message.trim()
    setMode(undefined)
    setOperation({ kind: selectedMode })
    setError(undefined)
    const controller = startOperation()
    const action = selectedMode === 'commit' ? commit : selectedMode === 'commit-push' ? commitAndPush : stash
    void action(workspaceId, controller.signal, paths, selectedMessage).then((failure) => {
      if (controller.signal.aborted) return
      operationRef.current = undefined
      setOperation(undefined)
      if (failure !== undefined) {
        setError(actionFailureLine(t, failure))
        return
      }
      const kind = selectedMode === 'stash' ? 'stash' : 'commit'
      writeLastGitMessage(workspaceId, kind, selectedMessage)
      if (kind === 'stash') setLastStashMessage(selectedMessage)
      else setLastCommitMessage(selectedMessage)
      setMessage('')
      onDone(selectedMode)
    })
  }
  const openMessageDialog = (nextMode: ActionMode): void => {
    setError(undefined)
    setMessage('')
    setMode(nextMode)
  }
  const lastMessage = mode === 'stash' ? lastStashMessage : lastCommitMessage
  const runSync = (kind: 'push' | 'pull'): void => {
    if (operation !== undefined) return
    setOperation({ kind })
    setError(undefined)
    const controller = startOperation()
    void (kind === 'push' ? push : pull)(workspaceId, controller.signal).then((failure) => {
      if (controller.signal.aborted) return
      operationRef.current = undefined
      setOperation(undefined)
      if (failure !== undefined) {
        setError(actionFailureLine(t, failure))
        if (kind === 'pull') onDone(kind)
        return
      }
      onDone(kind)
    })
  }
  return (
    <>
      <Menu
        open={menuOpen}
        portal
        align="end"
        anchor={(
          <button type="button" className={css.actionButton} disabled={operation !== undefined} data-git-commit-menu onClick={() => { setMenuOpen(open => !open) }}>
            {t('actions.commit')} <IconChevronDownOutline14 />
          </button>
        )}
        items={[
          { id: 'commit', label: t('actions.commit'), icon: <GitActionIcon action="commit" />, disabled: paths.length === 0 },
          {
            id: 'commit-push', label: t('actions.commitPush'),
            icon: <GitActionIcon action="commit-push" />, disabled: paths.length === 0,
          },
          { id: 'push', label: t('actions.push'), icon: <GitActionIcon action="push" /> },
          { id: 'pull', label: t('actions.pull'), icon: <GitActionIcon action="pull" /> },
        ]}
        onSelect={(id) => {
          setMenuOpen(false)
          setError(undefined)
          if (id === 'push' || id === 'pull') runSync(id)
          else openMessageDialog(id as ActionMode)
        }}
        onClose={() => { setMenuOpen(false) }}
      />
      <button type="button" className={css.actionButton} disabled={operation !== undefined || paths.length === 0} data-git-stash-create onClick={() => { openMessageDialog('stash') }}><StashIcon />{t('actions.stash')}</button>
      <button type="button" className={clsx(css.actionButton, css.rollbackButton)} disabled={operation !== undefined || paths.length === 0} data-git-rollback-selected onClick={onRollback}><RollbackIcon />{t('rollback.batch')}</button>
      <CommitMessageDialog
        open={mode !== undefined}
        ai={mode !== undefined && mode !== 'stash' ? { workspaceId, paths, message, generate: generateCommitMessage, onMessage: setMessage, onError: setError } : undefined}
        className={clsx(css.actionDialog)}
        onClose={() => { setMode(undefined) }}
        title={mode === 'stash' ? t('actions.stash') : mode === 'commit-push' ? t('actions.commitPush') : t('actions.commit')}
        closeLabel={t('actions.cancel')}
        footer={(
          <>
            <Button variant="outline" onClick={() => { setMode(undefined) }}>{t('actions.cancel')}</Button>
            <Button disabled={message.trim() === ''} onClick={runCommit}>{mode === 'stash' ? t('stash.confirm') : t('actions.confirm')}</Button>
          </>
        )}
      >
        <Input autoFocus value={message} placeholder={mode === 'stash' ? t('stash.messagePlaceholder') : t('actions.messagePlaceholder')} onChange={(event) => { setMessage(event.target.value) }} />
        {lastMessage !== undefined && (
          <div className={css.lastMessage} data-git-last-message>
            <span className={css.lastMessageLabel}>{t('actions.lastMessage')}</span>
            <span className={css.lastMessageText} title={lastMessage}>{lastMessage}</span>
            <button type="button" className={css.fillMessageButton} onClick={() => { setMessage(lastMessage) }}>
              {t('actions.fillMessage')}
            </button>
          </div>
        )}
        {error !== undefined && <p className={css.error} role="alert">{error}</p>}
      </CommitMessageDialog>
    </>
  )
}

/** The code-review region and its independently collapsible Git sections. */
export function GitChangesBody({
  sessionId, useSessions, useWorkspaces, readChanges, trackFiles, generateCommitMessage, commitChanges, commitAndPushChanges, pushChanges, pullChanges, stashChanges,
  rollbackChanges,
  readStashFiles, restoreStash, dropStash, readWorkingDiff, readCommitFiles, readCommitDiff, useDiffZoomModifier, t,
}: GitChangesBodyProps): ReactNode {
  const zoomModifier = useDiffZoomModifier(value => value)
  const visible = useGitChangesVisible(sessionId)
  const rootRef = useRef<HTMLDivElement>(null)
  const stopResizeRef = useRef<(() => void) | undefined>(undefined)
  const cwd = useSessions(sessions => sessions.byId[sessionId]?.cwd)
  const workspaceId = useWorkspaces((workspaces) => {
    const owned = workspaces.items.find(workspace => workspace.sessionIds.includes(sessionId))
    if (owned !== undefined) return owned.workspaceId
    return workspaces.items.find(workspace => workspace.path === cwd)?.workspaceId
  })
  const trackRequest = useRef<AbortController | undefined>(undefined)
  useEffect(() => { trackRequest.current?.abort(); trackRequest.current = undefined; setOperation(undefined); return () => { trackRequest.current?.abort() } }, [workspaceId])
  const [read, setRead] = useState<GitChangesRead | undefined>(undefined)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [revision, setRevision] = useState(0)
  const [pendingExpanded, setPendingExpanded] = useState(true)
  const [changesExpanded, setChangesExpanded] = useState(true)
  const [untrackedExpanded, setUntrackedExpanded] = useState(false)
  const [stashExpanded, setStashExpanded] = useState(true)
  const [selectedCommit, setSelectedCommit] = useState<GitWorkspaceCommit | undefined>(undefined)
  const [selectedWorkingFile, setSelectedWorkingFile] = useState<GitWorkspaceStatusFile | undefined>(undefined)
  const [operation, setOperation] = useState<GitOperationState | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)
  const [rollbackFiles, setRollbackFiles] = useState<readonly GitWorkspaceStatusFile[] | undefined>(undefined)
  useEffect(() => {
    if (!visible || workspaceId === undefined) return
    const controller = new AbortController()
    let alive = true
    void readChanges(workspaceId, controller.signal).then((next) => {
      // A settled read for a region already unmounted, or one the cleanup just
      // aborted, writes nothing.
      if (!alive || controller.signal.aborted) return
      setRead(next)
      setSelected(new Set(next.files.filter(file => !file.untracked && !isGitIgnorePath(file.path)).map(file => file.path)))
    })
    return () => {
      alive = false
      controller.abort()
    }
  }, [visible, workspaceId, revision, readChanges])
  useEffect(() => () => { stopResizeRef.current?.() }, [])

  if (!visible) return null

  const beginResize = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const root = rootRef.current
    if (root === null) return
    let panel = root.parentElement
    while (panel !== null && panel.getBoundingClientRect().height < MIN_REGION_HEIGHT * 2) {
      panel = panel.parentElement
    }
    if (panel === null) return
    event.preventDefault()
    stopResizeRef.current?.()
    const handle = event.currentTarget
    let nextY = event.clientY
    let height = root.getBoundingClientRect().height
    let frame: number | undefined
    const previousUserSelect = document.body.style.userSelect
    const previousCursor = document.body.style.cursor
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'row-resize'
    handle.dataset.active = 'true'
    // The region hugs the bottom of the panel, so its height is the distance
    // from the pointer down to that edge: dragging up grows the region.
    const applyHeight = (): void => {
      frame = undefined
      height = regionHeightAt(panel.getBoundingClientRect(), nextY)
      root.style.height = `${height}px`
    }
    const move = (moveEvent: MouseEvent): void => {
      nextY = moveEvent.clientY
      if (frame === undefined) frame = requestAnimationFrame(applyHeight)
    }
    const stop = (): void => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      applyHeight()
      rememberedHeight = height
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', stop)
      document.body.style.userSelect = previousUserSelect
      document.body.style.cursor = previousCursor
      delete handle.dataset.active
      stopResizeRef.current = undefined
    }
    stopResizeRef.current = stop
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
  }
  /** Put the region back to its default half of the panel. */
  const resetHeight = (): void => {
    rememberedHeight = undefined
    if (rootRef.current !== null) rootRef.current.style.height = ''
  }
  const close = (): void => { setGitChangesVisible(sessionId, false) }

  if (workspaceId === undefined) {
    return (
      <div ref={rootRef} className={css.root} data-git-changes="no-workspace">
        <div className={css.content}>
          <p className={css.note} data-git-changes-row="no-workspace">{t('noWorkspace')}</p>
        </div>
        <button type="button" className={clsx(css.tool, css.closeFloating)} aria-label={t('changes.close')} title={t('changes.close')} data-git-changes-close onClick={close}><IconCloseOutline16 /></button>
        <div
          className={css.resizeHandle}
          role="separator"
          aria-label={t('changes.resize')}
          aria-orientation="horizontal"
          data-git-changes-resize
          onMouseDown={beginResize}
          onDoubleClick={resetHeight}
        />
      </div>
    )
  }
  const repository = read?.repository ?? false
  const reportedFiles = read?.files ?? []
  const gitIgnoreHidden = reportedFiles.some(file => isGitIgnorePath(file.path))
  const files = reportedFiles.filter(file => !isGitIgnorePath(file.path))
  const tracked = files.filter(file => !file.untracked)
  const untracked = files.filter(file => file.untracked)
  const stashes = read?.stashes ?? []
  const pendingPush = read?.pendingPush ?? []
  const failed = read?.failure === undefined ? undefined : failureLine(t, read.failure)
  const pendingFailed = read?.pendingFailure === undefined ? undefined : failureLine(t, read.pendingFailure)
  const stashFailed = read?.stashFailure === undefined ? undefined : failureLine(t, read.stashFailure)
  const open = (file: GitWorkspaceStatusFile): void => { setSelectedWorkingFile(file) }
  const trackFile = (file: GitWorkspaceStatusFile): void => {
    if (operation !== undefined || trackRequest.current) return
    const controller = new AbortController()
    trackRequest.current = controller
    setOperation({ kind: 'track' })
    setActionError(undefined)
    void trackFiles(workspaceId, controller.signal, [file.path]).then(() => {
      if (!controller.signal.aborted) setRevision(value => value + 1)
    }).catch(error => {
      if (!controller.signal.aborted) setActionError(error instanceof Error ? error.message : String(error))
    }).finally(() => {
      if (trackRequest.current === controller) {
        trackRequest.current = undefined
        if (!controller.signal.aborted) setOperation(undefined)
      }
    })
  }
  const allSelected = tracked.length > 0 && tracked.every(file => selected.has(file.path))
  const operationPaths = tracked.flatMap(file => selected.has(file.path)
    ? [file.path, ...(file.renamedFrom === undefined ? [] : [file.renamedFrom])]
    : [])
  const selectedFiles = tracked.filter(file => selected.has(file.path))
  const setFileSelected = (path: string, checked: boolean): void => {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(path)
      else next.delete(path)
      return next
    })
  }
  return (
    <div
      ref={rootRef}
      className={css.root}
      data-git-changes={workspaceId}
      style={rememberedHeight === undefined ? undefined : { height: `${rememberedHeight}px` }}
    >
      <div className={css.content}>
        <ReviewToolbar
          operation={operation}
          operations={(
            <GitActionControls
              workspaceId={workspaceId}
              paths={operationPaths}
              generateCommitMessage={generateCommitMessage}
              commit={commitChanges}
              commitAndPush={commitAndPushChanges}
              push={pushChanges}
              pull={pullChanges}
              stash={stashChanges}
              onRollback={() => { setRollbackFiles(selectedFiles) }}
              operation={operation}
              setOperation={setOperation}
              error={actionError}
              setError={setActionError}
              onDone={(completed) => {
                if (completed === 'push') {
                  setRead(current => current === undefined ? current : {
                    ...current,
                    pendingPush: [],
                    pendingMore: false,
                    pendingFailure: undefined,
                  })
                  return
                }
                if (completed === 'pull') notifyGitHistoryRefresh(sessionId)
                setRevision(current => current + 1)
              }}
              t={t}
            />
          )}
          onReload={() => { if (operation === undefined) setRevision(current => current + 1) }}
          onClose={close}
          t={t}
        />
        {actionError !== undefined && <p className={css.actionError} role="alert" data-git-action-error>{actionError}</p>}
        <SectionHeader section="pending" title={t('pending.title')} count={pendingPush.length} expanded={pendingExpanded} onToggle={() => { setPendingExpanded(value => !value) }} />
        {pendingExpanded && (
          <div className={css.list} data-git-review-section-body="pending">
            {read !== undefined && pendingFailed !== undefined && <p className={css.error} data-git-changes-row="pending-failed">{pendingFailed}</p>}
            {read !== undefined && repository && pendingFailed === undefined && !read.hasUpstream && (
              <p className={css.note} data-git-changes-row="pending-no-upstream">{t('pending.noUpstream')}</p>
            )}
            {read !== undefined && repository && pendingFailed === undefined && read.hasUpstream && pendingPush.length === 0 && (
              <p className={css.note} data-git-changes-row="pending-empty">{t('pending.empty')}</p>
            )}
            {pendingPush.length > 0 && (
              <ul className={css.level}>
                {pendingPush.map(commit => (
                  <PendingCommitRow
                    key={commit.hash}
                    commit={commit}
                    onOpen={() => { setSelectedCommit(commit) }}
                  />
                ))}
              </ul>
            )}
            {read?.pendingMore === true && <p className={css.note} data-git-changes-row="pending-more">{t('pending.more')}</p>}
          </div>
        )}
        <SectionHeader
          section="changes"
          title={t('changes.sectionTitle')}
          count={read === undefined ? 0 : tracked.length}
          expanded={changesExpanded}
          onToggle={() => { setChangesExpanded(value => !value) }}
          selection={tracked.length > 0 ? (
            <input
              type="checkbox"
              className={css.fileCheckbox}
              checked={allSelected}
              aria-label={t('changes.selectAll')}
              data-git-select-all
              onChange={(event) => { setSelected(event.target.checked ? new Set(tracked.map(file => file.path)) : new Set()) }}
            />
          ) : undefined}
        />
        {changesExpanded && <div className={css.list} data-git-review-section-body="changes">
          {read === undefined && <p className={css.note} data-git-changes-row="loading">{t('loading')}</p>}
          {read !== undefined && !repository && failed === undefined && (
            <p className={css.note} data-git-changes-row="not-repository">{t('notRepository')}</p>
          )}
          {read !== undefined && failed !== undefined && (
            <p className={css.error} data-git-changes-row="failed">{failed}</p>
          )}
          {read !== undefined && repository && gitIgnoreHidden && failed === undefined && (
            <p className={css.ignoreNote} data-git-changes-row="gitignore-filtered">{t('changes.gitignoreFiltered')}</p>
          )}
          {read !== undefined && repository && tracked.length === 0 && untracked.length === 0 && failed === undefined && (
            <p className={css.note} data-git-changes-row="empty">{t('changes.empty')}</p>
          )}
          {tracked.length > 0 && (
            <ul className={css.level}>{tracked.map(file => (
              <FileRow
                key={file.path}
                file={file}
                selected={selected.has(file.path)}
                disabled={operation !== undefined}
                onSelect={(checked) => { setFileSelected(file.path, checked) }}
                onOpen={open}
                onRollback={(target) => { setRollbackFiles([target]) }}
                  onTrack={trackFile}
                t={t}
              />
            ))}</ul>
          )}
          {repository && untracked.length > 0 && (
            <>
              <button type="button" className={css.subsectionHeader} data-git-changes-header="untracked" aria-expanded={untrackedExpanded} onClick={() => { setUntrackedExpanded(value => !value) }}>
                <IconChevronDownOutline14 className={clsx(css.sectionChevron, untrackedExpanded && css.sectionChevronExpanded)} />
                <span>{t('changes.untrackedTitle')}</span><span className={css.count}>{untracked.length}</span>
              </button>
              {untrackedExpanded && <ul className={css.level}>{untracked.map(file => (
                <FileRow
                  key={file.path}
                  file={file}
                  selected={selected.has(file.path)}
                  disabled={operation !== undefined}
                  onSelect={(checked) => { setFileSelected(file.path, checked) }}
                  onOpen={open}
                  onRollback={(target) => { setRollbackFiles([target]) }}
                  t={t}
                />
              ))}</ul>}
            </>
          )}
        </div>}
        <SectionHeader section="stash" title={t('stash.title')} count={stashes.length} expanded={stashExpanded} onToggle={() => { setStashExpanded(value => !value) }} />
        {stashExpanded && <div className={css.list} data-git-review-section-body="stash">
          {read !== undefined && stashFailed !== undefined && <p className={css.error} data-git-changes-row="stash-failed">{stashFailed}</p>}
          {read !== undefined && repository && stashFailed === undefined && stashes.length === 0 && (
            <p className={css.note} data-git-changes-row="stash-empty">{t('stash.empty')}</p>
          )}
          {stashes.length > 0 && (
            <ul className={css.level}>{stashes.map(entry => (
              <StashRow
                key={entry.selector}
                entry={entry}
                workspaceId={workspaceId}
                readFiles={readStashFiles}
                restore={restoreStash}
                drop={dropStash}
                operation={operation}
                setOperation={setOperation}
                onDone={() => { setRevision(current => current + 1) }}
                t={t}
              />
            ))}</ul>
          )}
        </div>}
      </div>
      <CommitDetailModal
        commit={selectedCommit}
        workspaceId={workspaceId}
        readCommitFiles={readCommitFiles}
        readCommitDiff={readCommitDiff}
        zoomModifier={zoomModifier}
        onClose={() => { setSelectedCommit(undefined) }}
        t={t}
      />
      <WorkingTreeDiffModal
        file={selectedWorkingFile}
        workspaceId={workspaceId}
        readWorkingDiff={readWorkingDiff}
        zoomModifier={zoomModifier}
        onClose={() => { setSelectedWorkingFile(undefined) }}
        t={t}
      />
      <RollbackDialog
        workspaceId={workspaceId}
        files={rollbackFiles}
        rollback={rollbackChanges}
        operation={operation}
        setOperation={setOperation}
        onClose={() => { if (operation === undefined) setRollbackFiles(undefined) }}
        onDone={() => { setRevision(current => current + 1) }}
        t={t}
      />
      <div
        className={css.resizeHandle}
        role="separator"
        aria-label={t('changes.resize')}
        aria-orientation="horizontal"
        data-git-changes-resize
        onMouseDown={beginResize}
        onDoubleClick={resetHeight}
      />
    </div>
  )
}
