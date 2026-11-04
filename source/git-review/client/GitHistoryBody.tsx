/**
 * The commit history's body: one workspace's commits, newest first, paged.
 *
 * Everything the history keeps lives in its store, keyed by tab; everything it
 * asks for goes through its injected face. The component decides only what to
 * draw and what a control means: reload re-reads the window, the search box
 * replaces it, and load-more appends the next page. The workspace is named from
 * the framework's Workspace hook (by session membership, else by the session's
 * working directory), never by a path the reader types.
 */
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type {
  FormEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject, UIEvent as ReactUIEvent,
} from 'react'
import clsx from 'clsx'
import type { RemoteFailure } from '@deepseek-ai/dsh-api-remotes/client'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  IconBranchOutline16, IconChevronRightOutline14, IconCloseOutline16, IconFullscreenOutline16, IconRefreshOutline16,
  IconSearchOutline16, Input, Modal, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { workspaceTitleOf } from '@deepseek-ai/dsh-util-workspace-path'
import type {
  GitWorkspaceCommit, GitWorkspaceCommitDiffState, GitWorkspaceCommitFile, GitWorkspaceStatusFile,
} from '@monster-30cl/dsh-git-workspace-controller/types'
import type { WorkspaceId } from '@deepseek-ai/dsh-workspace/types'
import type { GitHistoryInjected } from './face.ts'
import { matchesDiffZoomModifier, type DiffZoomModifier } from '../diff-zoom-settings.ts'
import type { DiffZoomPreferenceInjected } from './diff-zoom-preference.ts'
import type { ReadGitWorkingDiff } from './changes.ts'
import { setGitChangesVisible, subscribeGitHistoryRefresh, useGitChangesVisible } from './changes-visibility.ts'
import type {} from './locales.ts'
import type { GitHistoryFilter, GitTabState, createGitHistoryStore } from './store.ts'
import css from './GitHistoryBody.module.css'
import { ComparisonDialog } from './ComparisonDialog'
import { HistoryDatePicker } from './HistoryDatePicker'

/** The body's composed props: the tab it draws, its store, its face, and its copy. */
export type GitHistoryBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsStore<ReturnType<typeof createGitHistoryStore>>
  & GitHistoryInjected
  & InjectFace<DiffZoomPreferenceInjected>
  & PropsLocale<'sidebarGitHistory'>

/**
 * Say why the history could not be read, in terms of the read.
 * @param t - namespace-bound translate.
 * @param failure - the settled Remote failure.
 * @returns the line to show in place of the list.
 */
export function failureLine(t: TranslateNS<'sidebarGitHistory'>, failure: RemoteFailure): string {
  switch (failure.code) {
    case 'git/unavailable': return t('error.gitUnavailable')
    case 'workspace/not-found': return t('error.workspaceNotFound')
    case 'git/operation-failed': return t('error.operationFailed', { message: failure.message })
    // Carrier and unclassified host failures reach the reader as themselves.
    default: return t('error.unavailable', { message: failure.message })
  }
}

/**
 * Render an ISO-8601 author date as `YYYY-MM-DD HH:mm`, the minute the commit
 * was made. The date is wire data, so it is formatted, never translated.
 * @param iso - the commit's strict ISO author date.
 * @returns the readable date, or the input unchanged when it does not parse.
 */
export function formatCommitDate(iso: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/u.exec(iso)
  if (match === null) return iso
  const [, date = '', time = ''] = match
  return `${date} ${time}`
}

/** One commit's row: short hash, subject, author, and date. */
function CommitRow({ commit, onOpen }: { commit: GitWorkspaceCommit; onOpen: () => void }): ReactNode {
  return (
    <li className={css.item} data-git-commit={commit.hash}>
      <button type="button" className={css.commitButton} onClick={onOpen}>
        <div className={css.row}>
          <code className={css.hash}>{commit.shortHash}</code>
          <span className={css.subject} title={commit.subject}>{commit.subject}</span>
        </div>
        <div className={css.meta}>
          <span className={css.author}>{commit.authorName}</span>
          <span className={css.date}>{formatCommitDate(commit.date)}</span>
        </div>
      </button>
    </li>
  )
}

