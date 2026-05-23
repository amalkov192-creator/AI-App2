import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { Toggle } from '../components/Toggle'
import { StatusDot } from '../components/StatusDot'
import { MOCK_AGENTS } from '../api/mockData'

export function SettingsPage() {
  const { showSettings, setShowSettings, settings, updateSetting } = useStore((s) => ({
    showSettings: s.showSettings,
    setShowSettings: s.setShowSettings,
    settings: s.settings,
    updateSetting: s.updateSetting,
  }))

  const dotColor = (status: string) =>
    status === 'online' ? 'var(--green)' : status === 'warning' ? 'var(--amber)' : 'var(--red)'

  const row = (icon: string, label: string, desc: string, right: React.ReactNode) => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)', marginTop: 2 }}>{desc}</div>
      </div>
      {right}
    </div>
  )

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 6,
    color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 8px', outline: 'none', cursor: 'pointer',
  }

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div key="settings"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', zIndex: 20 }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button onClick={() => setShowSettings(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>←</button>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Настройки</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Agents */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'var(--mono)' }}>АГЕНТЫ</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {MOCK_AGENTS.map((a) => (
                <div key={a.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                    <StatusDot color={dotColor(a.status)} size={8} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>uptime {a.uptime}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: a.metricColor }}>{a.metric}</div>
                </div>
              ))}
            </div>

            {/* Automation */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'var(--mono)' }}>АВТОМАТИЗАЦИЯ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {row('🤖', 'Авто-публикация', 'importance ≥ 8 + viral ≥ 7',
                <Toggle on={settings.autoPublish} onChange={(v) => updateSetting('autoPublish', v)} />)}
              {row('🌙', 'Тихий режим', '23:00 — 08:00 МСК',
                <Toggle on={settings.quietMode} onChange={(v) => updateSetting('quietMode', v)} />)}
              {row('🔍', 'Дедупликация', 'Убирать похожие новости',
                <Toggle on={settings.dedup} onChange={(v) => updateSetting('dedup', v)} />)}
              {row('📊', 'A/B тест заголовков', 'Writer генерирует 2 варианта',
                <Toggle on={settings.abTest} onChange={(v) => updateSetting('abTest', v)} />)}
            </div>

            {/* Filters */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'var(--mono)' }}>ФИЛЬТРЫ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {row('⚡', 'Мин. importance', 'Ниже — не показывать',
                <select style={selectStyle} value={settings.minImportance} onChange={(e) => updateSetting('minImportance', Number(e.target.value))}>
                  {[4,5,6,7,8].map(v => <option key={v} value={v}>{v}</option>)}
                </select>)}
              {row('🔥', 'Мин. viral score', 'Для авто-публикации',
                <select style={selectStyle} value={settings.minViral} onChange={(e) => updateSetting('minViral', Number(e.target.value))}>
                  {[4,5,6,7,8].map(v => <option key={v} value={v}>{v}</option>)}
                </select>)}
              {row('🌐', 'Язык постов', 'Writer генерирует на',
                <select style={selectStyle} value={settings.language} onChange={(e) => updateSetting('language', e.target.value as 'RU' | 'EN' | 'RU+EN')}>
                  {['RU','EN','RU+EN'].map(v => <option key={v}>{v}</option>)}
                </select>)}
            </div>

            {/* About */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'var(--mono)' }}>О ПРОЕКТЕ</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', lineHeight: 1.8 }}>
              NewsAgent v0.1-alpha<br />
              Frontend: React + TypeScript + Vite<br />
              State: Zustand · Animations: Framer Motion<br />
              AI: Claude Sonnet (Anthropic API)<br />
              Queue: Celery + Redis (planned)<br />
              Backend: FastAPI + PostgreSQL (planned)
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
