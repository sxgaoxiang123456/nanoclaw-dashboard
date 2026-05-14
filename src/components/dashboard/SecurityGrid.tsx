import type { SecurityStatus } from '@/types'
import { SecurityCard } from './SecurityCard'
import { Skeleton } from '@/components/ui/skeleton'

interface SecurityGridProps {
  security: SecurityStatus | undefined
  isLoading: boolean
}

export function SecurityGrid({ security, isLoading }: SecurityGridProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-[var(--radius-btn)]" />
          ))}
        </div>
      </div>
    )
  }

  const overallColor =
    security?.overall === 'healthy'
      ? 'var(--color-green)'
      : security?.overall === 'warning'
        ? 'var(--color-yellow)'
        : 'var(--color-red)'

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-text">安全防线状态</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SecurityCard
          icon="💰"
          title="成本控制"
          description={`单次上限 ￥${(security?.costControl.singleLimit ?? 5).toFixed(2)}\n本月已用 ￥${(security?.costControl.monthlyUsed ?? 0).toFixed(2)} / ￥${(security?.costControl.monthlyLimit ?? 50).toFixed(2)}`}
          status={security?.costControl.status === 'healthy' ? '额度充裕' : '预警'}
          statusColor={security?.costControl.status === 'healthy' ? 'var(--color-green)' : 'var(--color-yellow)'}
        />
        <SecurityCard
          icon="🛡️"
          title="Skill 审核"
          description={`${security?.skillAudit.total ?? 0} 个第三方 Skill\n${security?.skillAudit.pending ?? 0} 个待审核`}
          status={security?.skillAudit.status === 'healthy' ? '无风险项' : '待审核'}
          statusColor={security?.skillAudit.status === 'healthy' ? 'var(--color-green)' : 'var(--color-yellow)'}
        />
        <SecurityCard
          icon="👤"
          title="人工审批"
          description={`高风险操作需审批\n${security?.manualApproval.pendingRequests ?? 0} 条待处理请求`}
          status={security?.manualApproval.status === 'healthy' ? '无待审批' : '待处理'}
          statusColor={security?.manualApproval.status === 'healthy' ? 'var(--color-green)' : 'var(--color-yellow)'}
        />
      </div>

      <div className="mt-4 p-3 bg-bg rounded-[var(--radius-btn)] border border-border">
        <div className="text-xs text-text2 flex items-center gap-2">
          <span style={{ color: overallColor }}>●</span>
          所有防线正常 · 最后检查 {security?.lastCheckedAt ? new Date(security.lastCheckedAt).toLocaleTimeString('zh-CN') : '--'}
        </div>
      </div>
    </div>
  )
}