/** The list body for a loaded window, or the line that replaces it. */
function HistoryList({ state, onOpen, t }: {
  state: GitTabState
  onOpen: (commit: GitWorkspaceCommit) => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  if (!state.repository) return <p className={css.note} data-git-row="not-repository">{t('notRepository')}</p>
  if (state.commits.length === 0) {
    return (
      <p className={css.note} data-git-row="empty">
        {state.search === '' && state.author === '' && state.since === '' && state.until === ''
          ? t('empty')
          : t('emptySearch')}
      </p>
    )
  }
  return (
    <ul className={css.level}>
      {state.commits.map(commit => <CommitRow key={commit.hash} commit={commit} onOpen={() => { onOpen(commit) }} />)}
    </ul>
  )
}

export interface SideBySideDiffRow {
  readonly oldLine: number | undefined
  readonly oldText: string | undefined
  readonly newLine: number | undefined
  readonly newText: string | undefined
  readonly kind: 'context' | 'changed'
}

const DIFF_LINE_HEIGHT = 20
const DIFF_VIEWPORT_FALLBACK = 600
const DIFF_OVERSCAN_ROWS = 20
const DIFF_FONT_MIN = 9
const DIFF_FONT_MAX = 20
const DIFF_FONT_DEFAULT = 12

interface DiffRenderWindow {
  readonly start: number
  readonly end: number
}

/** Select the bounded row window around one pane's current viewport. */
function diffRenderWindow(
  scrollTop: number, clientHeight: number, rowCount: number, lineHeight = DIFF_LINE_HEIGHT,
): DiffRenderWindow {
  const visibleRows = Math.max(1, Math.ceil((clientHeight || DIFF_VIEWPORT_FALLBACK) / lineHeight))
  const firstVisible = Math.max(0, Math.floor(scrollTop / lineHeight))
  return {
    start: Math.max(0, firstVisible - DIFF_OVERSCAN_ROWS),
    end: Math.min(rowCount, firstVisible + visibleRows + DIFF_OVERSCAN_ROWS),
  }
}

export type DiffLanguage =
  | 'java' | 'xml' | 'text' | 'python' | 'typescript' | 'javascript'
  | 'json' | 'markdown' | 'css' | 'html' | 'shell' | 'sql' | 'generic'

/** Resolve syntax colors from the selected file's extension. */
export function diffLanguage(path: string): DiffLanguage {
  const extension = path.toLocaleLowerCase().split('.').at(-1) ?? ''
  switch (extension) {
    case 'java': return 'java'
    case 'xml': case 'xsd': case 'xsl': case 'xslt': case 'pom': return 'xml'
    case 'txt': case 'log': return 'text'
    case 'py': case 'pyw': return 'python'
    case 'ts': case 'tsx': case 'mts': case 'cts': return 'typescript'
    case 'js': case 'jsx': case 'mjs': case 'cjs': return 'javascript'
    case 'json': case 'jsonc': return 'json'
    case 'md': case 'mdx': return 'markdown'
    case 'css': case 'scss': case 'sass': case 'less': return 'css'
    case 'html': case 'htm': case 'vue': case 'svelte': return 'html'
    case 'sh': case 'bash': case 'zsh': case 'ps1': case 'bat': case 'cmd': return 'shell'
    case 'sql': return 'sql'
    default: return 'generic'
  }
}

export interface DiffSyntaxToken {
  readonly text: string
  readonly kind: 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'tag' | 'attribute'
}

const LANGUAGE_KEYWORDS: Readonly<Partial<Record<DiffLanguage, ReadonlySet<string>>>> = {
  java: new Set(['abstract', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'do', 'else', 'enum', 'extends', 'final', 'finally', 'for', 'if', 'implements', 'import', 'instanceof', 'interface', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'throws', 'true', 'try', 'void', 'while']),
  python: new Set(['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield']),
  typescript: new Set(['as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'void', 'while']),
  javascript: new Set(['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while']),
  sql: new Set(['and', 'as', 'asc', 'by', 'case', 'create', 'delete', 'desc', 'distinct', 'else', 'end', 'from', 'group', 'having', 'in', 'insert', 'into', 'is', 'join', 'left', 'like', 'limit', 'not', 'null', 'on', 'or', 'order', 'outer', 'right', 'select', 'set', 'then', 'union', 'update', 'values', 'when', 'where']),
  shell: new Set(['case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in', 'then', 'until', 'while']),
}

/** Tokenize one visible line without retaining a full-file syntax tree. */
export function tokenizeDiffLine(text: string, language: DiffLanguage): readonly DiffSyntaxToken[] {
  if (language === 'text' || language === 'generic') return [{ text, kind: 'plain' }]
  const markup = language === 'xml' || language === 'html'
  const pattern = markup
    ? /(<!--.*?-->|<\/?[\w:-]+|\/?>|[\w:-]+(?=\s*=)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/gu
    : /(\/\/.*$|#(?!\{).*?$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/gu
  const tokens: DiffSyntaxToken[] = []
  let cursor = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index
    if (index > cursor) tokens.push({ text: text.slice(cursor, index), kind: 'plain' })
    const value = match[0]
    let kind: DiffSyntaxToken['kind'] = 'plain'
    if (value.startsWith('<!--') || value.startsWith('//') || value.startsWith('/*') || (value.startsWith('#') && language !== 'css')) kind = 'comment'
    else if (/^["'`]/u.test(value)) kind = 'string'
    else if (/^\d/u.test(value)) kind = 'number'
    else if (markup && value.startsWith('<')) kind = 'tag'
    else if (markup && /^[\w:-]+$/u.test(value)) kind = 'attribute'
    else if (LANGUAGE_KEYWORDS[language]?.has(value) === true || LANGUAGE_KEYWORDS[language]?.has(value.toLocaleLowerCase()) === true) kind = 'keyword'
    tokens.push({ text: value, kind })
    cursor = index + value.length
    if (kind === 'comment' && !markup) break
  }
  if (cursor < text.length) tokens.push({ text: text.slice(cursor), kind: 'plain' })
  return tokens
}

function SyntaxCode({ text, language, search }: {
  readonly text: string
  readonly language: DiffLanguage
  readonly search: string
}): ReactNode {
  const query = search.trim().toLocaleLowerCase()
  const ranges: Array<readonly [number, number]> = []
  if (query !== '') {
    const haystack = text.toLocaleLowerCase()
    let index = haystack.indexOf(query)
    while (index >= 0) {
      ranges.push([index, index + query.length])
      index = haystack.indexOf(query, index + Math.max(1, query.length))
    }
  }
  let offset = 0
  return tokenizeDiffLine(text, language).flatMap((token, tokenIndex) => {
    const start = offset
    const end = start + token.text.length
    offset = end
    const cuts = new Set([start, end])
    for (const [rangeStart, rangeEnd] of ranges) {
      if (rangeStart < end && rangeEnd > start) {
        cuts.add(Math.max(start, rangeStart))
        cuts.add(Math.min(end, rangeEnd))
      }
    }
    const points = [...cuts].sort((left, right) => left - right)
    return points.slice(0, -1).map((point, partIndex) => {
      const next = points[partIndex + 1] ?? point
      const value = token.text.slice(point - start, next - start)
      const matched = ranges.some(([rangeStart, rangeEnd]) => point >= rangeStart && next <= rangeEnd)
      if (matched) return <mark key={`${tokenIndex}-${partIndex}`} className={css.searchMatch}>{value}</mark>
      return token.kind === 'plain'
        ? value
        : <span key={`${tokenIndex}-${partIndex}`} className={css[`syntax_${token.kind}`]}>{value}</span>
    })
  })
}

/** Find aligned row indexes containing one side's case-insensitive search text. */
export function diffSearchRows(
  rows: readonly SideBySideDiffRow[], side: 'old' | 'new', search: string,
): readonly number[] {
  const query = search.trim().toLocaleLowerCase()
  if (query === '') return []
  return rows.flatMap((row, index) => {
    const text = side === 'old' ? row.oldText : row.newText
    return text?.toLocaleLowerCase().includes(query) === true ? [index] : []
  })
}

/** Convert a unified patch into aligned before-and-after rows without patch metadata. */
export function parseSideBySideDiff(patch: string): readonly SideBySideDiffRow[] {
  const rows: SideBySideDiffRow[] = []
  let oldLine = 0
  let newLine = 0
  let inHunk = false
  let removed: Array<{ line: number; text: string }> = []
  let added: Array<{ line: number; text: string }> = []
  const flushChanges = (): void => {
    const length = Math.max(removed.length, added.length)
    for (let index = 0; index < length; index += 1) {
      const before = removed[index]
      const after = added[index]
      rows.push({
        oldLine: before?.line,
        oldText: before?.text,
        newLine: after?.line,
        newText: after?.text,
        kind: 'changed',
      })
    }
    removed = []
    added = []
  }
  const patchLines = patch.split(/\r?\n/u)
  if (patchLines.at(-1) === '') patchLines.pop()
  for (const line of patchLines) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/u.exec(line)
    if (hunk !== null) {
      flushChanges()
      oldLine = Number(hunk[1])
      newLine = Number(hunk[2])
      inHunk = true
      continue
    }
    if (!inHunk || line.startsWith('\\ No newline at end of file')) continue
    if (line.startsWith('-')) {
      removed.push({ line: oldLine, text: line.slice(1) })
      oldLine += 1
      continue
    }
    if (line.startsWith('+')) {
      added.push({ line: newLine, text: line.slice(1) })
      newLine += 1
      continue
    }
    flushChanges()
    const text = line.startsWith(' ') ? line.slice(1) : line
    rows.push({ oldLine, oldText: text, newLine, newText: text, kind: 'context' })
    oldLine += 1
    newLine += 1
  }
  flushChanges()
  return rows
}

function contentLines(content: string): readonly string[] {
  if (content === '') return []
  const lines = content.split(/\r?\n/u)
  if (lines.at(-1) === '') lines.pop()
  return lines
}

/** Expand patch rows with every unchanged line from the complete before and after files. */
export function parseFullSideBySideDiff(
  before: string, after: string, patch: string,
): readonly SideBySideDiffRow[] {
  const oldLines = contentLines(before)
  const newLines = contentLines(after)
  const changedRows = parseSideBySideDiff(patch)
  const rows: SideBySideDiffRow[] = []
  let oldCursor = 1
  let newCursor = 1
  const appendContext = (): void => {
    rows.push({
      oldLine: oldCursor,
      oldText: oldLines[oldCursor - 1] ?? '',
      newLine: newCursor,
      newText: newLines[newCursor - 1] ?? '',
      kind: 'context',
    })
    oldCursor += 1
    newCursor += 1
  }
  for (const row of changedRows) {
    const oldGap = row.oldLine === undefined ? Number.POSITIVE_INFINITY : row.oldLine - oldCursor
    const newGap = row.newLine === undefined ? Number.POSITIVE_INFINITY : row.newLine - newCursor
    const gap = Math.min(oldGap, newGap)
    for (let index = 0; index < gap; index += 1) appendContext()
    rows.push(row)
    if (row.oldLine !== undefined) oldCursor = row.oldLine + 1
    if (row.newLine !== undefined) newCursor = row.newLine + 1
  }
  while (oldCursor <= oldLines.length && newCursor <= newLines.length) appendContext()
  while (oldCursor <= oldLines.length) {
    rows.push({
      oldLine: oldCursor, oldText: oldLines[oldCursor - 1],
      newLine: undefined, newText: undefined, kind: 'changed',
    })
    oldCursor += 1
  }
  while (newCursor <= newLines.length) {
    rows.push({
      oldLine: undefined, oldText: undefined,
      newLine: newCursor, newText: newLines[newCursor - 1], kind: 'changed',
    })
    newCursor += 1
  }
  return rows
}

/** One complete side of the aligned comparison. */
function DiffPane({ rows, side, paneRef, renderWindow, canvasColumns, language, lineHeight, search, activeRow, onScroll }: {
  rows: readonly SideBySideDiffRow[]
  side: 'old' | 'new'
  paneRef: RefObject<HTMLDivElement>
  renderWindow: DiffRenderWindow
  canvasColumns: number
  language: DiffLanguage
  lineHeight: number
  search: string
  activeRow: number | undefined
  onScroll: (side: 'old' | 'new', event: ReactUIEvent<HTMLDivElement>) => void
}): ReactNode {
  return (
    <div
      ref={paneRef}
      className={css.diffPane}
      data-git-diff-pane={side}
      onScroll={(event) => { onScroll(side, event) }}
    >
      <div className={css.diffCanvas} style={{ width: `max(100%, ${canvasColumns}ch)` }}>
        <div style={{ height: renderWindow.start * lineHeight }} aria-hidden="true" />
        {rows.slice(renderWindow.start, renderWindow.end).map((row, index) => {
          const rowIndex = renderWindow.start + index
          const line = side === 'old' ? row.oldLine : row.newLine
          const content = side === 'old' ? row.oldText : row.newText
          const changed = row.kind === 'changed' && content !== undefined
          const change = changed ? (side === 'old' ? 'removed' : 'added') : side
          return (
            <div
              key={rowIndex}
              className={clsx(
                css.diffCell,
                changed && (side === 'old' ? css.removed : css.added),
                rowIndex === activeRow && css.searchActiveRow,
              )}
              data-git-diff-side={change}
              style={{ height: lineHeight }}
            >
              {side === 'old' && <code><SyntaxCode text={content ?? ''} language={language} search={search} /></code>}
              <span className={css.lineNumber} data-git-line-number={side}>{line ?? ''}</span>
              {side === 'new' && <code><SyntaxCode text={content ?? ''} language={language} search={search} /></code>}
            </div>
          )
        })}
        <div style={{ height: (rows.length - renderWindow.end) * lineHeight }} aria-hidden="true" />
      </div>
    </div>
  )
}

/** The complete two-pane comparison, initially positioned at its first changed row. */
const FullDiff = memo(function FullDiff({ comparison, path, synchronized, zoomModifier, t }: {
  comparison: GitWorkspaceCommitDiffState
  path: string
  synchronized: boolean
  zoomModifier: DiffZoomModifier
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const table = useRef<HTMLDivElement>(null)
  const oldPane = useRef<HTMLDivElement>(null)
  const newPane = useRef<HTMLDivElement>(null)
  const synchronizing = useRef(false)
  const zoomTimer = useRef<number | undefined>(undefined)
  const [fontSize, setFontSize] = useState(DIFF_FONT_DEFAULT)
  const [zoomVisible, setZoomVisible] = useState(false)
  const [searches, setSearches] = useState({ old: '', new: '' })
  const [searchPositions, setSearchPositions] = useState({ old: -1, new: -1 })
  const language = useMemo(() => diffLanguage(path), [path])
  const lineHeight = fontSize + 8
  const rows = useMemo(
    () => parseFullSideBySideDiff(comparison.before, comparison.after, comparison.patch),
    [comparison.after, comparison.before, comparison.patch],
  )
  const firstChange = rows.findIndex(row => row.kind === 'changed')
  const initialTop = Math.max(0, firstChange * DIFF_LINE_HEIGHT - Math.floor(DIFF_VIEWPORT_FALLBACK / 3))
  const initialWindow = diffRenderWindow(initialTop, DIFF_VIEWPORT_FALLBACK, rows.length)
  const [renderWindows, setRenderWindows] = useState<{ old: DiffRenderWindow; new: DiffRenderWindow }>({
    old: initialWindow,
    new: initialWindow,
  })
  const canvasColumns = useMemo(() => rows.reduce((longest, row) => Math.max(
    longest,
    row.oldText?.length ?? 0,
    row.newText?.length ?? 0,
  ), 1) + 8, [rows])
  const searchMatches = useMemo(() => ({
    old: diffSearchRows(rows, 'old', searches.old),
    new: diffSearchRows(rows, 'new', searches.new),
  }), [rows, searches])
  useEffect(() => {
    setFontSize(DIFF_FONT_DEFAULT)
    setSearches({ old: '', new: '' })
    setSearchPositions({ old: -1, new: -1 })
    if (firstChange < 0) return
    const top = firstChange * DIFF_LINE_HEIGHT
    for (const pane of [oldPane.current, newPane.current]) {
      if (pane === null) continue
      pane.scrollTop = Math.max(0, top - Math.floor(pane.clientHeight / 3))
    }
    const height = oldPane.current?.clientHeight || DIFF_VIEWPORT_FALLBACK
    const next = diffRenderWindow(Math.max(0, top - Math.floor(height / 3)), height, rows.length)
    setRenderWindows({ old: next, new: next })
  }, [comparison, firstChange, path, rows.length])
  useEffect(() => () => {
    if (zoomTimer.current !== undefined) window.clearTimeout(zoomTimer.current)
  }, [])
  useEffect(() => {
    const target = table.current
    if (target === null) return
    const zoom = (event: WheelEvent): void => {
      if (!matchesDiffZoomModifier(event, zoomModifier) || event.deltaY === 0) return
      event.preventDefault()
      setFontSize((value) => {
        const next = Math.max(DIFF_FONT_MIN, Math.min(DIFF_FONT_MAX, value + (event.deltaY < 0 ? 1 : -1)))
        if (next === value) return value
        const ratio = (next + 8) / (value + 8)
        for (const pane of [oldPane.current, newPane.current]) {
          if (pane !== null) pane.scrollTop *= ratio
        }
        return next
      })
      setZoomVisible(true)
      if (zoomTimer.current !== undefined) window.clearTimeout(zoomTimer.current)
      zoomTimer.current = window.setTimeout(() => { setZoomVisible(false) }, 1200)
    }
    target.addEventListener('wheel', zoom, { passive: false })
    return () => { target.removeEventListener('wheel', zoom) }
  }, [zoomModifier])
  const findNext = (side: 'old' | 'new'): void => {
    const matches = searchMatches[side]
    if (matches.length === 0) {
      setSearchPositions(current => ({ ...current, [side]: -1 }))
      return
    }
    const position = (searchPositions[side] + 1) % matches.length
    const row = matches[position]
    if (row === undefined) return
    const top = row * lineHeight
    const pane = side === 'old' ? oldPane.current : newPane.current
    const other = side === 'old' ? newPane.current : oldPane.current
    if (pane !== null) pane.scrollTop = Math.max(0, top - Math.floor(pane.clientHeight / 3))
    if (synchronized && other !== null && pane !== null) other.scrollTop = pane.scrollTop
    const height = pane?.clientHeight || DIFF_VIEWPORT_FALLBACK
    const next = diffRenderWindow(Math.max(0, top - Math.floor(height / 3)), height, rows.length, lineHeight)
    setRenderWindows(current => synchronized ? { old: next, new: next } : { ...current, [side]: next })
    setSearchPositions(current => ({ ...current, [side]: position }))
  }
  const scroll = (side: 'old' | 'new', event: ReactUIEvent<HTMLDivElement>): void => {
    const next = diffRenderWindow(event.currentTarget.scrollTop, event.currentTarget.clientHeight, rows.length, lineHeight)
    setRenderWindows((current) => {
      const same = (value: DiffRenderWindow): boolean => value.start === next.start && value.end === next.end
      if (synchronized) return same(current.old) && same(current.new) ? current : { old: next, new: next }
      return same(current[side]) ? current : { ...current, [side]: next }
    })
    if (!synchronized || synchronizing.current) return
    const other = event.currentTarget === oldPane.current ? newPane.current : oldPane.current
    if (other === null) return
    synchronizing.current = true
    other.scrollTop = event.currentTarget.scrollTop
    window.requestAnimationFrame(() => { synchronizing.current = false })
  }
  if (rows.length === 0) return <p className={css.diffHint} data-git-diff-empty>{t('detail.noTextChanges')}</p>
  return (
    <>
      <div className={css.diffHeader}>
        {(['old', 'new'] as const).map(side => (
          <div className={css.diffHeaderSide} key={side}>
            <span data-git-diff-header={side}>{t(side === 'old' ? 'detail.source' : 'detail.modified')}</span>
            <form
              className={css.diffSearch}
              onSubmit={(event) => { event.preventDefault(); findNext(side) }}
            >
              <input
                value={searches[side]}
                aria-label={t(side === 'old' ? 'detail.search.source' : 'detail.search.modified')}
                placeholder={t('detail.search.placeholder')}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  setSearches(current => ({ ...current, [side]: value }))
                  setSearchPositions(current => ({ ...current, [side]: -1 }))
                }}
              />
              {searchMatches[side].length > 0 && (
                <output aria-live="polite">
                  {Math.max(0, searchPositions[side] + 1)}/{searchMatches[side].length}
                </output>
              )}
              {searches[side] !== '' && (
                <Tooltip label={t('detail.search.clear')} side="bottom">
                  <button
                    type="button"
                    className={css.diffSearchClear}
                    aria-label={t('detail.search.clear')}
                    onClick={() => {
                      setSearches(current => ({ ...current, [side]: '' }))
                      setSearchPositions(current => ({ ...current, [side]: -1 }))
                    }}
                  >
                    <IconCloseOutline16 size={13} />
                  </button>
                </Tooltip>
              )}
              <Tooltip label={t('detail.search.next')} side="bottom">
                <button type="submit" className={css.diffSearchSubmit} aria-label={t('detail.search.next')}>
                  <IconSearchOutline16 size={14} />
                </button>
              </Tooltip>
            </form>
          </div>
        ))}
      </div>
      <div
        ref={table}
        className={css.diffTable}
        data-git-first-change={firstChange}
        style={{ fontSize, lineHeight: `${lineHeight}px` }}
      >
        <DiffPane rows={rows} side="old" paneRef={oldPane} renderWindow={renderWindows.old} canvasColumns={canvasColumns} language={language} lineHeight={lineHeight} search={searches.old} activeRow={searchMatches.old[searchPositions.old]} onScroll={scroll} />
        <DiffPane rows={rows} side="new" paneRef={newPane} renderWindow={renderWindows.new} canvasColumns={canvasColumns} language={language} lineHeight={lineHeight} search={searches.new} activeRow={searchMatches.new[searchPositions.new]} onScroll={scroll} />
        <output className={clsx(css.zoomIndicator, zoomVisible && css.zoomIndicatorVisible)} data-git-diff-zoom aria-live="polite">
          {Math.round(fontSize / DIFF_FONT_DEFAULT * 100)}%
        </output>
      </div>
    </>
  )
})

/** Restore a fullscreen commit comparison to its dialog size. */
function ExitFullscreenGlyph(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 6h4V2M10 2v4h4M2 10h4v4M10 14v-4h4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Parallel vertical arrows used by the synchronized-scroll toggle. */
function SynchronizedScrollGlyph(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 13V3m0 0L2.5 5.5M5 3l2.5 2.5M11 3v10m0 0l-2.5-2.5M11 13l2.5-2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ComparisonTools({ comparison, synchronized, fullscreen, setSynchronized, setFullscreen, t }: {
  comparison: GitWorkspaceCommitDiffState | undefined
  synchronized: boolean
  fullscreen: boolean
  setSynchronized: (update: (value: boolean) => boolean) => void
  setFullscreen: (update: (value: boolean) => boolean) => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  return (
    <div className={css.detailTools}>
      {comparison?.binary === false && (
        <Tooltip label={synchronized ? t('detail.sync.disable') : t('detail.sync.enable')} side="bottom" delayMs={400}>
          <button
            type="button"
            className={css.iconTool}
            aria-label={synchronized ? t('detail.sync.disable') : t('detail.sync.enable')}
            aria-pressed={synchronized}
            data-git-diff-sync
            onClick={() => { setSynchronized(value => !value) }}
          >
            <SynchronizedScrollGlyph />
          </button>
        </Tooltip>
      )}
      <Tooltip label={fullscreen ? t('detail.fullscreen.exit') : t('detail.fullscreen.enter')} side="bottom" delayMs={400}>
        <button
          type="button"
          className={css.iconTool}
          aria-label={fullscreen ? t('detail.fullscreen.exit') : t('detail.fullscreen.enter')}
          aria-pressed={fullscreen}
          data-git-detail-fullscreen
          onClick={() => { setFullscreen(value => !value) }}
        >
          {fullscreen ? <ExitFullscreenGlyph /> : <IconFullscreenOutline16 />}
        </button>
      </Tooltip>
    </div>
  )
}

export interface CommitTreeNode {
  readonly name: string
  readonly path: string
  readonly children: readonly CommitTreeNode[]
  readonly file?: GitWorkspaceCommitFile
}

export type CommitFileIconKind =
  | 'java' | 'xml' | 'text' | 'python' | 'typescript' | 'javascript'
  | 'json' | 'markdown' | 'style' | 'html' | 'shell' | 'generic'

/** Map a changed file name to the compact language mark shown in the commit tree. */
export function commitFileIconKind(name: string): CommitFileIconKind {
  const extension = name.toLocaleLowerCase().split('.').at(-1) ?? ''
  switch (extension) {
    case 'java': return 'java'
    case 'xml': return 'xml'
    case 'txt': case 'log': return 'text'
    case 'py': case 'pyw': return 'python'
    case 'ts': case 'tsx': case 'mts': case 'cts': return 'typescript'
    case 'js': case 'jsx': case 'mjs': case 'cjs': return 'javascript'
    case 'json': case 'jsonc': return 'json'
    case 'md': case 'mdx': return 'markdown'
    case 'css': case 'scss': case 'sass': case 'less': return 'style'
    case 'html': case 'htm': case 'vue': case 'svelte': return 'html'
    case 'sh': case 'bash': case 'zsh': case 'ps1': case 'bat': case 'cmd': return 'shell'
    default: return 'generic'
  }
}

/** A system-sized document glyph with a format-specific language mark. */
function CommitFileIcon({ name }: { readonly name: string }): ReactNode {
  const kind = commitFileIconKind(name)
  return (
    <span className={clsx(css.fileTypeIcon, css[`fileType_${kind}`])} data-git-file-icon={kind} aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M3.5 1.75h5.25l3.75 3.75v8.75h-9z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
        <path d="M8.75 1.75V5.5h3.75" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
      </svg>
      <span className={css.fileTypeMark} />
    </span>
  )
}

/** Build a stable directory tree from the commit's Workspace-relative paths. */
export function buildCommitTree(files: readonly GitWorkspaceCommitFile[]): readonly CommitTreeNode[] {
  type MutableNode = { name: string; path: string; children: Map<string, MutableNode>; file?: GitWorkspaceCommitFile }
  const root = new Map<string, MutableNode>()
  for (const file of files) {
    let level = root
    let currentPath = ''
    const parts = file.path.split('/').filter(Boolean)
    parts.forEach((name, index) => {
      currentPath = currentPath === '' ? name : `${currentPath}/${name}`
      let node = level.get(name)
      if (node === undefined) {
        node = { name, path: currentPath, children: new Map() }
        level.set(name, node)
      }
      if (index === parts.length - 1) node.file = file
      level = node.children
    })
  }
  const freeze = (nodes: Map<string, MutableNode>): readonly CommitTreeNode[] => (
    [...nodes.values()].sort((left, right) => {
      const leftFile = left.file !== undefined
      const rightFile = right.file !== undefined
      if (leftFile !== rightFile) return leftFile ? 1 : -1
      if (left.name === right.name) return 0
      return left.name < right.name ? -1 : 1
    }).map(node => ({ ...node, children: freeze(node.children) }))
  )
  return freeze(root)
}

/** One expandable directory or selectable changed file in the commit tree. */
function CommitTreeRow({ node, depth, selectedPath, onOpen }: {
  node: CommitTreeNode
  depth: number
  selectedPath: string | undefined
  onOpen: (file: GitWorkspaceCommitFile) => void
}): ReactNode {
  const [expanded, setExpanded] = useState(true)
  const file = node.file
  if (file !== undefined) return (
    <li>
      <button
        type="button"
        className={clsx(css.treeRow, css.treeFile, selectedPath === file.path && css.detailFileSelected)}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        title={file.path}
        data-git-commit-file={file.path}
        onClick={() => { onOpen(file) }}
      >
        <CommitFileIcon name={node.name} />
        <span className={css.fileName}>{node.name}</span>
        <span className={css.fileStatus}>{file.status}</span>
      </button>
    </li>
  )
  return (
    <li>
      <button
        type="button"
        className={css.treeRow}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        title={node.path}
        aria-expanded={expanded}
        onClick={() => { setExpanded(value => !value) }}
      >
        <IconChevronRightOutline14 className={clsx(css.treeChevron, expanded && css.treeChevronExpanded)} />
        <span>{node.name}</span>
      </button>
      {expanded && (
        <ul className={css.treeLevel}>
          {node.children.map(child => (
            <CommitTreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onOpen={onOpen}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/** Shared commit-review modal used by history and pending-push rows. */
export function CommitDetailModal({
  commit, workspaceId, readCommitFiles, readCommitDiff, zoomModifier, onClose, t,
}: {
  commit: GitWorkspaceCommit | undefined
  workspaceId: WorkspaceId
  readCommitFiles: GitHistoryInjected['readCommitFiles']
  readCommitDiff: GitHistoryInjected['readCommitDiff']
  zoomModifier: DiffZoomModifier
  onClose: () => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const request = useRef<AbortController | undefined>(undefined)
  const layoutRef = useRef<HTMLDivElement>(null)
  const stopResizeRef = useRef<(() => void) | undefined>(undefined)
  const [files, setFiles] = useState<readonly GitWorkspaceCommitFile[] | undefined>(undefined)
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined)
  const [comparison, setComparison] = useState<GitWorkspaceCommitDiffState | undefined>(undefined)
  const [synchronized, setSynchronized] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  const [filePaneWidth, setFilePaneWidth] = useState(320)
  const fileTree = useMemo(() => files === undefined ? undefined : buildCommitTree(files), [files])
  useEffect(() => {
    request.current?.abort()
    if (commit === undefined) return
    const controller = new AbortController()
    request.current = controller
    setFiles(undefined)
    setSelectedPath(undefined)
    setComparison(undefined)
    setFullscreen(false)
    setFailure(undefined)
    void readCommitFiles(workspaceId, commit.hash.trim(), controller.signal).then((result) => {
      if (controller.signal.aborted) return
      if (result.ok) setFiles(result.value.files)
      else setFailure(failureLine(t, result.error))
    })
    return () => { controller.abort() }
  }, [commit, readCommitFiles, t, workspaceId])
  useEffect(() => () => {
    request.current?.abort()
    stopResizeRef.current?.()
  }, [])
  const openDiff = (file: GitWorkspaceCommitFile): void => {
    if (commit === undefined) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setSelectedPath(file.path)
    setComparison(undefined)
    setFailure(undefined)
    void readCommitDiff(workspaceId, commit.hash.trim(), file, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      if (result.ok) setComparison(result.value)
      else setFailure(failureLine(t, result.error))
    })
  }
  const close = (): void => {
    request.current?.abort()
    stopResizeRef.current?.()
    onClose()
  }
  const beginResize = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const layout = layoutRef.current
    if (layout === null) return
    event.preventDefault()
    stopResizeRef.current?.()
    const rect = layout.getBoundingClientRect()
    const previousUserSelect = document.body.style.userSelect
    const maximum = Math.max(180, rect.width - 320)
    let pendingWidth = filePaneWidth
    let frame: number | undefined
    document.body.style.userSelect = 'none'
    const apply = (): void => {
      frame = undefined
      layout.style.gridTemplateColumns = `${pendingWidth}px 6px minmax(0, 1fr)`
    }
    const move = (moveEvent: MouseEvent): void => {
      pendingWidth = Math.max(180, Math.min(maximum, moveEvent.clientX - rect.left))
      if (frame === undefined) frame = window.requestAnimationFrame(apply)
    }
    const stop = (): void => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', stop)
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      apply()
      setFilePaneWidth(pendingWidth)
      document.body.style.userSelect = previousUserSelect
      stopResizeRef.current = undefined
    }
    stopResizeRef.current = stop
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
  }
  return (
    <ComparisonDialog
      fullscreen={fullscreen}
      open={commit !== undefined}
      className={clsx(css.detailDialog, fullscreen && css.detailDialogFullscreen)}
      title={commit?.subject ?? t('detail.title')}
      closeLabel={t('detail.close')}
      onClose={close}
    >
      <div className={clsx(css.detailMeta, fullscreen && css.detailMetaFullscreen)}>
        {!fullscreen && <span data-git-detail-meta>{commit?.shortHash} · {commit?.authorName}</span>}
        <ComparisonTools
          comparison={comparison}
          synchronized={synchronized}
          fullscreen={fullscreen}
          setSynchronized={setSynchronized}
          setFullscreen={setFullscreen}
          t={t}
        />
      </div>
      <div
        ref={layoutRef}
        className={clsx(css.detailLayout, fullscreen && css.detailLayoutFullscreen)}
        style={{
          gridTemplateColumns: fullscreen
            ? 'minmax(0, 1fr)'
            : `${filePaneWidth}px 6px minmax(0, 1fr)`,
        }}
      >
        <aside className={css.fileList} aria-label={t('detail.files')} aria-hidden={fullscreen || undefined}>
          {files === undefined && failure === undefined && <p className={css.note}>{t('detail.loadingFiles')}</p>}
          {fileTree !== undefined && (
            <ul className={css.treeLevel}>
              {fileTree.map(node => (
                <CommitTreeRow
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedPath}
                  onOpen={openDiff}
                />
              ))}
            </ul>
          )}
        </aside>
        <div
          className={css.filePaneResize}
          role="separator"
          aria-label={t('detail.resize')}
          aria-orientation="vertical"
          aria-hidden={fullscreen || undefined}
          data-git-detail-resize
          onMouseDown={beginResize}
        />
        <section className={css.diff} aria-label={t('detail.diff')}>
          {selectedPath === undefined && failure === undefined && <p className={css.diffHint}>{t('detail.selectFile')}</p>}
          {selectedPath !== undefined && comparison === undefined && failure === undefined
            && <p className={css.diffHint}>{t('detail.loadingDiff')}</p>}
          {comparison?.binary === true && <p className={css.binaryNotice}>{t('detail.binary')}</p>}
          {comparison?.binary === false && (
            <FullDiff comparison={comparison} path={selectedPath ?? ''} synchronized={synchronized} zoomModifier={zoomModifier} t={t} />
          )}
          {failure !== undefined && <p className={css.error} role="alert">{failure}</p>}
        </section>
      </div>
    </ComparisonDialog>
  )
}

/** Working-tree comparison that reuses the commit review's diff renderer and controls. */
export function WorkingTreeDiffModal({ file, workspaceId, readWorkingDiff, zoomModifier, onClose, t }: {
  file: GitWorkspaceStatusFile | undefined
  workspaceId: WorkspaceId
  readWorkingDiff: ReadGitWorkingDiff
  zoomModifier: DiffZoomModifier
  onClose: () => void
  t: TranslateNS<'sidebarGitHistory'>
}): ReactNode {
  const request = useRef<AbortController | undefined>(undefined)
  const [comparison, setComparison] = useState<GitWorkspaceCommitDiffState | undefined>(undefined)
  const [synchronized, setSynchronized] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  useEffect(() => {
    request.current?.abort()
    if (file === undefined) return
    const controller = new AbortController()
    request.current = controller
    setComparison(undefined)
    setSynchronized(true)
    setFullscreen(false)
    setFailure(undefined)
    void readWorkingDiff(workspaceId, file, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      if (result.ok) setComparison(result.value)
      else setFailure(failureLine(t, result.error))
    })
    return () => { controller.abort() }
  }, [file, readWorkingDiff, t, workspaceId])
  const close = (): void => {
    request.current?.abort()
    onClose()
  }
  return (
    <ComparisonDialog
      fullscreen={fullscreen}
      open={file !== undefined}
      className={clsx(css.detailDialog, fullscreen && css.detailDialogFullscreen)}
      title={file?.path ?? t('detail.title')}
      closeLabel={t('detail.close')}
      onClose={close}
    >
      <div className={clsx(css.detailMeta, fullscreen && css.detailMetaFullscreen)}>
        {!fullscreen && <span data-git-working-detail-meta>{t('detail.workingTree')}</span>}
        <ComparisonTools
          comparison={comparison}
          synchronized={synchronized}
          fullscreen={fullscreen}
          setSynchronized={setSynchronized}
          setFullscreen={setFullscreen}
          t={t}
        />
      </div>
      <div className={clsx(css.detailLayout, css.workingDiffLayout, fullscreen && css.detailLayoutFullscreen)}>
        <section className={css.diff} aria-label={t('detail.diff')}>
          {comparison === undefined && failure === undefined && <p className={css.diffHint}>{t('detail.loadingDiff')}</p>}
          {comparison?.binary === true && <p className={css.binaryNotice}>{t('detail.binary')}</p>}
          {comparison?.binary === false && (
            <FullDiff comparison={comparison} path={file?.path ?? ''} synchronized={synchronized} zoomModifier={zoomModifier} t={t} />
          )}
          {failure !== undefined && <p className={css.error} role="alert">{failure}</p>}
        </section>
      </div>
    </ComparisonDialog>
  )
}

/** The commit history's body: the workspace's commits and the controls over them. */
export function GitHistoryBody({
  useTabInfo, sessionId, useSessions, useWorkspaces, useStore, start, reload, loadMore,
  readCommitFiles, readCommitDiff, useDiffZoomModifier, t,
}: GitHistoryBodyProps): ReactNode {
  const zoomModifier = useDiffZoomModifier(value => value)
  const { tab } = useTabInfo()
  const { signal } = tab
  const cwd = useSessions(sessions => sessions.byId[sessionId]?.cwd)
  const workspaceId = useWorkspaces((workspaces) => {
    const owned = workspaces.items.find(workspace => workspace.sessionIds.includes(sessionId))
    if (owned !== undefined) return owned.workspaceId
    return workspaces.items.find(workspace => workspace.path === cwd)?.workspaceId
  })
  const state = useStore(store => store.byTab[tab.id])
  const [query, setQuery] = useState('')
  const [selectedCommit, setSelectedCommit] = useState<GitWorkspaceCommit | undefined>(undefined)
  const [dateOpen, setDateOpen] = useState(false)
  const changesVisible = useGitChangesVisible(sessionId)
  useEffect(() => {
    // A bucket gone because the record aborted must not be re-seeded by a
    // component that has not unmounted yet.
    if (state !== undefined || workspaceId === undefined || signal.aborted) return
    start(tab.id, workspaceId, signal)
  }, [state, workspaceId, tab.id, signal, start])
  const historySearch = state?.search
  const historyAuthor = state?.author
  const historySince = state?.since
  const historyUntil = state?.until
  useEffect(() => {
    if (workspaceId === undefined || historySearch === undefined || historyAuthor === undefined
      || historySince === undefined || historyUntil === undefined) return
    return subscribeGitHistoryRefresh(sessionId, () => {
      if (!signal.aborted) {
        reload(tab.id, workspaceId, {
          search: historySearch, author: historyAuthor, since: historySince, until: historyUntil,
        }, signal)
      }
    })
  }, [historyAuthor, historySearch, historySince, historyUntil, reload, sessionId, signal, tab.id, workspaceId])

  if (workspaceId === undefined) {
    return (
      <div className={css.status} data-git-state="no-workspace">
        <p className={css.statusLine} data-git-row="no-workspace">{t('noWorkspace')}</p>
      </div>
    )
  }
  if (state === undefined) return null

  /** The filter one read carries: the window's applied bounds, plus what the reader just typed. */
  const filterOf = (overrides: Partial<GitHistoryFilter> = {}): GitHistoryFilter => ({
    search: query.trim(),
    author: state.author,
    since: state.since,
    until: state.until,
    ...overrides,
  })
  const submit = (event: FormEvent): void => {
    event.preventDefault()
    reload(tab.id, workspaceId, filterOf({ search: query.trim() }), signal)
  }
  /** Apply one author choice at once: a dropdown choice is the filter itself. */
  const chooseAuthor = (author: string): void => {
    if (author === state.author) return
    reload(tab.id, workspaceId, filterOf({ author }), signal)
  }
  /** Apply one date bound at once; a cleared field simply drops that bound. */
  const chooseDate = (bound: 'since' | 'until', value: string): void => {
    if (state[bound] === value) return
    const next = filterOf()
    reload(tab.id, workspaceId, bound === 'since' ? { ...next, since: value } : { ...next, until: value }, signal)
  }
  const clearDates = (): void => {
    setDateOpen(true)
    if (state.since === '' && state.until === '') return
    reload(tab.id, workspaceId, filterOf({ since: '', until: '' }), signal)
  }
  const dateFiltered = state.since !== '' || state.until !== ''
  const dateTitle = state.since !== '' && state.until !== ''
    ? t('search.date.range', { since: state.since, until: state.until })
    : state.since !== ''
      ? t('search.date.sinceRange', { since: state.since })
      : state.until !== ''
        ? t('search.date.untilRange', { until: state.until })
        : t('search.date.toggle')
  const title = state.branch === undefined ? t('header.detached') : t('header.branch', { branch: state.branch })
  const workspaceTitle = cwd === undefined ? '' : workspaceTitleOf(cwd)
  const failed = state.failure === undefined ? undefined : failureLine(t, state.failure)
  const openCommit = (commit: GitWorkspaceCommit): void => {
    setSelectedCommit(commit)
  }
  // A first read with nothing held yet replaces the list with its own line; a
  // load-more failure leaves the window on screen and answers below it.
  const pending = state.status === 'loading' && state.commits.length === 0
  const replacesList = state.status === 'failed' && state.commits.length === 0
  return (
    <div className={css.root} data-git-state="list" data-git-workspace={workspaceId}>
      <div className={css.chrome}>
        <div className={css.header}>
          <IconBranchOutline16 className={css.icon} />
          <span className={css.name} data-git-branch={state.branch ?? ''} title={workspaceTitle || undefined}>{title}</span>
          <button
            type="button"
            className={css.changesTool}
            aria-label={changesVisible ? t('changes.hide') : t('changes.show')}
            title={changesVisible ? t('changes.hide') : t('changes.show')}
            aria-pressed={changesVisible}
            data-git-changes-toggle
            onClick={() => { setGitChangesVisible(sessionId, !changesVisible) }}
          >
            {t('changes.trigger')}
          </button>
          <button
            type="button"
            className={css.tool}
            aria-label={t('reload')}
            title={t('reload')}
            data-git-reload
            onClick={() => {
              reload(tab.id, workspaceId, {
                search: state.search, author: state.author, since: state.since, until: state.until,
              }, signal)
            }}
          >
            <IconRefreshOutline16 />
          </button>
        </div>
        <form className={css.search} onSubmit={submit}>
          <select
            className={css.authorSelect}
            value={state.author}
            aria-label={t('search.author.label')}
            title={t('search.author.label')}
            data-git-author
            onChange={(event) => { chooseAuthor(event.currentTarget.value) }}
          >
            <option value="">{t('search.author.all')}</option>
            {state.authors.map(author => <option key={author} value={author}>{author}</option>)}
          </select>
          <button
            type="button"
            className={clsx(css.searchTool, dateFiltered && css.dateToolActive)}
            aria-label={dateTitle}
            title={dateTitle}
            aria-pressed={dateFiltered}
            data-git-date-toggle
            onClick={() => { setDateOpen(value => !value) }}
          >
            {t('search.date.toggle')}
          </button>
          <Input
            className={css.input}
            type="search"
            value={query}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            onChange={(event) => { setQuery(event.target.value) }}
          />
          <button type="submit" className={css.searchTool} data-git-search>{t('search.submit')}</button>
        </form>
        {(dateOpen || dateFiltered) && (
          <div className={css.dateRow} data-git-date-row>
            <HistoryDatePicker
              value={state.since}
              max={state.until === '' ? undefined : state.until}
              aria-label={t('search.date.since')}
              title={t('search.date.since')}
              data-git-since
              onChange={(value) => { chooseDate('since', value) }}
            />
            <span className={css.dateDash} aria-hidden="true">–</span>
            <HistoryDatePicker
              value={state.until}
              min={state.since === '' ? undefined : state.since}
              aria-label={t('search.date.until')}
              title={t('search.date.until')}
              data-git-until
              onChange={(value) => { chooseDate('until', value) }}
            />
            <button
              type="button"
              className={css.dateClear}
              aria-label={t('search.date.clear')}
              title={t('search.date.clear')}
              data-git-date-clear
              onClick={clearDates}
            >
              <IconCloseOutline16 size={13} />
            </button>
          </div>
        )}
      </div>
      <div className={css.body}>
        {pending && <p className={css.note} data-git-row="loading">{t('loading')}</p>}
        {replacesList && failed !== undefined && <p className={css.error} data-git-row="failed">{failed}</p>}
        {!pending && !replacesList && <HistoryList state={state} onOpen={openCommit} t={t} />}
        {!replacesList && failed !== undefined && state.commits.length > 0
          && <p className={css.error} data-git-row="failed">{failed}</p>}
        {!pending && state.more && (
          <button
            type="button"
            className={clsx(css.more, state.loadingMore && css.moreBusy)}
            data-git-more
            disabled={state.loadingMore}
            onClick={() => {
              loadMore(tab.id, workspaceId, {
                search: state.search, author: state.author, since: state.since, until: state.until,
              }, state.skip, signal)
            }}
          >
            {state.loadingMore ? t('loadingMore') : t('more')}
          </button>
        )}
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
    </div>
  )
}
