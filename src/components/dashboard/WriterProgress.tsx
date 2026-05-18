import type { AgentExecutionStatus } from '@/types'

interface WriterProgressProps {
  status: AgentExecutionStatus
}

const STATUS_LABELS: Record<string, string> = {
  queued: '排队中',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
}

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-text2',
  running: 'bg-accent',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
}

export function WriterProgress({ status }: WriterProgressProps) {
  const progress = status.progress ?? 0
  const stage = status.stage ?? STATUS_LABELS[status.status] ?? status.status

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text2">{stage}</span>
        <span className={`font-mono ${status.status === 'failed' ? 'text-red-400' : status.status === 'completed' ? 'text-green-400' : 'text-text2'}`}>
          {status.status === 'completed' ? '100%' : `${progress}%`}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status.status] || 'bg-text2'}`}
          style={{ width: `${status.status === 'completed' ? 100 : progress}%` }}
        />
      </div>
      {status.error && (
        <p className="text-[10px] text-red-400">{status.error}</p>
      )}
    </div>
  )
}
