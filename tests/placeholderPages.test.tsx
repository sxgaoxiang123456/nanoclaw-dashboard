import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('placeholder pages', () => {
  it('agents page renders with correct title', async () => {
    const { Route } = await import('@/routes/agents')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('Agent 管理')).toBeInTheDocument()
    expect(screen.getByText(/Agent CRUD 功能即将推出/)).toBeInTheDocument()
  })

  it('skills page renders with correct title', async () => {
    const { Route } = await import('@/routes/skills')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('Skills 市场')).toBeInTheDocument()
    expect(screen.getByText(/Skills 浏览与安装功能即将推出/)).toBeInTheDocument()
  })

  it('workflows page renders with correct title', async () => {
    const { Route } = await import('@/routes/workflows')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('工作流编排')).toBeInTheDocument()
    expect(screen.getByText(/工作流编排功能即将推出/)).toBeInTheDocument()
  })

  it('logs page renders with correct title', async () => {
    const { Route } = await import('@/routes/logs')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('运行日志')).toBeInTheDocument()
    expect(screen.getByText(/实时日志推送功能即将推出/)).toBeInTheDocument()
  })

  it('security page renders with correct title and security grid', async () => {
    const { Route } = await import('@/routes/security')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('安全中心')).toBeInTheDocument()
  })

  it('settings page renders with correct title', async () => {
    const { Route } = await import('@/routes/settings')
    render(<Route.options.component />, { wrapper: Wrapper })
    expect(screen.getByText('系统设置')).toBeInTheDocument()
    expect(screen.getByText(/主题切换等设置功能即将推出/)).toBeInTheDocument()
  })
})
