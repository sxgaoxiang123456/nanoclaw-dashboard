import type { LogEntry } from '@/types'
import { LogRow } from './LogRow'
import { Skeleton } from '@/components/ui/skeleton'

interface LogListProps {
  logs: LogEntry[] | undefined
  isLoading: boolean
}

// TODO(P1-UX): Add empty state when logs array is empty.
// TODO(P2-UX): Add log type filter buttons (exec/create/config/error).

export function LogList({ logs, isLoading }: LogListProps) {
  return (
    <div
      className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]"
      style={{ minHeight: 240 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-text">最近执行日志</span>
        <span className="text-[11px] text-accent bg-accent-dim px-2 py-0.5 rounded-[var(--radius-badge)]">
          全部
        </span>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && logs?.map((log) => <LogRow key={log.id} log={log} />)}
    </div>
  )
}
