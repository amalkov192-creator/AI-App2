import type { NewsCategory } from '../types'

const styles: Record<NewsCategory, { bg: string; color: string }> = {
  AI:     { bg: 'rgba(124,106,247,0.15)', color: 'var(--accent2)' },
  Crypto: { bg: 'rgba(255,181,71,0.12)',  color: 'var(--amber)' },
  Tech:   { bg: 'rgba(61,220,132,0.1)',   color: 'var(--green)' },
  Other:  { bg: 'rgba(136,136,160,0.12)', color: 'var(--text2)' },
}

export function CategoryBadge({ cat }: { cat: NewsCategory }) {
  const s = styles[cat]
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        background: s.bg,
        color: s.color,
      }}
    >
      {cat}
    </span>
  )
}
