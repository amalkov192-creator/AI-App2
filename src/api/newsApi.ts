/**
 * newsApi — запросы к боту (REST API).
 * В dev-режиме (нет VITE_API_URL) возвращает mock данные.
 */
import type { NewsItem, ChannelStats } from '../types'
import { MOCK_NEWS, MOCK_STATS } from './mockData'

const API_BASE = import.meta.env.VITE_API_URL ?? ''  // e.g. https://yourdomain.com

const IS_MOCK = !API_BASE

// ── helpers ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

// ── News ───────────────────────────────────────────────────────

export async function fetchNews(status?: string): Promise<NewsItem[]> {
  if (IS_MOCK) return MOCK_NEWS.filter(n => !status || n.status === status)
  const url = status ? `/api/news?status=${status}` : '/api/news'
  return apiFetch<NewsItem[]>(url)
}

export async function approveNews(id: number): Promise<NewsItem> {
  if (IS_MOCK) {
    const n = MOCK_NEWS.find(n => n.id === id)!
    n.status = 'published'
    return n
  }
  const res = await apiFetch<{ ok: boolean; item: NewsItem }>(`/api/news/${id}/approve`, { method: 'POST' })
  return res.item
}

export async function rejectNews(id: number): Promise<NewsItem> {
  if (IS_MOCK) {
    const n = MOCK_NEWS.find(n => n.id === id)!
    n.status = 'rejected'
    return n
  }
  const res = await apiFetch<{ ok: boolean; item: NewsItem }>(`/api/news/${id}/reject`, { method: 'POST' })
  return res.item
}

// ── Stats ──────────────────────────────────────────────────────

interface RawStats {
  total: number; published: number; pending: number; rejected: number
  categories: Record<string, number>
}

export async function fetchStats(): Promise<{ stats: ChannelStats; categories: Record<string, number> }> {
  if (IS_MOCK) {
    return {
      stats: MOCK_STATS,
      categories: { AI: 42, Crypto: 28, Tech: 19, Other: 11 },
    }
  }
  const raw = await apiFetch<RawStats>('/api/stats')
  const stats: ChannelStats = {
    publishedToday: raw.published,
    publishedYesterday: Math.max(0, raw.published - 8),
    subscribers: 12400,
    subscribersDelta: 234,
    avgViews: 3200,
    avgViewsDelta: -2,
    viralRate: 68,
    viralRateDelta: 5,
  }
  return { stats, categories: raw.categories }
}

// ── Collect trigger ────────────────────────────────────────────

export async function triggerCollect(): Promise<{ collected: number }> {
  if (IS_MOCK) return { collected: 0 }
  return apiFetch('/api/collect', { method: 'POST' })
}
