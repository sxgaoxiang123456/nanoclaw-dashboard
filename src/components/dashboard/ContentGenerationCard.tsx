import { useState } from 'react'
import type { PlatformArticle, PublishResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { WriterProgress } from './WriterProgress'
import type { AgentExecutionStatus } from '@/types'

interface ContentGenerationCardProps {
  platform: 'xiaohongshu' | 'wechat' | 'weibo'
  status: AgentExecutionStatus
  article: PlatformArticle | null | undefined
  onPublish?: (platform: 'xiaohongshu' | 'wechat' | 'weibo') => Promise<PublishResponse>
}

const PLATFORM_CONFIG: Record<string, { icon: string; name: string; color: string }> = {
  xiaohongshu: { icon: '🔴', name: '小红书', color: 'text-red-400' },
  wechat: { icon: '💬', name: '微信公众号', color: 'text-green-400' },
  weibo: { icon: '👁️', name: '微博', color: 'text-yellow-400' },
}

type PublishState = 'idle' | 'publishing' | 'published' | 'failed'

export function ContentGenerationCard({ platform, status, article, onPublish }: ContentGenerationCardProps) {
  const config = PLATFORM_CONFIG[platform]
  const [publishState, setPublishState] = useState<PublishState>('idle')
  const [publishResult, setPublishResult] = useState<PublishResponse | null>(null)

  const handlePublish = async () => {
    if (!onPublish || publishState === 'publishing') return
    if (publishState === 'published') {
      if (!confirm('该文章已推送，是否重新推送？')) return
    }

    setPublishState('publishing')
    try {
      const result = await onPublish(platform)
      setPublishResult(result)
      setPublishState(result.success ? 'published' : 'failed')
    } catch {
      setPublishState('failed')
    }
  }

  const isCompleted = status.status === 'completed'
  const isFailed = status.status === 'failed'

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`text-sm font-semibold ${config.color}`}>{config.name}</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-[var(--radius-badge)] ${
          isCompleted ? 'bg-green-500/20 text-green-400' :
          isFailed ? 'bg-red-500/20 text-red-400' :
          status.status === 'running' ? 'bg-accent/20 text-accent' :
          'bg-text2/20 text-text2'
        }`}>
          {isCompleted ? '已完成' : isFailed ? '失败' : status.status === 'running' ? '进行中' : '排队中'}
        </span>
      </div>

      <WriterProgress status={status} />

      {article && (
        <div className="mt-3 pt-3 border-t border-border">
          <h4 className="text-sm font-medium text-text mb-1 line-clamp-1">{article.title}</h4>
          <div className="text-xs text-text2 line-clamp-4 mb-2 whitespace-pre-wrap">{article.content}</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text3">{article.wordCount} 字 · {article.styleGuide}</span>
            {onPublish && (
              <Button
                size="sm"
                variant={publishState === 'published' ? 'outline' : 'default'}
                disabled={publishState === 'publishing'}
                onClick={handlePublish}
                className="h-7 text-xs px-3"
              >
                {publishState === 'idle' && '推送'}
                {publishState === 'publishing' && '推送中...'}
                {publishState === 'published' && '已推送'}
                {publishState === 'failed' && '重试'}
              </Button>
            )}
          </div>
          {publishResult?.success && publishResult.publishedAt && (
            <p className="text-[10px] text-green-400 mt-1">
              已于 {new Date(publishResult.publishedAt).toLocaleString('zh-CN')} 推送
            </p>
          )}
          {publishResult?.error && publishState === 'failed' && (
            <p className="text-[10px] text-red-400 mt-1">{publishResult.error}</p>
          )}
        </div>
      )}

      {!article && !isFailed && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-text2 text-center py-4">
          文章生成中...
        </div>
      )}

      {!article && isFailed && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-red-400 text-center py-4">
          {status.error || '生成失败'}
        </div>
      )}
    </div>
  )
}
