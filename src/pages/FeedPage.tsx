import { useEffect } from 'react'
import { useStore } from '../store'
import { NewsCard } from '../components/NewsCard'

export function FeedPage() {
  const { news, loadingNews, fetchNews } = useStore((s) => ({
    news: s.news,
    loadingNews: s.loadingNews,
    fetchNews: s.fetchNews,
  }))

  useEffect(() => { fetchNews() }, [])

  if (loadingNews && news.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 150, 300].map((d) => (
            <span key={d} style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
              display: 'inline-block',
              animation: `tbounce 1.2s ${d}ms ease-in-out infinite`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>загрузка новостей…</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {news.map((item, i) => (
        <NewsCard key={item.id} item={item} index={i} />
      ))}
      {news.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, fontFamily: 'var(--mono)', marginTop: 40 }}>
          пусто — нажми «Сбор» чтобы собрать новости
        </div>
      )}
    </div>
  )
}
