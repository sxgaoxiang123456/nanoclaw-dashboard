import { useCallback } from 'react'
import { useChatStore, ChatState } from '@/stores/chatStore'
import { sendChatMessage } from '@/lib/api'

export function useChat() {
  const store = useChatStore()

  const send = useCallback(async (content: string) => {
    store.sendMessage(content)
    try {
      const { reply } = await sendChatMessage(content)
      store.receiveResponse(reply)
    } catch (err) {
      store.setError(err instanceof Error ? err.message : '发送失败，请重试')
    }
  }, [store])

  const retry = useCallback(async () => {
    const lastUserMsg = [...store.messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return
    store.retry()
    try {
      const { reply } = await sendChatMessage(lastUserMsg.content)
      store.receiveResponse(reply)
    } catch (err) {
      store.setError(err instanceof Error ? err.message : '发送失败，请重试')
    }
  }, [store])

  return {
    uiState: store.uiState,
    messages: store.messages,
    error: store.error,
    isOpen: store.uiState !== ChatState.Closed,
    isLoading: store.uiState === ChatState.Sending,
    isError: store.uiState === ChatState.Error,
    open: store.open,
    close: store.close,
    send,
    retry,
  }
}
