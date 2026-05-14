import { useQuery } from '@tanstack/react-query'
import { fetchWorkflows } from '@/lib/api'
import { AGENT_REFRESH_INTERVAL } from '@/lib/constants'

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows,
    staleTime: AGENT_REFRESH_INTERVAL,
    refetchInterval: AGENT_REFRESH_INTERVAL,
  })
}
