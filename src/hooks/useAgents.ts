import { useQuery } from '@tanstack/react-query'
import { fetchAgents } from '@/lib/api'
import { AGENT_REFRESH_INTERVAL } from '@/lib/constants'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    staleTime: AGENT_REFRESH_INTERVAL,
    refetchInterval: AGENT_REFRESH_INTERVAL,
  })
}
