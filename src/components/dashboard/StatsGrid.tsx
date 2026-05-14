import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/formatters'
import { StatsCard } from './StatsCard'

interface StatsGridProps {
  stats: DashboardStats | undefined
  isLoading: boolean
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const todayExecs = stats?.todayExecutions ?? 0
  const yesterdayExecs = stats?.yesterdayExecutions ?? 0

  const trend = yesterdayExecs > 0
    ? {
        direction: (todayExecs >= yesterdayExecs ? 'up' : 'down') as 'up' | 'down',
        value: Math.abs((todayExecs - yesterdayExecs) / yesterdayExecs),
      }
    : undefined

  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <StatsCard
        title="Agent 总数"
        icon="◉"
        value={stats?.agentCount ?? 0}
        subtitle={`运行中 ${stats?.runningAgents ?? 0} · 暂停 ${stats?.pausedAgents ?? 0}`}
        progress={{ value: 100, color: 'accent' }}
        isLoading={isLoading}
      />
      <StatsCard
        title="Skills 总数"
        icon="✦"
        value={stats?.skillCount ?? 0}
        subtitle={`自定义 ${stats?.customSkills ?? 0} · 第三方 ${stats?.thirdPartySkills ?? 0}`}
        progress={{ value: 35, color: 'accent' }}
        isLoading={isLoading}
      />
      <StatsCard
        title="今日执行"
        icon="▷"
        value={todayExecs}
        subtitle="较昨日同期"
        trend={trend}
        progress={{ value: 70, color: 'green' }}
        isLoading={isLoading}
      />
      <StatsCard
        title="API 消耗"
        icon="$"
        value={stats?.todayCost ?? 0}
        subtitle={`今日 · 本月 ${formatCurrency(stats?.monthlyCost ?? 0)}`}
        format="currency"
        chart={[8, 14, 20, 12, 28, 16, 24, 18, 10, 22, 8, 36]}
        isLoading={isLoading}
      />
    </div>
  )
}
