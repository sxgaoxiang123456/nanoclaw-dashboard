import { createFileRoute } from '@tanstack/react-router'
import { useSecurityStatus } from '@/hooks/useSecurityStatus'
import { SecurityGrid } from '@/components/dashboard/SecurityGrid'

export const Route = createFileRoute('/security')({
  component: SecurityPage,
})

function SecurityPage() {
  const { data: security, isLoading } = useSecurityStatus()

  return (
    <div>
      <h1 className="text-xl font-semibold text-text mb-4">安全中心</h1>
      <SecurityGrid security={security} isLoading={isLoading} />
    </div>
  )
}
