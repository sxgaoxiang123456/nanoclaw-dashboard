import { createFileRoute } from '@tanstack/react-router'
import { useSidebarStore } from '@/stores/sidebarStore'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { collapsed, toggle } = useSidebarStore()
  return (
    <div className="p-8">
      <p className="text-accent">Sidebar: {collapsed ? 'collapsed' : 'open'}</p>
      <button onClick={toggle} className="text-text2 underline">Toggle</button>
    </div>
  )
}
