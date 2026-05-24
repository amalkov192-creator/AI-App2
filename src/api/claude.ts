import { GoogleGenAI } from '@google/genai'
import type { ChatMessage, NewsItem } from '../types'
import { SYSTEM_PROMPT } from './mockData'

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
})

export async function streamClaude(
  messages: ChatMessage[],
  news: NewsItem[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
): Promise<void> {
  try {
    const apiMessages = messages
      .filter(m => !m.streaming)
      .map(m => ({
        role: m.role === 'agent' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }))

    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: apiMessages,
      config: {
        systemInstruction: SYSTEM_PROMPT(news),
        maxOutputTokens: 1000,
      },
    })

    let full = ''

    for await (const chunk of stream) {
      const text = chunk.text

      if (text) {
        full += text
        onChunk(full)
      }
    }

    onDone(full)
  } catch (e) {
    console.error(e)
    onError('Не удалось подключиться к Gemini API')
  }
}
