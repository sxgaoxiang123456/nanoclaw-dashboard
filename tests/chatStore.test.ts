import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStore, ChatState } from '@/stores/chatStore'

describe('chatStore', () => {
  beforeEach(() => {
    act(() => useChatStore.getState().reset())
  })

  it('初始状态为 closed', () => {
    const { result } = renderHook(() => useChatStore())
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('调用 open 后变为 open 状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    expect(result.current.uiState).toBe(ChatState.Open)
  })

  it('调用 close 后回到 closed 状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.close())
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('open 状态下发送消息变为 sending 并添加用户消息和 loading', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    expect(result.current.uiState).toBe(ChatState.Sending)
    const msgs = result.current.messages
    expect(msgs[msgs.length - 2].role).toBe('user')
    expect(msgs[msgs.length - 2].content).toBe('hello')
    expect(msgs[msgs.length - 1].role).toBe('assistant')
    expect(msgs[msgs.length - 1].status).toBe('loading')
  })

  it('sending 后收到回复变为 received 并替换 loading', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.receiveResponse('world'))
    expect(result.current.uiState).toBe(ChatState.Received)
    const msgs = result.current.messages
    expect(msgs[msgs.length - 1].content).toBe('world')
    expect(msgs[msgs.length - 1].status).toBe('sent')
    expect(msgs.some((m) => m.status === 'loading')).toBe(false)
  })

  it('sending 出错变为 error 状态并移除 loading', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    const beforeCount = result.current.messages.length
    act(() => result.current.setError('network error'))
    expect(result.current.uiState).toBe(ChatState.Error)
    expect(result.current.error).toBe('network error')
    expect(result.current.messages.length).toBe(beforeCount - 1)
    expect(result.current.messages.some((m) => m.status === 'loading')).toBe(false)
  })

  it('error 状态下重试回到 sending 并添加 loading', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.setError('network error'))
    const beforeCount = result.current.messages.length
    act(() => result.current.retry())
    expect(result.current.uiState).toBe(ChatState.Sending)
    expect(result.current.error).toBeNull()
    expect(result.current.messages.length).toBe(beforeCount + 1)
    expect(result.current.messages[result.current.messages.length - 1].status).toBe('loading')
  })

  it('closed 状态下发送消息不改变状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.sendMessage('hello'))
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('sending 状态下不能并发发送第二条消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('first'))
    const beforeCount = result.current.messages.length
    act(() => result.current.sendMessage('second'))
    expect(result.current.uiState).toBe(ChatState.Sending)
    expect(result.current.messages.length).toBe(beforeCount)
  })

  it('received 状态下可以继续发送新消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.receiveResponse('world'))
    const beforeCount = result.current.messages.length
    act(() => result.current.sendMessage('again'))
    expect(result.current.uiState).toBe(ChatState.Sending)
    expect(result.current.messages.length).toBe(beforeCount + 2)
  })

  it('error 状态下直接发送消息不改变状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.setError('fail'))
    act(() => result.current.sendMessage('retry-msg'))
    expect(result.current.uiState).toBe(ChatState.Error)
  })

  it('任意状态下 close 都回到 closed', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.close())
    expect(result.current.uiState).toBe(ChatState.Closed)
  })
})
