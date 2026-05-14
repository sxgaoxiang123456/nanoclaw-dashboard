import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ChatPanel } from '@/components/chat/ChatPanel'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Sidebar />
      <div className="ml-[240px]">
        <TopBar />
        <main className="pt-[84px] px-6 pb-6">
          <Outlet />
        </main>
      </div>
      <ChatPanel />
    </div>
  )
}
