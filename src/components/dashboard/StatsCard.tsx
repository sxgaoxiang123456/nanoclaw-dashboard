import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters'

interface StatsCardProps {
  title: string
  icon: string
  value: number | string
  subtitle: string
  trend?: { direction: 'up' | 'down'; value: number }
  progress?: { value: number; color: 'accent' | 'green' | 'blue' }
  chart?: number[]
  isLoading?: boolean
  format?: 'number' | 'currency'
}

export function StatsCard({
  title,
  icon,
  value,
  subtitle,
  trend,
  progress,
  chart,
  isLoading,
  format = 'number',
}: StatsCardProps) {
  const displayValue =
    typeof value === 'string'
      ? value
      : format === 'currency'
        ? formatCurrency(value)
        : formatNumber(value)

  const progressColors = {
    accent: 'var(--color-accent)',
    green: 'var(--color-green)',
    blue: 'var(--color-blue)',
  }

  const chartMax = chart ? Math.max(...chart) : 0

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-text2">{title}</span>
            <span className="text-base">{icon}</span>
          </div>

          <div className="text-5xl font-bold text-accent leading-none mb-2">
            {displayValue}
          </div>

          <div className="text-[13px] text-text2 mb-3">
            {subtitle}
            {trend && (
              <span
                className="ml-1"
                style={{ color: trend.direction === 'up' ? 'var(--color-green)' : 'var(--color-red)' }}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {formatPercent(Math.abs(trend.value))}
              </span>
            )}
          </div>

          {progress && (
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress.value, 100)}%`,
                  backgroundColor: progressColors[progress.color],
                }}
              />
            </div>
          )}

          {chart && (
            <div className="flex items-end gap-[3px] h-9 mt-2">
              {chart.map((h, i) => {
                const height = Math.max((h / chartMax) * 36, 4)
                const isLast = i === chart.length - 1
                return (
                  <div
                    key={i}
                    className="flex-1 bg-accent rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${height}px`,
                      opacity: isLast ? 1 : 0.4,
                    }}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
