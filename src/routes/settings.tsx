import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-4xl mb-4">⚙</div>
      <h1 className="text-xl font-semibold text-text mb-2">系统设置</h1>
      <p className="text-text2">主题切换等设置功能即将推出</p>
    </div>
  )
}
