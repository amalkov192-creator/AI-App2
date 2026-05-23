export type NewsCategory = 'AI' | 'Crypto' | 'Tech' | 'Other'

export type NewsStatus = 'pending' | 'published' | 'rejected'

export interface NewsItem {
  id: number
  cat: NewsCategory
  title: string
  summary: string
  importance: number
  viral: number
  time: string
  status: NewsStatus
  tags: string[]
  source?: string
  publishedAt?: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  timestamp: Date
  streaming?: boolean
}

export interface AgentStatus {
  name: string
  status: 'online' | 'warning' | 'offline'
  uptime: string
  metric: string
  metricColor: string
}

export interface ChannelStats {
  publishedToday: number
  publishedYesterday: number
  subscribers: number
  subscribersDelta: number
  avgViews: number
  avgViewsDelta: number
  viralRate: number
  viralRateDelta: number
}

export type TabId = 'feed' | 'chat' | 'analytics'

export interface AppSettings {
  autoPublish: boolean
  quietMode: boolean
  dedup: boolean
  abTest: boolean
  minImportance: number
  minViral: number
  language: 'RU' | 'EN' | 'RU+EN'
}
