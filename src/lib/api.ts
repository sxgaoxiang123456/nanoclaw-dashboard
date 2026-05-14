import type { Agent, DashboardStats, LogEntry, SecurityStatus, Workflow } from '@/types'
import { API_BASE_URL, CHAT_TIMEOUT_MS } from './constants'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, timeoutMs = 30000): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`)
    }

    return response.json() as Promise<T>
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error')
  }
}

// Dashboard APIs
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/stats')
}

export async function fetchAgents(): Promise<Agent[]> {
  return request<Agent[]>('/agents')
}

export async function fetchWorkflows(): Promise<Workflow[]> {
  return request<Workflow[]>('/workflows')
}

export async function fetchLogs(): Promise<LogEntry[]> {
  return request<LogEntry[]>('/logs')
}

export async function fetchSecurityStatus(): Promise<SecurityStatus> {
  return request<SecurityStatus>('/security')
}

// Chat API
export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  return request<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }, CHAT_TIMEOUT_MS)
}

export { ApiError }
