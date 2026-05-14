import { useQuery } from '@tanstack/react-query'
import { fetchSecurityStatus } from '@/lib/api'

export function useSecurityStatus() {
  return useQuery({
    queryKey: ['security'],
    queryFn: fetchSecurityStatus,
    staleTime: 60 * 1000,
  })
}
