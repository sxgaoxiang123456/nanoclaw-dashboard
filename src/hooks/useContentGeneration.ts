import { useQuery } from '@tanstack/react-query'
import { fetchContentGeneration } from '@/lib/api'

export function useContentGeneration() {
  return useQuery({
    queryKey: ['contentGeneration'],
    queryFn: fetchContentGeneration,
    refetchInterval: 3000,
  })
}
