import type { DailyDigestResponse } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

interface DailyDigestPanelProps {
  data: DailyDigestResponse | undefined
  isLoading: boolean
}

function formatSentAt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '未安排'
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `今天 ${timeStr}`
  const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  return `${dateStr} ${timeStr}`
}

export function DailyDigestPanel({ data, isLoading }: DailyDigestPanelProps) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)] mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span className="text-sm font-semibold text-text">AI 技术日报</span>
        </div>
        <div className="flex items-center gap-3">
          {data?.mock && (
            <span className="text-[10px] text-text2 bg-bg px-2 py-0.5 rounded-[var(--radius-badge)] border border-border">
              模拟数据
            </span>
          )}
          <span className="text-xs text-text2">
            下次：{formatNextRun(data?.nextRun ?? null)}
          </span>
          {data?.recurrence && (
            <span className="text-[10px] text-accent bg-accent-dim px-2 py-0.5 rounded-[var(--radius-badge)] font-mono">
              {data.recurrence}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.recentDigests || data.recentDigests.length === 0) && (
        <div className="text-sm text-text2 py-8 text-center">暂无日报记录</div>
      )}

      {!isLoading && data?.recentDigests.map((digest) => (
        <div key={digest.sentAt} className="mb-4 last:mb-0">
          <div className="flex items-center gap-2 text-xs text-text2 mb-2 pb-2 border-b border-border">
            <span>{formatSentAt(digest.sentAt)}</span>
            <span>·</span>
            <span>{digest.itemCount} 条</span>
            <span>·</span>
            <span>{digest.trigger === 'manual' ? '手动触发' : '定时触发'}</span>
          </div>

          {digest.items && digest.items.length > 0 ? (
            <div className="space-y-3">
              {digest.items.map((item, idx) => (
                <div key={idx} className="group">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1 text-sm font-medium text-text hover:text-accent transition-colors"
                  >
                    <span className="mt-0.5">·</span>
                    <span className="flex-1">{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-text2" />
                  </a>
                  <p className="text-xs text-text2 ml-3.5 mt-0.5 line-clamp-2">{item.summary}</p>
                  <span className="text-[10px] text-text3 ml-3.5 mt-0.5 inline-block bg-bg px-1.5 py-0.5 rounded-[var(--radius-badge)]">
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-text2 ml-3.5 py-1">摘要暂不可用（历史记录）</div>
          )}
        </div>
      ))}
    </div>
  )
}
