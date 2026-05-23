import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import { StatusDot } from './components/StatusDot'
import { Snack } from './components/Snack'
import { FeedPage } from './pages/FeedPage'
import { ChatPage } from './pages/ChatPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { DetailPage } from './pages/DetailPage'
import { SettingsPage } from './pages/SettingsPage'
import type { TabId } from './types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'chat', label: 'Agent' },
  { id: 'analytics', label: 'Analytics' },
]

export default function App() {
  const { activeTab, setTab, news, showSettings, setShowSettings } = useStore((s) => ({
    activeTab: s.activeTab,
    setTab: s.setTab,
    news: s.news,
    showSettings: s.showSettings,
    setShowSettings: s.setShowSettings,
  }))

  const pendingCount = news.filter((n) => n.status === 'pending').length

  // inject blink keyframe once
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes slide-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      @keyframes tbounce { 0%,60%,100%{transform:translateY(0);background:var(--text3)} 30%{transform:translateY(-4px);background:var(--accent2)} }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 420, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #c084fc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: -1,
            boxShadow: '0 0 16px var(--accent-glow)',
          }}>NA</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>NewsAgent</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>v0.1 · dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot />
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: showSettings ? 'var(--bg4)' : 'var(--bg3)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15 }}
          >⚙</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 'var(--radius-sm)', border: 'none',
              background: activeTab === t.id ? 'var(--bg4)' : 'transparent',
              color: activeTab === t.id ? 'var(--text)' : 'var(--text2)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeTab === t.id ? 'inset 0 0 0 1px var(--border2)' : 'none',
            }}
          >
            {t.label}
            {t.id === 'feed' && pendingCount > 0 && (
              <span style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 10, marginLeft: 4, fontFamily: 'var(--mono)' }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {activeTab === 'feed' && <FeedPage />}
            {activeTab === 'chat' && <ChatPage />}
            {activeTab === 'analytics' && <AnalyticsPage />}
          </motion.div>
        </AnimatePresence>

        {/* overlay pages */}
        <DetailPage />
        <SettingsPage />
      </div>

      <Snack />
    </div>
  )
}
