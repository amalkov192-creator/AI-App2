import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { AnimatedBar } from '../components/AnimatedBar'
import { triggerCollect } from '../api/newsApi'

function StatCard({ label, value, color, change, up, delay = 0 }: {
  label: string; value: string; color?: string; change: string; up: boolean; delay?: number
}) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, animation: `slide-in 0.3s ${delay}s ease both` }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -1, color: color ?? 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--mono)', color: up ? 'var(--green)' : 'var(--red)' }}>
        {up ? '↑' : '↓'} {change}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: 'var(--mono)', padding: '4px 0' }}>{children}</div>
}

export function AnalyticsPage() {
  const { stats, categories, fetchStats, showSnack, fetchNews } = useStore((s) => ({
    stats: s.stats, categories: s.categories,
    fetchStats: s.fetchStats, showSnack: s.showSnack, fetchNews: s.fetchNews,
  }))
  const [collecting, setCollecting] = useState(false)

  useEffect(() => { fetchStats() }, [])

  const handleCollect = async () => {
    setCollecting(true)
    try {
      const res = await triggerCollect()
      showSnack(`✓ Собрано ${res.collected} новостей`, 'green')
      await fetchNews()
      await fetchStats()
    } catch {
      showSnack('✗ Ошибка сбора', 'red')
    } finally {
      setCollecting(false)
    }
  }

  const totalCat = Object.values(categories).reduce((a, b) => a + b, 0) || 1
  const catBars = Object.entries(categories).map(([label, cnt]) => ({
    label, value: Math.round((cnt / totalCat) * 100),
    color: label === 'AI' ? 'var(--accent2)' : label === 'Crypto' ? 'var(--amber)' : label === 'Tech' ? 'var(--green)' : 'var(--text3)',
  }))

  const todayDelta = stats.publishedToday - stats.publishedYesterday

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Collect button */}
      <button
        onClick={handleCollect}
        disabled={collecting}
        style={{
          padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          background: collecting ? 'var(--bg3)' : 'rgba(124,106,247,0.1)',
          color: collecting ? 'var(--text3)' : 'var(--accent2)',
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--sans)', cursor: collecting ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {collecting
          ? <><span style={{ animation: 'tbounce 1s infinite' }}>↻</span> Собираю…</>
          : '↻ Запустить сбор новостей'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatCard label="PUBLISHED TODAY" value={String(stats.publishedToday)} color="var(--accent2)"
          change={`+${Math.abs(todayDelta)} vs вчера`} up={todayDelta >= 0} delay={0.05} />
        <StatCard label="SUBSCRIBERS" value="12.4k" change="+234" up={true} delay={0.1} />
        <StatCard label="AVG VIEWS" value="3.2k" color="var(--amber)" change="2%" up={false} delay={0.15} />
        <StatCard label="VIRAL RATE" value={`${stats.viralRate}%`} color="var(--green)" change={`+${stats.viralRateDelta}%`} up={true} delay={0.2} />
      </div>

      <SectionTitle>КАТЕГОРИИ</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {catBars.map((b, i) => <AnimatedBar key={b.label} label={b.label} value={b.value} color={b.color} delay={i * 80} />)}
      </div>

      <SectionTitle>AGENTS PERFORMANCE</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Writer', value: 94, color: 'var(--accent2)' },
          { label: 'Analyst', value: 88, color: 'var(--green)' },
          { label: 'Publish', value: 100, color: 'var(--amber)' },
          { label: 'Collect', value: 76, color: 'var(--text2)' },
        ].map((b, i) => <AnimatedBar key={b.label} label={b.label} value={b.value} color={b.color} delay={i * 80} />)}
      </div>

      <SectionTitle>ЛУЧШЕЕ ВРЕМЯ ПУБЛИКАЦИИ</SectionTitle>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { time: '10:00', views: '4.1k', bar: 82 },
          { time: '13:00', views: '2.8k', bar: 56 },
          { time: '19:30', views: '3.9k', bar: 78 },
          { time: '22:00', views: '1.6k', bar: 32 },
        ].map((row) => (
          <div key={row.time} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 44, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{row.time}</span>
            <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${row.bar}%`, transition: 'width 0.8s cubic-bezier(0.2,0.8,0.3,1)' }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text)', width: 36, textAlign: 'right' }}>{row.views}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
