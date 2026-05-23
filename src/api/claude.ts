import type { ChatMessage } from '../types'
import { SYSTEM_PROMPT } from './mockData'
import type { NewsItem } from '../types'

export async function streamClaude(
  messages: ChatMessage[],
  news: NewsItem[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
): Promise<void> {
  const apiMessages = messages
    .filter(m => !m.streaming)
    .map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.text }))

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT(news),
        messages: apiMessages,
        stream: true,
      }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: { message: `HTTP ${resp.status}` } }))
      onError(err?.error?.message ?? `HTTP ${resp.status}`)
      return
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let full = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            full += parsed.delta.text
            onChunk(full)
          }
        } catch (_) {
          // ignore parse errors in stream
        }
      }
    }

    onDone(full)
  } catch (e) {
    onError('Не удалось подключиться к API')
  }
}
