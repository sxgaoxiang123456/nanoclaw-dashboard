import { createFileRoute } from '@tanstack/react-router'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAgents } from '@/hooks/useAgents'
import { useWorkflows } from '@/hooks/useWorkflows'
import { useLogs } from '@/hooks/useLogs'
import { useSecurityStatus } from '@/hooks/useSecurityStatus'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { AgentList } from '@/components/dashboard/AgentList'
import { WorkflowStatus } from '@/components/dashboard/WorkflowStatus'
import { LogList } from '@/components/dashboard/LogList'
import { SecurityGrid } from '@/components/dashboard/SecurityGrid'
import { ChatPanel } from '@/components/chat/ChatPanel'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: workflows, isLoading: workflowsLoading } = useWorkflows()
  const { data: logs, isLoading: logsLoading } = useLogs()
  const { data: security, isLoading: securityLoading } = useSecurityStatus()

  return (
    <div>
      <StatsGrid stats={stats} isLoading={statsLoading} />

      <div className="grid grid-cols-2 gap-4 mb-5">
        <AgentList agents={agents} isLoading={agentsLoading} />
        <WorkflowStatus workflows={workflows} isLoading={workflowsLoading} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LogList logs={logs} isLoading={logsLoading} />
        <SecurityGrid security={security} isLoading={securityLoading} />
      </div>

      <ChatPanel />
    </div>
  )
}
