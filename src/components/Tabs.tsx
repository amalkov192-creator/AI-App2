import { useStore } from '../store'
import type { TabId } from '../types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'feed',      label: 'Feed' },
  { id: 'chat',      label: 'Agent' },
  { id: 'analytics', label: 'Analytics' },
]

export function Tabs() {
  const { activeTab, setTab, news } = useStore((s) => ({
    activeTab: s.activeTab,
    setTab: s.setTab,
    news: s.news,
  }))

  const pending = news.filter((n) => n.status === 'pending').length

  return (
    <div style={{
      display: 'flex', gap: 4, padding: '10px 20px',
      borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0,
    }}>
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 'var(--radius-sm)', border: 'none',
            background: activeTab === id ? 'var(--bg4)' : 'transparent',
            color: activeTab === id ? 'var(--text)' : 'var(--text2)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: activeTab === id ? 'inset 0 0 0 1px var(--border2)' : 'none',
            transition: 'all 0.2s', letterSpacing: '0.3px',
          }}
        >
          {label}
          {id === 'feed' && pending > 0 && (
            <span style={{
              display: 'inline-block', background: 'var(--accent)', color: '#fff',
              fontSize: 10, padding: '1px 5px', borderRadius: 10, marginLeft: 4,
              fontFamily: 'var(--mono)',
            }}>
              {pending}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
