import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <div className="p-8 text-accent">Dashboard Page</div>
}
