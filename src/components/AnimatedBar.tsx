import { useEffect, useState } from 'react'

interface Props { label: string; value: number; color: string; delay?: number }

export function AnimatedBar({ label, value, color, delay = 0 }: Props) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 100)
    return () => clearTimeout(t)
  }, [value, delay])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 60, fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: 3, background: color,
            width: `${width}%`,
            transition: 'width 0.8s cubic-bezier(0.2,0.8,0.3,1)',
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', width: 32, textAlign: 'right', color: 'var(--text)' }}>
        {value}%
      </span>
    </div>
  )
}
