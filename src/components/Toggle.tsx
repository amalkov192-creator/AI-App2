interface Props { on: boolean; onChange: (v: boolean) => void }

export function Toggle({ on, onChange }: Props) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        background: on ? 'rgba(124,106,247,0.3)' : 'var(--bg4)',
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute', top: 3, left: 3,
          width: 16, height: 16, borderRadius: '50%',
          background: on ? 'var(--accent2)' : 'var(--text3)',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s, background 0.2s',
          display: 'block',
        }}
      />
    </button>
  )
}
