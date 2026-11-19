import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import stylesheet from './HistoryDatePicker.css'

type Props = { value: string; min?: string; max?: string; onChange: (value: string) => void; 'aria-label': string; title?: string; [key: `data-${string}`]: unknown }
export function HistoryDatePicker({ value, min, max, onChange, ...props }: Props) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => (value || localDay(new Date())).slice(0, 7))
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const calendar = useRef<HTMLDivElement>(null)
  const locale = typeof document === 'undefined' ? 'zh-CN' : document.documentElement.lang || navigator.language
  const chinese = locale.toLowerCase().startsWith('zh')
  const text = chinese ? ['上一月', '下一月', '清除', '今天', '选择日期'] : ['Previous month', 'Next month', 'Clear', 'Today', 'Choose date']
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  // Native popovers enter the browser top layer, escaping ancestor clipping
  // and stacking contexts while preserving the plugin's inherited theme.
  useLayoutEffect(() => {
    if (!open || !calendar.current || !trigger.current) return
    const popup = calendar.current
    popup.showPopover()
    const position = () => {
      const anchor = trigger.current?.getBoundingClientRect()
      if (!anchor) return
      const gap = 6
      const margin = 8
      const width = popup.offsetWidth
      const height = popup.offsetHeight
      const below = window.innerHeight - anchor.bottom - gap - margin
      const top = below >= height || below >= anchor.top - gap - margin
        ? anchor.bottom + gap : anchor.top - height - gap
      popup.style.left = Math.max(margin, Math.min(anchor.left, window.innerWidth - width - margin)) + 'px'
      popup.style.top = Math.max(margin, Math.min(top, window.innerHeight - height - margin)) + 'px'
    }
    position()
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    const observer = new ResizeObserver(position)
    observer.observe(popup)
    observer.observe(trigger.current)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
      popup.hidePopover()
    }
  }, [open])
  const first = new Date(`${month}-01T12:00:00`)
  const start = new Date(first)
  start.setDate(1 - (first.getDay() + 6) % 7)
  const today = localDay(new Date())
  const allowed = (day: string) => (!min || day >= min) && (!max || day <= max)
  const choose = (day: string) => { onChange(day); setOpen(false); trigger.current?.focus() }
  const shift = (amount: number) => { const next = new Date(first); next.setMonth(next.getMonth() + amount); setMonth(localDay(next).slice(0, 7)) }
  return <div className="dsh-history-date" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false) }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus() } }}>
    <style>{stylesheet}</style>
    <button {...props} ref={trigger} type="button" className="dsh-history-date-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (!open) setMonth((value || today).slice(0, 7)); setOpen(!open) }}>
      <span>{value || (chinese ? '年 / 月 / 日' : 'yyyy / mm / dd')}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M5 2v3m6-3v3M3 7h10"/></svg>
    </button>
    {open && <div ref={calendar} popover="manual" className="dsh-history-calendar" role="dialog" aria-label={props['aria-label']}>
      <div className="dsh-history-calendar-heading"><button type="button" aria-label={text[0]} onClick={() => shift(-1)}>‹</button><span aria-live="polite">{first.toLocaleDateString(locale, { year: 'numeric', month: 'long' })}</span><button type="button" aria-label={text[1]} onClick={() => shift(1)}>›</button></div>
      <div className="dsh-history-calendar-grid">
        {Array.from({ length: 7 }, (_, i) => <span className="dsh-history-weekday" key={i}>{new Date(2024, 0, i + 1).toLocaleDateString(locale, { weekday: 'narrow' })}</span>)}
        {Array.from({ length: 42 }, (_, i) => { const date = new Date(start); date.setDate(start.getDate() + i); const day = localDay(date); return <button type="button" key={day} disabled={!allowed(day)} aria-label={day} aria-pressed={value === day} aria-current={day === today ? 'date' : undefined} data-outside={day.slice(0, 7) !== month} onClick={() => choose(day)}>{date.getDate()}</button> })}
      </div>
      <div className="dsh-history-calendar-footer"><button type="button" onClick={() => choose('')}>{text[2]}</button><button type="button" disabled={!allowed(today)} onClick={() => choose(today)}>{text[3]}</button></div>
    </div>}
  </div>
}
function localDay(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
