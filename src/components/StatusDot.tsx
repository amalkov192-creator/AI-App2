import { useEffect, useState } from 'react'

interface Props { color?: string; size?: number; glow?: boolean }

export function StatusDot({ color = 'var(--green)', size = 7, glow = true }: Props) {
  const [bright, setBright] = useState(true)

  useEffect(() => {
    if (!glow) return
    const id = setInterval(() => setBright((b) => !b), 1000)
    return () => clearInterval(id)
  }, [glow])

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        boxShadow: glow ? `0 0 ${bright ? 14 : 6}px ${color}` : 'none',
        transition: 'box-shadow 0.5s ease',
      }}
    />
  )
}
