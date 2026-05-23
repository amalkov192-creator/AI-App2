import type { NewsItem, AgentStatus, ChannelStats } from '../types'

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    cat: 'AI',
    title: 'OpenAI представила GPT-5 с мультимодальным reasoning',
    summary:
      'Новая модель GPT-5 превосходит GPT-4 по всем бенчмаркам. Особенность — встроенная цепочка рассуждений (chain-of-thought) на уровне ядра. Доступна через API с 22 мая.',
    importance: 9,
    viral: 9,
    time: '2м',
    status: 'pending',
    tags: ['OpenAI', 'GPT-5', 'LLM', 'reasoning'],
    source: 'openai.com',
  },
  {
    id: 2,
    cat: 'Crypto',
    title: 'Bitcoin пробил $120k — аналитики прогнозируют $150k к лету',
    summary:
      'BTC достиг исторического максимума $120,400. Рост связан с одобрением ETF в Азии и притоком институционального капитала. Ряд аналитиков видит цель $150k до конца Q2.',
    importance: 8,
    viral: 8,
    time: '14м',
    status: 'pending',
    tags: ['Bitcoin', 'BTC', 'Crypto', 'ATH'],
    source: 'coindesk.com',
  },
  {
    id: 3,
    cat: 'Tech',
    title: 'Apple Vision Pro 2 выходит в 38 новых странах в июне',
    summary:
      'Apple анонсировала расширение продаж Vision Pro 2 на 38 рынков. Устройство получило новый чип M4 Ultra, снижение веса на 20% и цену $2,999 в базовой конфигурации.',
    importance: 7,
    viral: 6,
    time: '31м',
    status: 'pending',
    tags: ['Apple', 'VisionPro', 'AR', 'Spatial'],
    source: 'apple.com',
  },
  {
    id: 4,
    cat: 'AI',
    title: 'Anthropic открыла исходный код Claude Haiku 3.5',
    summary:
      'Anthropic открыла веса модели Claude Haiku 3.5 для некоммерческого использования. Это первая open-source модель компании.',
    importance: 8,
    viral: 7,
    time: '58м',
    status: 'published',
    tags: ['Anthropic', 'Claude', 'OpenSource'],
    source: 'anthropic.com',
    publishedAt: new Date(),
  },
  {
    id: 5,
    cat: 'Tech',
    title: 'Microsoft интегрирует Copilot в Windows 12 на уровне ядра',
    summary:
      'В следующей версии Windows Copilot будет работать как системный процесс с доступом ко всем API ОС. Бета-тест запланирован на осень.',
    importance: 6,
    viral: 5,
    time: '1ч',
    status: 'pending',
    tags: ['Microsoft', 'Copilot', 'Windows12', 'AI'],
    source: 'microsoft.com',
  },
]

export const MOCK_AGENTS: AgentStatus[] = [
  { name: 'Collector', status: 'online', uptime: '99.8%', metric: '↓ 47 news/day', metricColor: 'var(--accent2)' },
  { name: 'Analyst',   status: 'online', uptime: '99.9%', metric: '✦ 47 analyzed', metricColor: 'var(--accent2)' },
  { name: 'Writer',    status: 'online', uptime: '98.4%', metric: '✎ 24 posts',    metricColor: 'var(--green)' },
  { name: 'Publisher', status: 'warning',uptime: 'rate limited', metric: '⚡ 20 sent', metricColor: 'var(--amber)' },
]

export const MOCK_STATS: ChannelStats = {
  publishedToday: 24,
  publishedYesterday: 16,
  subscribers: 12400,
  subscribersDelta: 234,
  avgViews: 3200,
  avgViewsDelta: -2,
  viralRate: 68,
  viralRateDelta: 5,
}

export const SYSTEM_PROMPT = (news: NewsItem[]): string => `Ты Analyst Agent — AI-ассистент для управления Telegram новостным каналом про технологии и AI.

Текущее состояние канала:
- Подписчики: 12,400
- Сегодня собрано новостей: 47
- Опубликовано: ${news.filter(n => n.status === 'published').length}
- Ожидают одобрения: ${news.filter(n => n.status === 'pending').length}

Новости в очереди:
${news
  .filter(n => n.status === 'pending')
  .map(n => `- [${n.cat}] "${n.title}" (importance: ${n.importance}/10, viral: ${n.viral}/10)`)
  .join('\n')}

Отвечай коротко, по делу, на русском языке. Используй эмодзи умеренно. Ты помогаешь редактору принимать решения о публикациях, анализируешь тренды и оптимизируешь стратегию канала.`
