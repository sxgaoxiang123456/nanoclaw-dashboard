import { createFileRoute } from '@tanstack/react-router'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAgents } from '@/hooks/useAgents'
import { useWorkflows } from '@/hooks/useWorkflows'
import { useLogs } from '@/hooks/useLogs'
import { useSecurityStatus } from '@/hooks/useSecurityStatus'
import { useDailyDigest } from '@/hooks/useDailyDigest'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { AgentList } from '@/components/dashboard/AgentList'
import { WorkflowStatus } from '@/components/dashboard/WorkflowStatus'
import { LogList } from '@/components/dashboard/LogList'
import { SecurityGrid } from '@/components/dashboard/SecurityGrid'
import { DailyDigestPanel } from '@/components/dashboard/DailyDigestPanel'
export const Route = createFileRoute('/')({
  component: DashboardPage,
})

// TODO(P1-ARCH): Add error boundary around each dashboard section.
// TODO(P1-UX): Pass error states from useQuery hooks down to components for error UI.
function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: workflows, isLoading: workflowsLoading } = useWorkflows()
  const { data: logs, isLoading: logsLoading } = useLogs()
  const { data: security, isLoading: securityLoading } = useSecurityStatus()
  const { data: dailyDigest, isLoading: digestLoading } = useDailyDigest()

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

      <DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
    </div>
  )
}
