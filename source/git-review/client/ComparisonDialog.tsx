import React, { type ReactElement, type ReactNode } from 'react'
import { Modal, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

type Props = { open: boolean; fullscreen: boolean; className: string; title: string; closeLabel: string; onClose: () => void; children: ReactNode }
/** One header owns comparison controls in both dialog and expanded modes. */
export function ComparisonDialog({ open, fullscreen, className, title, closeLabel, onClose, children }: Props) {
  const [meta, ...content] = React.Children.toArray(children) as ReactElement<{ children?: ReactNode }>[]
  const metaChildren = React.Children.toArray(meta?.props.children)
  const tools = metaChildren.pop()
  return <Modal open={open} headless title={title} onClose={onClose} className={`${className} dsh-comparison-shell${fullscreen ? ' dsh-comparison-expanded' : ''}`}>
    <style>{`.dsh-comparison-shell{position:relative;gap:0;max-height:100%;max-width:100%;padding-bottom:0;display:flex;flex-direction:column;overflow:hidden}.dsh-comparison-shell.dsh-comparison-expanded{position:relative;inset:auto;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px}.dsh-comparison-heading{display:flex;flex:none;align-items:center;gap:8px;padding:14px 8px 12px 24px;min-height:56px;box-sizing:border-box}.dsh-comparison-heading h2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px;font-weight:500}.dsh-comparison-close{display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:6px;color:var(--dsw-alias-label-secondary);background:transparent;cursor:pointer}.dsh-comparison-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dsh-comparison-close:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:1px}.dsh-comparison-meta{flex:none;padding:0 24px 10px;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:12px}.dsh-comparison-content{display:flex;flex:1;min-height:0;overflow:hidden;padding:0 12px 12px 24px}.dsh-comparison-content>div{flex:1;min-width:0;min-height:0;height:auto;margin-top:0}`}</style>
    <div className="dsh-comparison-heading">
      <h2 title={title}>{title}</h2>
      {tools}
      <Tooltip label={closeLabel} side="bottom" portal><button type="button" className="dsh-comparison-close" aria-label={closeLabel} onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" /></svg></button></Tooltip>
    </div>
    {!fullscreen && <div className="dsh-comparison-meta">{metaChildren}</div>}
    <div className="dsh-comparison-content">{content}</div>
  </Modal>
}
