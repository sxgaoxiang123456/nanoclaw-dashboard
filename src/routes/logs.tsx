import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/logs')({
  component: LogsPage,
})

// TODO(P1): Implement full logs page - real-time streaming, filtering, search, export
function LogsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-4xl mb-4">☰</div>
      <h1 className="text-xl font-semibold text-text mb-2">运行日志</h1>
      <p className="text-text2">实时日志推送功能即将推出</p>
    </div>
  )
}
