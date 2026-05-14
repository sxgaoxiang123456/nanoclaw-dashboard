import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '@/lib/api'
import { DASHBOARD_REFRESH_INTERVAL } from '@/lib/constants'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchDashboardStats,
    staleTime: DASHBOARD_REFRESH_INTERVAL,
  })
}
