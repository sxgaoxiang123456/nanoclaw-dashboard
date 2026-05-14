import { createFileRoute } from '@tanstack/react-router'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export const Route = createFileRoute('/skills')({
  component: SkillsPage,
})

function SkillsPage() {
  const { data: stats } = useDashboardStats()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-4xl mb-4">✦</div>
      <h1 className="text-xl font-semibold text-text mb-2">Skills 市场</h1>
      <p className="text-text2 mb-4">Skills 浏览与安装功能即将推出</p>
      <p className="text-text3 text-sm">当前共有 {stats?.skillCount ?? 0} 个 Skills</p>
    </div>
  )
}
