import { createFileRoute } from '@tanstack/react-router'
import { useAgents } from '@/hooks/useAgents'
import { useDailyDigest } from '@/hooks/useDailyDigest'
import { AgentTable } from '@/components/agents/AgentTable'
import { DailyDigestPanel } from '@/components/dashboard/DailyDigestPanel'

export const Route = createFileRoute('/agents')({
  component: AgentsPage,
})

function AgentsPage() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: dailyDigest, isLoading: digestLoading } = useDailyDigest()

  return (
    <div className="space-y-5">
      <AgentTable agents={agents} isLoading={agentsLoading} />
      <DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
    </div>
  )
}
