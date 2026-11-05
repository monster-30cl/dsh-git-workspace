/**
 * Git branch surfaces for the official dsh Web client.
 *
 * Mounts the Git Workspace Typert Remote contribution itself, then contributes
 * two placements instead of an overlay: a Session-header branch chip whose
 * menu switches branches, and the `gitBranches` right-Sidebar page that shows
 * the full list. Nothing here is positioned over the conversation.
 */

import React from 'react'
import {
  Button,
  IconBranchOutlineRegular,
  IconChevronDownOutlineRegular,
  Menu,
} from '@deepseek-ai/dsh-client-ui-primitives'
import GIT_REMOTE from '../../../controller/lib/typert.remote-client.js'

export const inject = ['slots', 'remote', 'sidebarRightTabs', 'sidebarRight', 'uiSession', 'layout', 'shortcuts', 'locale']

/** This implementation's identity in the tab system: the key its body registers under. */
const BRANCHES_ID = '@local/dsh-git-branch-panel/branches'
/** The tab kind this plugin owns. */
const BRANCHES_KIND = 'gitBranches'

const h = React.createElement

function describeError(result) {
  if (result && result.ok === false) {
    const error = result.error
    return error && (error.message || error.code) ? String(error.message ?? error.code) : 'Git request failed'
  }
  return 'Git request failed'
}

/**
 * Read and mutate one workspace's branches, keeping the last answer in local state.
 * @param git - injected Git Workspace operations.
 * @param workspaceId - the workspace to read, or undefined before any is known.
 * @returns the last list, the pending error, the busy flag, and the readers.
 */
function useBranches(git, workspaceId) {
  const [rows, setRows] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

  const apply = React.useCallback((result) => {
    if (result.ok) {
      setRows(result.value)
      setError(null)
    } else {
      setError(describeError(result))
    }
    setBusy(false)
  }, [])

  const refresh = React.useCallback(async () => {
    if (workspaceId === undefined) {
      setRows(null)
      setError(null)
      setBusy(false)
      return
    }
    setBusy(true)
    try {
      apply(await git.list(workspaceId))
    } catch (failure) {
      setError(String((failure && failure.stack) || failure))
      setBusy(false)
    }
  }, [apply, git, workspaceId])

  const run = React.useCallback(async (action) => {
    setBusy(true)
    try {
      apply(await action())
    } catch (failure) {
      setError(String((failure && failure.stack) || failure))
      setBusy(false)
    }
  }, [apply])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  return { rows, error, busy, refresh, run }
}

/**
 * Resolve the workspace a Session is bound to, falling back to the first one.
 * @param workspaces - every registered workspace item.
 * @param sessionId - the Session drawing the entry.
 * @returns that workspace id, or undefined when none is registered.
 */
function boundWorkspaceId(workspaces, sessionId) {
  const bound = workspaces.find((workspace) => workspace.sessionIds?.includes(sessionId) === true)
  return (bound ?? workspaces[0])?.workspaceId
}

/** Shared confirm before any branch mutation on the shared checkout. */
function confirmed(message) {
  return window.confirm(message)
}

/**
 * One Session-header chip: the current branch in a menu of switchable branches.
 * @param props - framework props plus the injected Git operations and panel opener.
 * @returns the chip, or null for a workspace that is not a Git worktree.
 */
