import { createFileRoute } from '@tanstack/react-router'
import { useAgents } from '@/hooks/useAgents'
import { useDailyDigest } from '@/hooks/useDailyDigest'
import { useContentGeneration } from '@/hooks/useContentGeneration'
import { AgentTable } from '@/components/agents/AgentTable'
import { DailyDigestPanel } from '@/components/dashboard/DailyDigestPanel'
import { ContentGenerationPanel } from '@/components/dashboard/ContentGenerationPanel'
import { publishArticle } from '@/lib/api'

export const Route = createFileRoute('/agents')({
  component: AgentsPage,
})

function AgentsPage() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: dailyDigest, isLoading: digestLoading } = useDailyDigest()
  const { data: contentGen, isLoading: contentGenLoading } = useContentGeneration()

  return (
    <div className="space-y-5">
      <AgentTable agents={agents} isLoading={agentsLoading} />
      <DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
      <ContentGenerationPanel
        data={contentGen}
        isLoading={contentGenLoading}
        onPublish={(taskId, platform) => publishArticle(taskId, platform)}
      />
    </div>
  )
}
