import { motion } from 'framer-motion'
import type { NewsItem } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { useStore } from '../store'
import { useTelegram } from '../hooks/useTelegram'

interface Props { item: NewsItem; index: number }

export function NewsCard({ item, index }: Props) {
  const { approveNews, rejectNews, setSelectedNews, setTab, addMessage } = useStore((s) => ({
    approveNews: s.approveNews,
    rejectNews:  s.rejectNews,
    setSelectedNews: s.setSelectedNews,
    setTab: s.setTab,
    addMessage: s.addMessage,
  }))
  const { haptic, sendAction } = useTelegram()

  const scoreColor = (v: number) => v >= 8 ? 'var(--green)' : 'var(--amber)'

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('success')
    sendAction('approve', item.id)   // уведомляем бот
    approveNews(item.id)
  }

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('error')
    sendAction('reject', item.id)
    rejectNews(item.id)
  }

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('light')
    addMessage({
      id: Math.random().toString(36).slice(2),
      role: 'user',
      text: `Стоит ли публиковать: "${item.title}"? Дай краткий анализ.`,
      timestamp: new Date(),
    })
    setTab('chat')
  }

  const btnBase: React.CSSProperties = {
    flex: 1, padding: '7px 0', borderRadius: 'var(--radius-sm)', border: 'none',
    fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', cursor: 'pointer',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
      onClick={() => { haptic('light'); setSelectedNews(item.id) }}
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, cursor: 'pointer' }}
      whileHover={{ borderColor: 'var(--border2)', backgroundColor: 'var(--bg3)', y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <CategoryBadge cat={item.cat} />
        {(['importance', 'viral'] as const).map((key) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              {key === 'importance' ? 'IMP' : 'VRL'}
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: scoreColor(item[key]) }}>
              {item[key]}
            </span>
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
          {item.time}
        </span>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: item.status === 'pending' ? 10 : 0 }}>
        {item.title}
      </div>

      {item.status === 'published' && (
        <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 8, fontFamily: 'var(--mono)' }}>✓ Опубликовано</div>
      )}
      {item.status === 'rejected' && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 8, fontFamily: 'var(--mono)' }}>✗ Отклонено</div>
      )}
      {item.status === 'pending' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ ...btnBase, background: 'var(--green-bg)', color: 'var(--green)' }} onClick={handleApprove}>✓ Публ.</button>
          <button style={{ ...btnBase, background: 'var(--red-bg)',   color: 'var(--red)'   }} onClick={handleReject}>✗ Откл.</button>
          <button style={{ ...btnBase, background: 'var(--bg4)',      color: 'var(--accent2)'}} onClick={handleAskAI}>✦ AI</button>
        </div>
      )}
    </motion.div>
  )
}
