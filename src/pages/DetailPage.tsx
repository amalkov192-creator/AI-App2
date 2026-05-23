import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { CategoryBadge } from '../components/CategoryBadge'

export function DetailPage() {
  const { selectedNewsId, setSelectedNews, news, approveNews, rejectNews, setTab } = useStore((s) => ({
    selectedNewsId: s.selectedNewsId,
    setSelectedNews: s.setSelectedNews,
    news: s.news,
    approveNews: s.approveNews,
    rejectNews: s.rejectNews,
    setTab: s.setTab,
  }))
  const addMessage = useStore((s) => s.addMessage)

  const item = news.find((n) => n.id === selectedNewsId)
  const scoreColor = (v: number) => v >= 8 ? 'var(--green)' : 'var(--amber)'

  const askAgent = () => {
    if (!item) return
    addMessage({ id: Math.random().toString(36).slice(2), role: 'user', text: `Стоит ли публиковать: "${item.title}"? Краткий анализ.`, timestamp: new Date() })
    setSelectedNews(null)
    setTab('chat')
  }

  const btnBase: React.CSSProperties = {
    flex: 1, padding: 11, borderRadius: 'var(--radius-sm)', border: 'none',
    fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
  }

  return (
    <AnimatePresence>
      {selectedNewsId !== null && item && (
        <motion.div key="detail"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', zIndex: 20 }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button onClick={() => setSelectedNews(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>←</button>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{item.cat} · {item.time} назад</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CategoryBadge cat={item.cat} />
              {item.source && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{item.source}</span>}
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{item.title}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'IMPORTANCE', val: item.importance, color: scoreColor(item.importance) },
                { label: 'VIRAL', val: item.viral, color: scoreColor(item.viral) },
                { label: 'PUBLISH', val: item.importance >= 7 && item.viral >= 6 ? 'YES' : 'NO', color: item.importance >= 7 && item.viral >= 6 ? 'var(--green)' : 'var(--red)' },
              ].map((sc) => (
                <div key={sc.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{sc.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1, color: sc.color }}>{sc.val}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 6 }}>КРАТКОЕ СОДЕРЖАНИЕ</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text2)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12 }}>{item.summary}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 6 }}>ТЕГИ</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {item.tags.map((t) => (
                  <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text2)', background: 'var(--bg3)' }}>#{t}</span>
                ))}
              </div>
            </div>

            {item.status === 'published' && <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--mono)' }}>✓ Опубликовано в канал</div>}
            {item.status === 'rejected'  && <div style={{ fontSize: 11, color: 'var(--red)',   fontFamily: 'var(--mono)' }}>✗ Отклонено</div>}
            {item.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...btnBase, background: 'var(--green-bg)', color: 'var(--green)' }} onClick={() => { approveNews(item.id); setSelectedNews(null) }}>✓ Опубликовать</button>
                <button style={{ ...btnBase, background: 'var(--red-bg)', color: 'var(--red)' }}     onClick={() => { rejectNews(item.id); setSelectedNews(null) }}>✗ Отклонить</button>
              </div>
            )}

            <button onClick={askAgent} style={{ padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--accent2)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer', width: '100%' }}>
              ✦ Спросить агента об этой новости
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
