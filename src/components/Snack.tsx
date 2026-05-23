import { useEffect } from 'react'
import { useStore } from '../store'

export function Snack() {
  const snack = useStore((s) => s.snack)
  const showSnack = useStore((s) => s.showSnack)

  useEffect(() => {
    if (!snack) return
    const t = setTimeout(() => showSnack('', 'green'), 2200)
    return () => clearTimeout(t)
  }, [snack, showSnack])

  const colorMap = {
    green: { color: 'var(--green)', border: 'rgba(61,220,132,0.3)' },
    red:   { color: 'var(--red)',   border: 'rgba(255,92,92,0.3)' },
    blue:  { color: 'var(--accent2)', border: 'rgba(124,106,247,0.3)' },
  }
  const c = colorMap[snack?.type ?? 'green']

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: snack?.msg
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(20px)',
        background: 'var(--bg3)',
        border: `1px solid ${c.border}`,
        borderRadius: 20,
        padding: '8px 16px',
        fontSize: 12,
        fontFamily: 'var(--mono)',
        color: c.color,
        opacity: snack?.msg ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 999,
        transition: 'all 0.3s',
        whiteSpace: 'nowrap',
      }}
    >
      {snack?.msg}
    </div>
  )
}
