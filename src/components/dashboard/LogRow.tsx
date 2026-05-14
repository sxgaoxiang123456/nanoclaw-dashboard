import type { LogEntry } from '@/types'
import { formatTime } from '@/lib/formatters'

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  exec: { bg: 'rgba(168, 85, 247, 0.15)', text: 'var(--color-purple)', label: '执行' },
  create: { bg: 'rgba(59, 130, 246, 0.15)', text: 'var(--color-blue)', label: '新建' },
  config: { bg: 'rgba(161, 161, 161, 0.15)', text: 'var(--color-text2)', label: '配置' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-red)', label: '错误' },
}

interface LogRowProps {
  log: LogEntry
}

export function LogRow({ log }: LogRowProps) {
  const style = typeStyles[log.type] || typeStyles.config

  return (
    <div className="flex gap-3 py-2 border-b border-border last:border-b-0 text-xs">
      <span className="text-text3 flex-shrink-0 w-[52px]">{formatTime(log.time)}</span>
      <span
        className="px-1.5 py-px rounded-[var(--radius-badge)] text-[10px] font-semibold flex-shrink-0 h-fit"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
      <span className="text-text2 flex-1 truncate">{log.message}</span>
    </div>
  )
}
