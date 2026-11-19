import React, { useEffect, useRef, useState } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

type Props = { workspaceId: string; paths: readonly string[]; message: string; generate: (workspaceId: string, signal: AbortSignal, paths: readonly string[]) => Promise<string>; onMessage: (message: string) => void; className?: string; onError: (message: string | undefined) => void }
export function CommitMessageGenerator({ workspaceId, paths, message, generate, onMessage, className, onError }: Props) {
  const [busy, setBusy] = useState(false)
  const request = useRef<AbortController | undefined>(undefined)
  const selection = JSON.stringify(paths)
  useEffect(() => {
    request.current?.abort()
    request.current = undefined
    setBusy(false)
    onError(undefined)
    return () => { request.current?.abort() }
  }, [workspaceId, selection, message])
  const run = async () => {
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    onError(undefined)
    try {
      const generated = await generate(workspaceId, controller.signal, paths)
      if (!controller.signal.aborted) onMessage(generated)
    } catch (failure) {
      if (!controller.signal.aborted) onError(failure instanceof Error ? failure.message : '生成失败，请重试。')
    } finally {
      if (request.current === controller) { request.current = undefined; setBusy(false) }
    }
  }
  const label = busy ? 'AI 生成中…' : 'AI 生成提交备注'
  return <Tooltip label={label} side="bottom" portal>
    <span data-git-ai-message style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button type="button" className={className} disabled={busy || paths.length === 0} aria-label={label} aria-busy={busy} onClick={() => { void run() }}>
        {busy ? <svg className="dsh-commit-ai-spinner" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10" cy="10" r="7" opacity=".25" /><path d="M10 3a7 7 0 0 1 7 7" /></svg>
          : <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="m8 3 1.8 4.8L15 10l-5.2 2.2L8 17l-1.8-4.8L1 10l5.2-2.2L8 3Z" /><path d="m16 1 .8 2.2L19 4l-2.2.8L16 7l-.8-2.2L13 4l2.2-.8L16 1Z" /></svg>}
      </button>
      {busy && <span role="status" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>正在分析勾选文件的改动…</span>}
    </span>
  </Tooltip>
}
