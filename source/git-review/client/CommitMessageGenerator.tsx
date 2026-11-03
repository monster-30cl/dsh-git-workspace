import React, { useEffect, useRef, useState } from 'react'

type Props = { workspaceId: string; paths: readonly string[]; message: string; generate: (workspaceId: string, signal: AbortSignal, paths: readonly string[]) => Promise<string>; onMessage: (message: string) => void; className?: string }
export function CommitMessageGenerator({ workspaceId, paths, message, generate, onMessage, className }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | undefined>(undefined)
  const selection = JSON.stringify(paths)
  useEffect(() => {
    request.current?.abort()
    request.current = undefined
    setBusy(false)
    setError('')
    return () => { request.current?.abort() }
  }, [workspaceId, selection, message])
  const run = async () => {
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError('')
    try {
      const generated = await generate(workspaceId, controller.signal, paths)
      if (!controller.signal.aborted) onMessage(generated)
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : '生成失败，请重试。')
    } finally {
      if (request.current === controller) { request.current = undefined; setBusy(false) }
    }
  }
  return <div data-git-ai-message style={{ marginTop: 10 }}>
    <button type="button" className={className} disabled={busy || paths.length === 0} aria-busy={busy} onClick={() => { void run() }}>{busy ? 'AI 生成中…' : 'AI 生成提交备注'}</button>
    {busy && <span role="status" style={{ marginLeft: 8, color: 'var(--dsw-alias-label-secondary)', fontSize: 12 }}>正在分析勾选文件的改动…</span>}
    {error && <p role="alert" style={{ color: 'var(--dsw-alias-state-error-primary)', margin: '8px 0' }}>{error}</p>}
  </div>
}
