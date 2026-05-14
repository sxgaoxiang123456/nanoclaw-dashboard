import { formatCurrency } from '@/lib/formatters'

interface SecurityCardProps {
  icon: string
  title: string
  description: string
  status: string
  statusColor: string
}

export function SecurityCard({ icon, title, description, status, statusColor }: SecurityCardProps) {
  return (
    <div className="bg-bg border border-border rounded-[var(--radius-btn)] p-3.5">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-[13px] font-semibold text-text mb-1">{title}</div>
      <div className="text-[11px] text-text3 leading-relaxed whitespace-pre-line">{description}</div>
      <div className="text-[11px] font-medium mt-2" style={{ color: statusColor }}>
        ● {status}
      </div>
    </div>
  )
}