function BranchChip({ sessionId, useWorkspaces, git, openPanel }) {
  const workspaces = useWorkspaces((state) => state.items) || []
  const workspaceId = boundWorkspaceId(workspaces, sessionId)
  const { rows, error, busy, run } = useBranches(git, workspaceId)
  const [open, setOpen] = React.useState(false)

  if (rows === null || rows.repository !== true) {
    return error === null ? null : h('span', { style: { fontSize: 12, opacity: 0.7 } }, error)
  }

  const current = rows.current
  const switchTo = (branch) => {
    if (!confirmed(`切换共享工作区到分支 ${branch}？`)) return
    void run(() => git.checkout(workspaceId, branch))
  }
  const switchRemote = (branch) => {
    if (!confirmed(`创建并切换到远程分支 ${branch}？`)) return
    void run(() => git.checkoutRemote(workspaceId, branch))
  }

  const items = [{ type: 'label', id: 'local-label', text: '本地分支' }]
  for (const branch of rows.localBranches) {
    items.push({ id: `local:${branch}`, label: branch, disabled: branch === current })
  }
  if (rows.remoteBranches.length > 0) {
    items.push({ type: 'separator', id: 'remote-separator' })
    items.push({ type: 'label', id: 'remote-label', text: '远程分支' })
    for (const branch of rows.remoteBranches) {
      items.push({ id: `remote:${branch}`, label: branch })
    }
  }

  const onSelect = (id) => {
    setOpen(false)
    if (id === 'open-panel') {
      openPanel()
      return
    }
    const separator = id.indexOf(':')
    const kind = id.slice(0, separator)
    const branch = id.slice(separator + 1)
    if (kind === 'local') switchTo(branch)
    if (kind === 'remote') switchRemote(branch)
  }

  return h(Menu, {
    open,
    onClose: () => setOpen(false),
    onSelect,
    items,
    footer: [{ id: 'open-panel', label: '在右侧栏打开分支面板' }],
    selectedId: current === null ? undefined : `local:${current}`,
    align: 'end',
    side: 'bottom',
    portal: true,
    dense: true,
    anchor: h(
      Button,
      {
        size: 'sm',
        variant: 'ghost',
        icon: h(IconBranchOutlineRegular, { size: 16 }),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        disabled: busy,
        onClick: () => setOpen((value) => !value),
        title: error === null ? '切换 Git 分支' : error,
      },
      h(
        'span',
        { style: { maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
        current === null ? 'Detached HEAD' : current,
      ),
      h(IconChevronDownOutlineRegular, { size: 14 }),
    ),
  })
}

/**
 * The right-Sidebar `gitBranches` page: workspace choice, both branch lists, and
 * one creation field. Renders in the pane's own column, never over the chat.
 * @param props - framework props plus the injected Git operations.
 * @returns the page body.
 */
function BranchesPage({ sessionId, useWorkspaces, git }) {
  const workspaces = useWorkspaces((state) => state.items) || []
  const [workspaceId, setWorkspaceId] = React.useState(undefined)
  const selected = workspaceId ?? boundWorkspaceId(workspaces, sessionId)
  const { rows, error, busy, refresh, run } = useBranches(git, selected)
  const [draft, setDraft] = React.useState('')
  const [syncing, setSyncing] = React.useState(false)

  const syncRemote = async () => {
    if (busy || syncing || selected === undefined) return
    setSyncing(true)
    try { await run(() => git.fetchBranches(selected)) }
    finally { setSyncing(false) }
  }

  const current = rows?.repository === true ? rows.current : null
  const switchTo = (branch) => {
    if (!confirmed(`切换共享工作区到分支 ${branch}？`)) return
    void run(() => git.checkout(selected, branch))
  }
  const switchRemote = (branch) => {
    if (!confirmed(`创建并切换到远程分支 ${branch}？`)) return
    void run(() => git.checkoutRemote(selected, branch))
  }
  const create = () => {
    const branch = draft.trim()
    if (branch === '') return
    if (!confirmed(`创建并切换到新分支 ${branch}？`)) return
    void run(async () => {
      const result = await git.create(selected, branch)
      if (result.ok) setDraft('')
      return result
    })
  }

  const branchRow = (branch, isCurrent, onPick) => h(
    'button',
    {
      key: branch,
      type: 'button',
      disabled: busy || isCurrent,
      onClick: onPick,
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '5px 8px',
        marginBottom: 2,
        border: 'none',
        borderRadius: 'var(--dsw-radius-sm, 6px)',
        font: 'inherit',
        color: 'inherit',
        background: isCurrent ? 'var(--dsw-alias-interactive-bg-hover)' : 'transparent',
        cursor: isCurrent ? 'default' : 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
    branch,
  )

  const sectionTitle = (text) => h('div', { style: { opacity: 0.6, margin: '10px 0 4px' } }, text)
  const fieldStyle = {
    flex: 1,
    minWidth: 0,
    font: 'inherit',
    color: 'inherit',
    background: 'transparent',
    border: '0.5px solid var(--dsw-alias-border-l3, rgba(255,255,255,0.15))',
    borderRadius: 'var(--dsw-radius-sm, 6px)',
    padding: '4px 6px',
  }

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', minHeight: 0, padding: '12px 14px', fontSize: 13, color: 'inherit' } },
    h(
      'div',
      { style: { display: 'flex', gap: 8, alignItems: 'center' } },
      h(
        'select',
        {
          value: selected ?? '',
          disabled: busy || syncing,
          onChange: (event) => setWorkspaceId(event.target.value),
          style: fieldStyle,
        },
        workspaces.length === 0 && h('option', { key: 'none', value: '' }, '没有工作区'),
        workspaces.map((workspace) => h(
          'option',
          { key: workspace.workspaceId, value: workspace.workspaceId },
          workspace.title || workspace.path || workspace.workspaceId,
        )),
      ),
      h(Button, { size: 'sm', variant: 'outline', disabled: busy || selected === undefined, onClick: () => void refresh() }, '刷新'),
      h(Button, { size: 'sm', variant: 'outline', disabled: busy || syncing || selected === undefined, title: '同步远端分支并清理已删除的远端记录，不合并代码', 'aria-busy': syncing, 'data-git-fetch-branches': true, onClick: () => void syncRemote() }, syncing ? '同步中…' : '同步远端'),
    ),
    error !== null && h('div', { style: { marginTop: 10, opacity: 0.85 } }, error),
    rows === null && error === null && h('div', { style: { marginTop: 10, opacity: 0.7 } }, '加载中…'),
    rows !== null && rows.repository !== true && h('div', { style: { marginTop: 10, opacity: 0.7 } }, '当前工作区不是 Git 仓库'),
    rows?.repository === true && h(
      'div',
      { style: { minHeight: 0, overflow: 'auto' } },
      sectionTitle(current === null ? '分离 HEAD' : `当前分支：${current}`),
      sectionTitle('本地分支'),
      rows.localBranches.map((branch) => branchRow(branch, branch === current, () => switchTo(branch))),
      rows.remoteBranches.length > 0 && sectionTitle('远程分支'),
      rows.remoteBranches.map((branch) => branchRow(branch, false, () => switchRemote(branch))),
      h(
        'div',
        { style: { display: 'flex', gap: 6, marginTop: 12 } },
        h('input', {
          value: draft,
          placeholder: '新分支名',
          onChange: (event) => setDraft(event.target.value),
          onKeyDown: (event) => { if (event.key === 'Enter') create() },
          style: fieldStyle,
        }),
        h(Button, { size: 'sm', variant: 'primary', disabled: busy || draft.trim() === '', onClick: create }, '创建'),
      ),
    ),
  )
}

/**
 * Mount the Git Remote contribution, then register the Sidebar page type, its
 * body, and the header chip.
 * @param ctx - the client plugin context.
 */
export function apply(ctx) {
  const shortcutText = ctx.locale.bind('gitWorkspace.shortcuts')
  ctx.effect(() => ctx.locale.register('gitWorkspace.shortcuts', { zh: {"review":"打开 Git 代码审查","branches":"打开 Git 分支列表","noSession":"请先选择一个对话"}, en: {"review":"Open Git review","branches":"Open Git branches","noSession":"Select a conversation first"} }), 'gitWorkspace.shortcuts: dictionaries')
  ctx.effect(() => ctx.shortcuts.register({
    id: 'git.workspace.review.open', label: () => shortcutText('review'),
    aliases: ["Git","代码审查","git review"], defaults: {},
    regions: ['page', 'editable', 'terminal'], modals: [],
    resolve: () => {
      const sessionId = ctx.uiSession.adapter.current.getSnapshot().key
      if (sessionId === undefined) return { status: 'blocked', reason: shortcutText('noSession') }
      return { status: 'handled', run: () => {
        ctx.layout.selectPanel(null)
        let attempts = 0
        const open = () => {
          if (ctx.uiSession.adapter.current.getSnapshot().key !== sessionId) return
          if (ctx.sidebarRight.mounted.getSnapshot() === sessionId) {
            try { ctx.sidebarRight.openTab('gitHistory'); return }
            catch (error) { if (!(error instanceof Error) || !error.message.includes('no session surface is mounted')) throw error }
          }
          if (++attempts < 120) requestAnimationFrame(open)
        }
        requestAnimationFrame(open)
      } }
    },
  }), 'git.workspace.review.open: shortcut')
  ctx.effect(() => ctx.shortcuts.register({
    id: 'git.workspace.branches.open', label: () => shortcutText('branches'),
    aliases: ["Git","分支列表","git branches"], defaults: {},
    regions: ['page', 'editable', 'terminal'], modals: [],
    resolve: () => {
      const sessionId = ctx.uiSession.adapter.current.getSnapshot().key
      if (sessionId === undefined) return { status: 'blocked', reason: shortcutText('noSession') }
      return { status: 'handled', run: () => {
        ctx.layout.selectPanel(null)
        let attempts = 0
        const open = () => {
          if (ctx.uiSession.adapter.current.getSnapshot().key !== sessionId) return
          if (ctx.sidebarRight.mounted.getSnapshot() === sessionId) {
            try { ctx.sidebarRight.openTab('gitBranches'); return }
            catch (error) { if (!(error instanceof Error) || !error.message.includes('no session surface is mounted')) throw error }
          }
          if (++attempts < 120) requestAnimationFrame(open)
        }
        requestAnimationFrame(open)
      } }
    },
  }), 'git.workspace.branches.open: shortcut')

  ctx.inject(GitReview.inject, (reviewCtx) => { reviewCtx.plugin(GitReview) })
  ctx.effect(() => {
    let closed = false
    let unmount
    void ctx.remote.$mount(GIT_REMOTE).then(dispose => {
      if (closed) { dispose(); return }
      unmount = dispose
    }).catch(error => { ctx.logger.warn(error) })
    return () => { closed = true; unmount?.() }
  }, 'git-panel: remote lifetime')

  const namespace = () => {
    const remote = ctx.get('remote.gitWorkspace')
    if (remote === undefined) throw new Error('Git Remote is not mounted yet')
    return remote
  }
  const git = {
    list: (workspaceId) => namespace().list({ workspaceId }),
    fetchBranches: (workspaceId) => namespace().fetchBranches({ workspaceId }),
    checkout: (workspaceId, branch) => namespace().checkout({ workspaceId, branch }),
    checkoutRemote: (workspaceId, branch) => namespace().checkoutRemote({ workspaceId, branch }),
    create: (workspaceId, branch) => namespace().create({ workspaceId, branch }),
  }

  ctx.effect(() => ctx.sidebarRightTabs.register({
    id: BRANCHES_ID,
    kind: BRANCHES_KIND,
    priority: 'builtin',
    title: () => 'Git 分支',
  }), 'git-panel: branches tab type')

  ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: BRANCHES_ID, inject: () => ({ git }) },
    BranchesPage,
  ))

  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(
    {
      name: 'conversation.session.header.utilities',
      id: 'git-branch-chip',
      order: 20,
      inject: () => ({ git, openPanel: () => ctx.sidebarRight.openTab(BRANCHES_KIND) }),
    },
    BranchChip,
  ))
}
