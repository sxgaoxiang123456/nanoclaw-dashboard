import type { ContentGenerationResponse, PublishResponse } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ContentGenerationCard } from './ContentGenerationCard'

interface ContentGenerationPanelProps {
  data: ContentGenerationResponse | undefined
  isLoading: boolean
  onPublish?: (taskId: string, platform: 'xiaohongshu' | 'wechat' | 'weibo') => Promise<PublishResponse>
}

const STATUS_LABELS: Record<string, string> = {
  idle: '空闲',
  researching: '研究中',
  writing: '写作中',
  completed: '已完成',
  failed: '失败',
}

export function ContentGenerationPanel({ data, isLoading, onPublish }: ContentGenerationPanelProps) {
  const status = data?.status ?? 'idle'
  const agents = data?.agents ?? {}

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)] mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-text">多平台内容生成</span>
        </div>
        <div className="flex items-center gap-3">
          {data?.topic && (
            <span className="text-xs text-text2 truncate max-w-[200px]">
              话题: {data.topic}
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-[var(--radius-badge)] ${
            status === 'completed' ? 'bg-green-500/20 text-green-400' :
            status === 'failed' ? 'bg-red-500/20 text-red-400' :
            status === 'idle' ? 'bg-text2/20 text-text2' :
            'bg-accent/20 text-accent'
          }`}>
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && status === 'idle' && (
        <div className="text-sm text-text2 py-8 text-center">
          在 Chat 中输入话题开始生成内容，例如：/generate AI 技术趋势
        </div>
      )}

      {!isLoading && status !== 'idle' && (
        <div className="grid grid-cols-3 gap-4">
          <ContentGenerationCard
            platform="xiaohongshu"
            status={agents['writer-xiaohongshu'] ?? { agentName: 'writer-xiaohongshu', status: 'queued' }}
            article={data?.results?.xiaohongshu}
            onPublish={onPublish && data?.taskId ? (platform) => onPublish(data.taskId!, platform) : undefined}
          />
          <ContentGenerationCard
            platform="wechat"
            status={agents['writer-wechat'] ?? { agentName: 'writer-wechat', status: 'queued' }}
            article={data?.results?.wechat}
            onPublish={onPublish && data?.taskId ? (platform) => onPublish(data.taskId!, platform) : undefined}
          />
          <ContentGenerationCard
            platform="weibo"
            status={agents['writer-weibo'] ?? { agentName: 'writer-weibo', status: 'queued' }}
            article={data?.results?.weibo}
            onPublish={onPublish && data?.taskId ? (platform) => onPublish(data.taskId!, platform) : undefined}
          />
        </div>
      )}
    </div>
  )
}
