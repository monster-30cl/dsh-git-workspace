import React, { type ReactNode } from 'react'
import { Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { CommitMessageGenerator } from './CommitMessageGenerator'

type Props = { open: boolean; className?: string; onClose: () => void; title: string; closeLabel: string; footer: ReactNode; children: ReactNode; ai?: { workspaceId: string; paths: readonly string[]; message: string; generate: (workspaceId: string, signal: AbortSignal, paths: readonly string[]) => Promise<string>; onMessage: (message: string) => void; onError: (message: string | undefined) => void } }
/** Keep Modal's focus, dismissal and accessible name while adding a title action. */
export function CommitMessageDialog({ open, className, onClose, title, closeLabel, footer, children, ai }: Props) {
  return <Modal open={open} headless className={className} onClose={onClose} title={title}>
    <style>{`.dsh-commit-dialog-header{display:flex;align-items:center;gap:8px;padding:22px 14px 12px 24px}.dsh-commit-dialog-header h2{margin:0;color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px;font-weight:500}.dsh-commit-title-tool{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;color:var(--dsw-alias-label-secondary);background:transparent;border:0;border-radius:6px;cursor:pointer}.dsh-commit-title-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dsh-commit-title-tool:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:2px}.dsh-commit-title-tool:disabled{cursor:default;opacity:.55}.dsh-commit-ai-spinner{animation:dsh-commit-ai-spin 1s linear infinite}@keyframes dsh-commit-ai-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.dsh-commit-ai-spinner{animation:none}}`}</style>
    <div className="dsh-commit-dialog-header">
      <h2>{title}</h2>
      {ai && <CommitMessageGenerator {...ai} className="dsh-commit-title-tool" />}
      <button type="button" className="dsh-commit-title-tool" style={{ marginLeft: 'auto' }} aria-label={closeLabel} onClick={onClose}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" /></svg></button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 20, padding: '0 24px' }}>{children}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 24px' }}>{footer}</div>
  </Modal>
}
