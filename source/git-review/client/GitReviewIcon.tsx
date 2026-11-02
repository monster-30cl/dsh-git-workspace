/**
 * The Review page's guide mark.
 *
 * It draws the same tile artwork the installed-plugin row shows — the bundle's
 * `icon.svg` — so the Start page card and the plugin list read as one plugin.
 */
import type { ReactNode } from 'react'

/**
 * Render the tile: an indigo rounded square carrying a white branch glyph.
 * @returns the 20px mark the guide's 26px icon box centres.
 */
export function GitReviewIcon(): ReactNode {
  return (
    <svg viewBox="0 0 64 64" width={20} height={20} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#4C5BD4" />
      <g fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round">
        <path d="M22 22.5v19" />
        <path d="M22 32c0-5.5 4.5-6 9-6h5.5" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="22" cy="17" r="5.5" />
        <circle cx="22" cy="47" r="5.5" />
        <circle cx="42" cy="26" r="5.5" />
      </g>
    </svg>
  )
}
