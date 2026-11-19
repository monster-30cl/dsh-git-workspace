import React, { useState } from 'react'
import { Menu } from '@deepseek-ai/dsh-client-ui-primitives'

type Props = { authors: readonly string[]; value: string; allLabel: string; label: string; onChange: (value: string) => void }
/** Theme-aware author filter using the host menu's selection and keyboard behavior. */
export function AuthorFilter({ authors, value, allLabel, label, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const title = value || allLabel
  return <span className="dsh-git-author-filter">
    <style>{`.dsh-git-author-filter{display:inline-flex;flex:0 1 auto;min-width:0;max-width:46%}.dsh-git-author-anchor{min-width:0;max-width:100%}.dsh-git-author-trigger{display:inline-flex;align-items:center;gap:7px;min-width:0;max-width:100%;height:32px;padding:0 11px;color:var(--dsw-alias-label-primary);font:inherit;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 64%,transparent);border:.5px solid color-mix(in srgb,var(--dsw-alias-border-l4) 72%,transparent);border-radius:16px;cursor:pointer}.dsh-git-author-trigger:hover,.dsh-git-author-trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}.dsh-git-author-trigger:focus-visible{outline:2px solid var(--dsw-alias-link);outline-offset:2px}.dsh-git-author-trigger span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsh-git-author-trigger svg{flex:none;color:var(--dsw-alias-label-secondary)}.dsh-git-author-menu{min-width:180px;max-width:min(320px,calc(100vw - 24px));max-height:min(320px,calc(100dvh - 80px));border-radius:12px;padding:5px}.dsh-git-author-trigger[aria-expanded=true] .dsh-git-author-chevron{transform:rotate(180deg)}.dsh-git-author-chevron{transition:transform .15s}`}</style>
    <Menu open={open} portal autoFocus align="start" className="dsh-git-author-anchor" listClassName="dsh-git-author-menu" selectedId={value}
      items={[{ id: '', label: allLabel }, ...(authors.length ? [{ type: 'separator' as const }] : []), ...authors.map(author => ({ id: author, label: author }))]}
      onSelect={author => { setOpen(false); onChange(author) }} onClose={() => { setOpen(false) }}
      anchor={<button type="button" className="dsh-git-author-trigger" data-git-author aria-label={`${label}: ${title}`} title={title} aria-haspopup="menu" aria-expanded={open} onClick={() => { setOpen(value => !value) }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><circle cx="8" cy="5" r="2.5"/><path d="M3 14v-1.5a5 5 0 0 1 10 0V14"/></svg>
        <span>{title}</span>
        <svg className="dsh-git-author-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </button>}/>
  </span>
}
