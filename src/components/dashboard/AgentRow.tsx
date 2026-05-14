import type { Agent } from '@/types'

const avatarColors: Record<string, string> = {
  '🐾': 'rgba(255, 140, 26, 0.35)',
  '⚡': 'rgba(168, 85, 247, 0.3)',
  '🔍': 'rgba(59, 130, 246, 0.3)',
  '📋': 'rgba(34, 197, 94, 0.3)',
  '📊': 'rgba(161, 161, 161, 0.3)',
}

// TODO(P2-UX): Add click-to-expand detail panel and action buttons (start/pause/delete).

interface AgentRowProps {
  agent: Agent
}

export function AgentRow({ agent }: AgentRowProps) {
  const bgColor = avatarColors[agent.avatar] || 'rgba(161, 161, 161, 0.15)'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {agent.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text">{agent.name}</div>
        <div className="text-xs text-text3 truncate">
          {agent.description} · {agent.model}
        </div>
      </div>
      <span
        className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-badge)] font-medium flex-shrink-0 ${
          agent.status === 'running'
            ? 'bg-green/25 text-green'
            : 'bg-red/25 text-red'
        }`}
      >
        {agent.status === 'running' ? '运行中' : '已暂停'}
      </span>
    </div>
  )
}
