import { create } from 'zustand'

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
  open: () => void
  close: () => void
  sendMessage: (_content: string) => void
  receiveResponse: (_content: string) => void
  setError: (error: string) => void
  retry: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  uiState: ChatState.Closed,
  error: null,
  open: () => set({ uiState: ChatState.Open }),
  close: () => set({ uiState: ChatState.Closed }),
  sendMessage: () => set((state) =>
    state.uiState === ChatState.Open || state.uiState === ChatState.Received
      ? { uiState: ChatState.Sending }
      : state
  ),
  receiveResponse: () => set({ uiState: ChatState.Received }),
  setError: (error) => set({ uiState: ChatState.Error, error }),
  retry: () => set({ uiState: ChatState.Sending, error: null }),
}))
