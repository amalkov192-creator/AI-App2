import { useCallback } from 'react'
import { useStore } from '../store'
import { streamClaude } from '../api/claude'
import type { ChatMessage } from '../types'

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

export function useChat() {
  const { messages, news, addMessage, updateStreamingMessage, finalizeMessage, isStreaming, setStreaming } = useStore(
    (s) => ({
      messages: s.messages,
      news: s.news,
      addMessage: s.addMessage,
      updateStreamingMessage: s.updateStreamingMessage,
      finalizeMessage: s.finalizeMessage,
      isStreaming: s.isStreaming,
      setStreaming: s.setStreaming,
    }),
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || !text.trim()) return

      const userMsg: ChatMessage = {
        id: makeId(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      }
      addMessage(userMsg)

      const agentId = makeId()
      const agentMsg: ChatMessage = {
        id: agentId,
        role: 'agent',
        text: '',
        timestamp: new Date(),
        streaming: true,
      }
      addMessage(agentMsg)
      setStreaming(true)

      await streamClaude(
        [...messages, userMsg],
        news,
        (chunk) => updateStreamingMessage(agentId, chunk),
        (full) => {
          updateStreamingMessage(agentId, full)
          finalizeMessage(agentId)
          setStreaming(false)
        },
        (err) => {
          updateStreamingMessage(agentId, `⚠ ${err}`)
          finalizeMessage(agentId)
          setStreaming(false)
        },
      )
    },
    [messages, news, addMessage, updateStreamingMessage, finalizeMessage, isStreaming, setStreaming],
  )

  return { messages, isStreaming, sendMessage }
}
