import type { Workflow } from '@/types'
import { WorkflowRow } from './WorkflowRow'
import { Skeleton } from '@/components/ui/skeleton'

interface WorkflowStatusProps {
  workflows: Workflow[] | undefined
  isLoading: boolean
}

export function WorkflowStatus({ workflows, isLoading }: WorkflowStatusProps) {
  const counts = {
    queued: workflows?.filter((w) => w.status === 'queued').length ?? 0,
    running: workflows?.filter((w) => w.status === 'running').length ?? 0,
    completed: workflows?.filter((w) => w.status === 'completed').length ?? 0,
  }

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-text">工作流执行状态</span>
      </div>

      {/* Status counts */}
      <div className="flex gap-3 mb-4">
        <CountCard count={counts.queued} label="排队中" color="text3" />
        <CountCard count={counts.running} label="执行中" color="accent" highlight />
        <CountCard count={counts.completed} label="已完成" color="green" />
      </div>

      {/* Workflow list */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-[var(--radius-btn)]" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && workflows?.slice(0, 5).map((workflow) => (
        <WorkflowRow key={workflow.id} workflow={workflow} />
      ))}
    </div>
  )
}

function CountCard({
  count,
  label,
  color,
  highlight,
}: {
  count: number
  label: string
  color: 'text3' | 'accent' | 'green'
  highlight?: boolean
}) {
  const colorMap = {
    text3: 'text-text3',
    accent: 'text-accent',
    green: 'text-green',
  }

  return (
    <div
      className={`flex-1 rounded-[var(--radius-btn)] p-3 text-center ${
        highlight ? 'bg-accent-dim border border-accent/30' : 'bg-bg'
      }`}
    >
      <div className={`text-[28px] font-bold ${colorMap[color]}`}>{count}</div>
      <div className={`text-[11px] mt-1 ${colorMap[color]}`}>{label}</div>
    </div>
  )
}
