import type { Agent } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface AgentTableProps {
  agents: Agent[] | undefined
  isLoading: boolean
}

const avatarColors: Record<string, string> = {
  '🐾': 'rgba(255, 140, 26, 0.35)',
  '⚡': 'rgba(168, 85, 247, 0.3)',
  '🔍': 'rgba(59, 130, 246, 0.3)',
  '📋': 'rgba(34, 197, 94, 0.3)',
  '📊': 'rgba(161, 161, 161, 0.3)',
}

export function AgentTable({ agents, isLoading }: AgentTableProps) {
  const runningCount = agents?.filter((a) => a.status === 'running').length ?? 0

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">◉</span>
          <span className="text-sm font-semibold text-text">Agent 列表</span>
        </div>
        <span className="text-[11px] text-accent bg-accent-dim px-2 py-0.5 rounded-[var(--radius-badge)]">
          {runningCount} 运行中 / {agents?.length ?? 0} 总计
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="w-full">
          {/* 表头 */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 text-xs text-text3 font-medium border-b border-border pb-2 mb-1 px-1">
            <div className="w-10"></div>
            <div>名称 / 描述</div>
            <div>模型</div>
            <div className="text-right">状态</div>
          </div>

          {/* 表体 */}
          {agents && agents.length > 0 ? (
            <div className="divide-y divide-border">
              {agents.map((agent) => {
                const bgColor = avatarColors[agent.avatar] || 'rgba(161, 161, 161, 0.15)'
                return (
                  <div
                    key={agent.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center py-3 px-1 hover:bg-bg/50 transition-colors rounded-sm"
                  >
                    <div className="w-10 flex justify-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: bgColor }}
                      >
                        {agent.avatar}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text">{agent.name}</div>
                      <div className="text-xs text-text3 truncate">{agent.description}</div>
                    </div>
                    <div className="text-xs text-text2 truncate">{agent.model}</div>
                    <div className="text-right">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-badge)] font-medium ${
                          agent.status === 'running'
                            ? 'bg-green/25 text-green'
                            : 'bg-red/25 text-red'
                        }`}
                      >
                        {agent.status === 'running' ? '运行中' : '已暂停'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-text2 py-8 text-center">暂无 Agent</div>
          )}
        </div>
      )}
    </div>
  )
}
