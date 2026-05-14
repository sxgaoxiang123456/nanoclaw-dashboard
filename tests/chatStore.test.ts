import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStore, ChatState } from '@/stores/chatStore'

describe('chatStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.close())
  })

  it('初始状态为 closed', () => {
    const { result } = renderHook(() => useChatStore())
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('调用 open 后变为 open 状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => {
      result.current.open()
    })
    expect(result.current.uiState).toBe(ChatState.Open)
  })

  it('调用 close 后回到 closed 状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => {
      result.current.open()
    })
    expect(result.current.uiState).toBe(ChatState.Open)
    act(() => {
      result.current.close()
    })
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('open 状态下发送消息变为 sending', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    expect(result.current.uiState).toBe(ChatState.Sending)
  })

  it('sending 后收到回复变为 received', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.receiveResponse('world'))
    expect(result.current.uiState).toBe(ChatState.Received)
  })

  it('sending 出错变为 error 状态并记录错误信息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.setError('network error'))
    expect(result.current.uiState).toBe(ChatState.Error)
    expect(result.current.error).toBe('network error')
  })

  it('error 状态下重试回到 sending', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.setError('network error'))
    act(() => result.current.retry())
    expect(result.current.uiState).toBe(ChatState.Sending)
    expect(result.current.error).toBeNull()
  })

  it('closed 状态下发送消息不改变状态', () => {
    const { result } = renderHook(() => useChatStore())
    expect(result.current.uiState).toBe(ChatState.Closed)
    act(() => result.current.sendMessage('hello'))
    expect(result.current.uiState).toBe(ChatState.Closed)
  })

  it('sending 状态下不能并发发送第二条消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('first'))
    expect(result.current.uiState).toBe(ChatState.Sending)
    act(() => result.current.sendMessage('second'))
    expect(result.current.uiState).toBe(ChatState.Sending)
  })

  it('received 状态下可以继续发送新消息', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.receiveResponse('world'))
    expect(result.current.uiState).toBe(ChatState.Received)
    act(() => result.current.sendMessage('again'))
    expect(result.current.uiState).toBe(ChatState.Sending)
  })

  it('error 状态下直接发送消息不改变状态', () => {
    const { result } = renderHook(() => useChatStore())
    act(() => result.current.open())
    act(() => result.current.sendMessage('hello'))
    act(() => result.current.setError('fail'))
    expect(result.current.uiState).toBe(ChatState.Error)
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
