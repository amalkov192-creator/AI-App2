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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: apiMessages,
      config: {
        systemInstruction: SYSTEM_PROMPT(news),
        maxOutputTokens: 1000,
      },
    })

    const text = response.text || ''

    onChunk(text)
    onDone(text)
  } catch (e) {
    console.error(e)
    onError('Не удалось подключиться к Gemini API')
  }
}
