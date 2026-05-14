import { useRef, useState, useCallback, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatBubble } from './ChatBubble'

export function ChatPanel() {
  const {
    messages,
    error,
    isOpen,
    isLoading,
    isError,
    open,
    close,
    send,
    retry,
  } = useChat()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSend = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || isLoading) return
    setInputValue('')
    await send(content)
  }, [inputValue, isLoading, send])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleRetry = useCallback(async () => {
    await retry()
  }, [retry])

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={open}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white border-none cursor-pointer flex items-center justify-center text-2xl z-[200] transition-all duration-200 hover:scale-110 hover:shadow-[0_6px_24px_rgba(255,140,26,0.5)] active:scale-95 shadow-[0_4px_16px_rgba(255,140,26,0.35)]"
        style={{ display: isOpen ? 'none' : 'flex' }}
        title="和 Andy 对话"
        type="button"
      >
        💬
      </button>

      {/* Chat Panel */}
      <div
        className="fixed bottom-24 right-6 w-[360px] h-[540px] bg-card border border-border rounded-[var(--radius-card)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col z-[199] overflow-hidden transition-all duration-250"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div className="bg-accent px-4 py-3.5 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
            🐾
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">Andy</div>
            <div className="text-[11px] text-white/70">在线 · 即时回复</div>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 rounded-full bg-white/15 border-none text-white cursor-pointer flex items-center justify-center text-sm transition-colors hover:bg-white/25"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}

          {/* Error Banner */}
          {isError && (
            <div className="self-center px-3 py-2 bg-red/10 border border-red/30 rounded-lg text-xs text-red flex items-center gap-2">
              <span>⚠️ {error || '发送失败'}</span>
              <button
                onClick={handleRetry}
                className="text-accent hover:underline cursor-pointer bg-transparent border-none text-xs font-medium"
                type="button"
              >
                重试
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-3 py-3 border-t border-border flex gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            maxLength={2000}
            disabled={isLoading}
            className="flex-1 h-10 bg-bg border border-border rounded-[var(--radius-btn)] text-text px-3 text-[13px] outline-none transition-colors focus:border-accent placeholder:text-text3 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 rounded-[var(--radius-btn)] bg-accent text-white border-none cursor-pointer flex items-center justify-center text-base shrink-0 transition-colors hover:bg-[#e07a10] disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  )
}
