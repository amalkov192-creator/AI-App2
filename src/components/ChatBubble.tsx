import { motion } from 'framer-motion'
import type { ChatMessage } from '../types'

interface Props { msg: ChatMessage }

export function ChatBubble({ msg }: Props) {
  const isAgent = msg.role === 'agent'
  const time = msg.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex', flexDirection: 'column', maxWidth: '82%',
        alignSelf: isAgent ? 'flex-start' : 'flex-end',
        alignItems: isAgent ? 'flex-start' : 'flex-end',
      }}
    >
      {isAgent && (
        <div style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 600, marginBottom: 3, paddingLeft: 4, fontFamily: 'var(--mono)' }}>
          Analyst Agent
        </div>
      )}
      <div
        style={{
          padding: '10px 13px',
          borderRadius: 14,
          fontSize: 13,
          lineHeight: 1.55,
          ...(isAgent
            ? { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
            : { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 }),
        }}
      >
        {msg.text.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
        ))}
        {msg.streaming && (
          <span
            style={{
              display: 'inline-block', width: 2, height: 13,
              background: 'var(--accent2)', marginLeft: 2, verticalAlign: 'middle',
              animation: 'blink 0.7s step-end infinite',
            }}
          />
        )}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 3, padding: '0 4px' }}>
        {time}
      </div>
    </motion.div>
  )
}
