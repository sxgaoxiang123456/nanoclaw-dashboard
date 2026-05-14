import { useEffect, useRef } from 'react'
import { useAgents } from '@/hooks/useAgents'

export function TopBar() {
  const searchRef = useRef<HTMLInputElement>(null)
  const { data: agents } = useAgents()
  const runningCount = agents?.filter((a) => a.status === 'running').length ?? 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-[240px] h-[60px] bg-bg border-b border-border flex items-center px-6 gap-4 z-40">
      {/* Search */}
      <div className="flex-1 max-w-[480px] relative">
        <input
          ref={searchRef}
          type="text"
          placeholder="搜索 Skills、Agents、工作流..."
          className="w-full h-9 bg-card border border-border rounded-[var(--radius-btn)] text-text px-3 pr-10 text-[13px] outline-none transition-colors duration-150 focus:border-accent placeholder:text-text3"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-text3 bg-border px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        <Badge dot="green" text={`${runningCount} Agents 运行中`} />
        <Badge dot="purple" text="14 Skills 已部署" />
        <button
          className="w-8 h-8 rounded-[var(--radius-btn)] border border-border text-text2 flex items-center justify-center text-sm transition-all duration-150 hover:bg-card-hover hover:border-border-hover"
          title="通知"
          type="button"
        >
          🔔
        </button>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          MY
        </div>
      </div>
    </header>
  )
}

function Badge({ dot, text }: { dot: 'green' | 'purple'; text: string }) {
  const dotColor = dot === 'green' ? 'bg-green' : 'bg-purple'
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-badge)] text-xs bg-card border border-border text-text2">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {text}
    </span>
  )
}
