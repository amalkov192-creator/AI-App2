import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { ChatBubble } from '../components/ChatBubble'
import { StatusDot } from '../components/StatusDot'

const QUICK = [
  'Сколько новостей собрано сегодня?',
  'Что сейчас в тренде в AI?',
  'Какие новости стоит опубликовать первыми?',
  'Дай совет по расписанию публикаций',
  'Как повысить вовлечённость канала?',
]

export function ChatPage() {
  const { messages, isStreaming, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // welcome message once
  const didWelcome = useRef(false)
  const { addMessage } = useChat() as ReturnType<typeof useChat> & { addMessage?: never }
  void addMessage // suppress

  useEffect(() => {
    if (didWelcome.current || messages.length > 0) return
    didWelcome.current = true
    // init welcome via store directly — done in App init
  }, [messages.length])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* agent header */}
      <div style={{ padding: '8px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), #c084fc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)',
          boxShadow: '0 0 10px var(--accent-glow)',
        }}>AI</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Analyst Agent</div>
          <div style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>claude-sonnet-4-20250514</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--green)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <StatusDot size={6} glow={false} /> online
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '82%' }}>
            <div style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 600, marginBottom: 3, paddingLeft: 4, fontFamily: 'var(--mono)' }}>Analyst Agent</div>
            <div style={{ padding: '10px 13px', borderRadius: 14, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Привет! 👋 Я Analyst Agent на базе Claude.<br /><br />
              Сегодня собрано <strong style={{ color: 'var(--accent2)' }}>47 новостей</strong>, из них 5 ждут твоего решения. Могу анализировать новости, давать советы по публикациям и отвечать на любые вопросы.
            </div>
          </div>
        )}
        {messages.map((m) => <ChatBubble key={m.id} msg={m} />)}
        {isStreaming && messages.at(-1)?.streaming !== true && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ padding: '10px 13px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, borderBottomLeftRadius: 4, display: 'flex', gap: 4 }}>
              {[0,200,400].map((d) => (
                <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block', animation: `tbounce 1.2s ${d}ms ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* quick actions */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => !isStreaming && sendMessage(q)}
            disabled={isStreaming}
            style={{
              whiteSpace: 'nowrap', padding: '5px 11px', borderRadius: 20,
              border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)',
              fontSize: 11, fontWeight: 500, transition: 'all 0.15s', cursor: isStreaming ? 'default' : 'pointer',
              opacity: isStreaming ? 0.5 : 1,
            }}
          >{q}</button>
        ))}
      </div>

      {/* input */}
      <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); resize(e.target) }}
            onKeyDown={handleKey}
            placeholder="Спросить агента..."
            rows={1}
            style={{
              flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 22, padding: '10px 16px', color: 'var(--text)',
              fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.4,
              maxHeight: 100, overflowY: 'auto', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border2)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming}
            style={{
              width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px var(--accent-glow)', transition: 'all 0.15s',
              cursor: isStreaming ? 'default' : 'pointer', opacity: isStreaming ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
