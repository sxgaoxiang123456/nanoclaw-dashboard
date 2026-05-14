import type { Workflow } from '@/types'
import { formatRelativeTime } from '@/lib/formatters'

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  queued: { bg: 'rgba(161, 161, 161, 0.25)', text: 'var(--color-text3)', label: '排队中' },
  running: { bg: 'rgba(255, 140, 26, 0.3)', text: 'var(--color-accent)', label: '执行中' },
  completed: { bg: 'rgba(34, 197, 94, 0.25)', text: 'var(--color-green)', label: '成功' },
  failed: { bg: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-red)', label: '失败' },
}

const iconConfig: Record<string, string> = {
  queued: '⏳',
  running: '💬',
  completed: '✓',
  failed: '✗',
}

interface WorkflowRowProps {
  workflow: Workflow
}

export function WorkflowRow({ workflow }: WorkflowRowProps) {
  const config = statusConfig[workflow.status] || statusConfig.queued
  const icon = iconConfig[workflow.status] || '◉'

  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-border last:border-b-0">
      <div
        className="w-8 h-8 rounded-[var(--radius-btn)] flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: config.bg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-text">{workflow.name}</div>
        <div className="text-[11px] text-text3">
          {workflow.status === 'running'
            ? '进行中'
            : workflow.status === 'completed'
              ? '完成'
              : workflow.status === 'failed'
                ? '失败'
                : '排队中'}{' '}
          · {formatRelativeTime(workflow.startedAt)}
        </div>
      </div>
      <span className="text-[11px] flex-shrink-0" style={{ color: config.text }}>
        {config.label}
      </span>
    </div>
  )
}
