import { useQuery } from '@tanstack/react-query'
import { fetchDailyDigest } from '@/lib/api'
import { DAILY_DIGEST_REFRESH_INTERVAL } from '@/lib/constants'

export function useDailyDigest() {
  return useQuery({
    queryKey: ['dailyDigest'],
    queryFn: fetchDailyDigest,
    staleTime: DAILY_DIGEST_REFRESH_INTERVAL / 2,
    refetchInterval: DAILY_DIGEST_REFRESH_INTERVAL,
  })
}
