import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workflows')({
  component: WorkflowsPage,
})

// TODO(P1): Implement workflow orchestration - DAG editor, trigger config, execution history
function WorkflowsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-4xl mb-4">▦</div>
      <h1 className="text-xl font-semibold text-text mb-2">工作流编排</h1>
      <p className="text-text2">工作流编排功能即将推出</p>
    </div>
  )
}
