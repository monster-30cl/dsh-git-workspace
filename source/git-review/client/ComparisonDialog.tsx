import React, { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Modal, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

type Props = { open: boolean; fullscreen: boolean; className: string; title: string; fullText?: string; copyDisabled?: boolean; closeLabel: string; onClose: () => void; children: ReactNode }
/** One header owns comparison controls in both dialog and expanded modes. */
export function ComparisonDialog({ open, fullscreen, className, title, fullText, copyDisabled, closeLabel, onClose, children }: Props) {
  const [copyState, setCopyState] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => { setCopyState(''); return () => { clearTimeout(timer.current) } }, [title, fullText, open])
  const completeText = fullText ?? title
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(completeText)
      setCopyState('已复制完整备注')
    } catch { setCopyState('复制失败，请点击标题后手动复制') }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setCopyState('') }, 2000)
  }
  const [meta, ...content] = React.Children.toArray(children) as ReactElement<{ children?: ReactNode }>[]
  const metaChildren = React.Children.toArray(meta?.props.children)
  const tools = metaChildren.pop()
  return <Modal open={open} headless title={title} onClose={onClose} className={`${className} dsh-comparison-shell${fullscreen ? ' dsh-comparison-expanded' : ''}`}>
    <style>{`.dsh-comparison-shell{position:relative;gap:0;max-height:100%;max-width:100%;padding-bottom:0;display:flex;flex-direction:column;overflow:hidden}.dsh-comparison-shell.dsh-comparison-expanded{position:relative;inset:auto;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px}.dsh-comparison-heading{display:flex;flex:none;align-items:center;gap:8px;padding:14px 8px 12px 24px;min-height:56px;box-sizing:border-box}.dsh-comparison-heading h2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px;font-weight:500}.dsh-comparison-title{cursor:help}.dsh-comparison-title:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:3px;border-radius:4px}.dsh-comparison-close{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:6px;color:var(--dsw-alias-label-secondary);background:transparent;cursor:pointer}.dsh-comparison-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dsh-comparison-close:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:1px}.dsh-comparison-meta{flex:none;padding:0 24px 10px;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px}.dsh-comparison-content{display:flex;flex:1;min-height:0;overflow:hidden;padding:0 12px 12px 24px}.dsh-comparison-content>div{flex:1;min-width:0;min-height:0;height:auto;margin-top:0}`}</style>
    <div className="dsh-comparison-heading">
      <Tooltip label={completeText} side="bottom" portal delayMs={250} focusDelayMs={150} openOnClick><h2 className="dsh-comparison-title" tabIndex={0}>{title}</h2></Tooltip>
      <Tooltip label={copyState || '复制完整备注'} side="bottom" portal><button type="button" className="dsh-comparison-close" disabled={copyDisabled} aria-label={copyState || '复制完整备注'} data-git-copy-message onClick={() => { void copyText() }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-2A1 1 0 0 0 9.5 2.5h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg></button></Tooltip>
      <span role="status" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>{copyState}</span>
      {tools}
      <Tooltip label={closeLabel} side="bottom" portal><button type="button" className="dsh-comparison-close" aria-label={closeLabel} onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" /></svg></button></Tooltip>
    </div>
    {!fullscreen && <div className="dsh-comparison-meta">{metaChildren}</div>}
    <div className="dsh-comparison-content">{content}</div>
  </Modal>
}
