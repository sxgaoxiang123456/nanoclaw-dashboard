import { create } from 'zustand'
import type { ChatMessage } from '@/types'

export const ChatState = {
  Closed: 'closed',
  Open: 'open',
  Sending: 'sending',
  Received: 'received',
  Error: 'error',
} as const

export type ChatStateType = typeof ChatState[keyof typeof ChatState]

interface ChatStore {
  uiState: ChatStateType
  error: string | null
  messages: ChatMessage[]
  open: () => void
  close: () => void
  sendMessage: (content: string) => void
  receiveResponse: (content: string) => void
  setError: (error: string) => void
  retry: () => void
  reset: () => void
}

function createMessage(role: ChatMessage['role'], content: string, status: ChatMessage['status']): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    timestamp: new Date().toISOString(),
  }
}

export const useChatStore = create<ChatStore>((set) => ({
  uiState: ChatState.Closed,
  error: null,
  messages: [
    createMessage('assistant', '你好！我是 Andy，你的 NanoClaw 助理。有什么可以帮你的？', 'sent'),
  ],
  open: () => set({ uiState: ChatState.Open }),
  close: () => set({ uiState: ChatState.Closed }),
  sendMessage: (content) => set((state) => {
    if (state.uiState !== ChatState.Open && state.uiState !== ChatState.Received) return state
    return {
      uiState: ChatState.Sending,
      messages: [
        ...state.messages,
        createMessage('user', content, 'sent'),
        createMessage('assistant', '...', 'loading'),
      ],
    }
  }),
  receiveResponse: (content) => set((state) => ({
    uiState: ChatState.Received,
    messages: state.messages
      .filter((m) => m.status !== 'loading')
      .concat(createMessage('assistant', content, 'sent')),
  })),
  setError: (error) => set((state) => ({
    uiState: ChatState.Error,
    error,
    messages: state.messages.filter((m) => m.status !== 'loading'),
  })),
  retry: () => set((state) => {
    const lastUserMsg = [...state.messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMsg) return state
    return {
      uiState: ChatState.Sending,
      error: null,
      messages: [...state.messages, createMessage('assistant', '...', 'loading')],
    }
  }),
  reset: () => set({
    uiState: ChatState.Closed,
    error: null,
    messages: [
      createMessage('assistant', '你好！我是 Andy，你的 NanoClaw 助理。有什么可以帮你的？', 'sent'),
    ],
  }),
}))
