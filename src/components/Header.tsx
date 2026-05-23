import { useStore } from '../store'
import { StatusDot } from '../components/StatusDot'

export function Header() {
  const setShowSettings = useStore((s) => s.setShowSettings)

  return (
    <div style={{
      padding: '16px 20px 12px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg)', flexShrink: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), #c084fc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#fff',
          letterSpacing: -1, boxShadow: '0 0 16px var(--accent-glow)',
        }}>NA</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>NewsAgent</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>v0.1 · dashboard</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusDot />
        <button
          onClick={() => setShowSettings(true)}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg3)', color: 'var(--text2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            fontSize: 15, transition: 'all 0.15s',
          }}
          title="Настройки"
        >⚙</button>
      </div>
    </div>
  )
}
