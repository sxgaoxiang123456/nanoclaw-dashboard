import { createFileRoute } from '@tanstack/react-router'
import { useAgents } from '@/hooks/useAgents'

export const Route = createFileRoute('/agents')({
  component: AgentsPage,
})

// TODO(P1): Implement full Agent CRUD - list, create, edit, delete, start/stop
function AgentsPage() {
  const { data: agents } = useAgents()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-4xl mb-4">◉</div>
      <h1 className="text-xl font-semibold text-text mb-2">Agent 管理</h1>
      <p className="text-text2 mb-4">Agent CRUD 功能即将推出</p>
      <p className="text-text3 text-sm">当前共有 {agents?.length ?? 0} 个 Agent</p>
    </div>
  )
}
