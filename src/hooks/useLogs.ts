import { useQuery } from '@tanstack/react-query'
import { fetchLogs } from '@/lib/api'
import { LOG_REFRESH_INTERVAL } from '@/lib/constants'

export function useLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: fetchLogs,
    staleTime: LOG_REFRESH_INTERVAL,
    refetchInterval: LOG_REFRESH_INTERVAL,
  })
}
