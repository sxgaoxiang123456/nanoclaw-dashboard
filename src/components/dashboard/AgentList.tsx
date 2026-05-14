import type { Agent } from '@/types'
import { AgentRow } from './AgentRow'
import { Skeleton } from '@/components/ui/skeleton'

interface AgentListProps {
  agents: Agent[] | undefined
  isLoading: boolean
}

export function AgentList({ agents, isLoading }: AgentListProps) {
  const runningCount = agents?.filter((a) => a.status === 'running').length ?? 0

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-text">活跃 Agent</span>
        <span className="text-[11px] text-accent bg-accent-dim px-2 py-0.5 rounded-[var(--radius-badge)]">
          {runningCount} 运行中
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
            </div>
          ))}
        </div>
      )}

      {!isLoading && agents?.map((agent) => <AgentRow key={agent.id} agent={agent} />)}
    </div>
  )
}
