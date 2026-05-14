function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

function trimTrailingZero(value: number, digits: number): string {
  return value.toFixed(digits).replace(/\.0+$/, '')
}

export function formatNumber(value: number): string {
  if (isNullish(value)) return '--'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  return `${sign}${absValue.toLocaleString('en-US')}`
}

export function formatCompactNumber(value: number): string {
  if (isNullish(value)) return '--'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1_000_000_000) {
    return `${sign}${trimTrailingZero(absValue / 1_000_000_000, 1)}b`
  }
  if (absValue >= 1_000_000) {
    return `${sign}${trimTrailingZero(absValue / 1_000_000, 1)}m`
  }
  if (absValue >= 1_000) {
    return `${sign}${trimTrailingZero(absValue / 1_000, 1)}k`
  }

  return `${sign}${absValue.toFixed(0)}`
}

export function formatCurrency(value: number): string {
  if (isNullish(value)) return '--'

  const formatted = Math.abs(value).toFixed(2)
  return `￥${value < 0 ? '-' : ''}${formatted}`
}

export function formatPercent(value: number): string {
  if (isNullish(value)) return '--'

  const percent = value * 100
  return `%${trimTrailingZero(percent, 1)}`
}

export function formatDuration(seconds: number): string {
  if (isNullish(seconds)) return '--'

  const absSeconds = Math.abs(seconds)
  const sign = seconds < 0 ? '-' : ''

  const h = Math.floor(absSeconds / 3600)
  const m = Math.floor((absSeconds % 3600) / 60)
  const s = absSeconds % 60

  let result = ''
  if (h > 0) result += `${h}h`
  if (m > 0) result += `${m}m`
  if (s > 0 || result === '') result += `${s}s`

  return `${sign}${result}`
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function formatRelativeTime(isoString: string): string {
  const now = new Date().getTime()
  const then = new Date(isoString).getTime()
  const diffMs = now - then

  if (diffMs < 0) return '未来'
  if (diffMs < 60_000) return '刚刚'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}分钟前`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}小时前`
  return `${Math.floor(diffMs / 86_400_000)}天前`
}
