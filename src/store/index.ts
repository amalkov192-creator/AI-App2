import { create } from 'zustand'
import type { NewsItem, ChatMessage, AppSettings, TabId, ChannelStats } from '../types'
import { MOCK_NEWS, MOCK_STATS } from '../api/mockData'
import * as api from '../api/newsApi'

interface AppState {
  // news
  news: NewsItem[]
  loadingNews: boolean
  fetchNews: () => Promise<void>
  approveNews: (id: number) => Promise<void>
  rejectNews:  (id: number) => Promise<void>

  // stats
  stats: ChannelStats
  categories: Record<string, number>
  fetchStats: () => Promise<void>

  // tabs
  activeTab: TabId
  setTab: (tab: TabId) => void

  // chat
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  updateStreamingMessage: (id: string, text: string) => void
  finalizeMessage: (id: string) => void
  isStreaming: boolean
  setStreaming: (v: boolean) => void

  // detail page
  selectedNewsId: number | null
  setSelectedNews: (id: number | null) => void

  // settings page
  showSettings: boolean
  setShowSettings: (v: boolean) => void
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void

  // snack
  snack: { msg: string; type: 'green' | 'red' | 'blue' } | null
  showSnack: (msg: string, type?: 'green' | 'red' | 'blue') => void
}

export const useStore = create<AppState>((set, get) => ({
  // ── News ──────────────────────────────────────────────────
  news: MOCK_NEWS,
  loadingNews: false,

  fetchNews: async () => {
    set({ loadingNews: true })
    try {
      const news = await api.fetchNews()
      set({ news, loadingNews: false })
    } catch {
      set({ loadingNews: false })
    }
  },

  approveNews: async (id) => {
    try {
      const updated = await api.approveNews(id)
      set((s) => ({ news: s.news.map((n) => n.id === id ? { ...n, ...updated } : n) }))
      get().showSnack('✓ Отправлено в канал', 'green')
    } catch (e) {
      get().showSnack('✗ Ошибка публикации', 'red')
    }
  },

  rejectNews: async (id) => {
    try {
      await api.rejectNews(id)
      set((s) => ({ news: s.news.map((n) => n.id === id ? { ...n, status: 'rejected' } : n) }))
      get().showSnack('✗ Новость отклонена', 'red')
    } catch {
      get().showSnack('✗ Ошибка', 'red')
    }
  },

  // ── Stats ─────────────────────────────────────────────────
  stats: MOCK_STATS,
  categories: { AI: 42, Crypto: 28, Tech: 19, Other: 11 },

  fetchStats: async () => {
    try {
      const { stats, categories } = await api.fetchStats()
      set({ stats, categories })
    } catch { /* keep mock */ }
  },

  // ── Tabs ──────────────────────────────────────────────────
  activeTab: 'feed',
  setTab: (tab) => set({ activeTab: tab }),

  // ── Chat ──────────────────────────────────────────────────
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateStreamingMessage: (id, text) =>
    set((s) => ({ messages: s.messages.map((m) => m.id === id ? { ...m, text } : m) })),
  finalizeMessage: (id) =>
    set((s) => ({ messages: s.messages.map((m) => m.id === id ? { ...m, streaming: false } : m) })),
  isStreaming: false,
  setStreaming: (v) => set({ isStreaming: v }),

  // ── Detail / Settings ─────────────────────────────────────
  selectedNewsId: null,
  setSelectedNews: (id) => set({ selectedNewsId: id }),

  showSettings: false,
  setShowSettings: (v) => set({ showSettings: v }),

  settings: {
    autoPublish: true, quietMode: true, dedup: true, abTest: false,
    minImportance: 6, minViral: 7, language: 'RU',
  },
  updateSetting: (key, value) =>
    set((s) => ({
      settings: { ...s.settings, [key]: value },
      snack: { msg: '✓ Настройки сохранены', type: 'blue' },
    })),

  // ── Snack ─────────────────────────────────────────────────
  snack: null,
  showSnack: (msg, type = 'green') => set({ snack: { msg, type } }),
}))
