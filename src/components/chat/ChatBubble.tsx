import type { ChatMessage } from '@/types'

interface ChatBubbleProps {
  msg: ChatMessage
}

export function ChatBubble({ msg }: ChatBubbleProps) {
  const isUser = msg.role === 'user'
  const isLoading = msg.status === 'loading'

  return (
    <div className={isUser ? 'self-end max-w-[85%]' : 'self-start max-w-[85%]'}>
      <div
        className={
          isUser
            ? 'px-3.5 py-2.5 rounded-xl rounded-br text-[13px] leading-relaxed break-words bg-accent text-white'
            : isLoading
              ? 'px-3.5 py-2.5 rounded-xl rounded-bl text-[13px] leading-relaxed break-words bg-card-hover text-text3 italic'
              : 'px-3.5 py-2.5 rounded-xl rounded-bl text-[13px] leading-relaxed break-words bg-card-hover text-text'
        }
      >
        {msg.content}
      </div>
    </div>
  )
}
