import { Link, useLocation } from '@tanstack/react-router'
import { useSidebarStore } from '@/stores/sidebarStore'

const navItems = [
  { path: '/', label: '控制台', icon: '◈' },
  { path: '/agents', label: 'Agent 管理', icon: '◉' },
  { path: '/skills', label: 'Skills 市场', icon: '✦' },
  { path: '/workflows', label: '工作流编排', icon: '▦' },
  { path: '/logs', label: '运行日志', icon: '☰' },
  { path: '/security', label: '安全中心', icon: '◒' },
  { path: '/settings', label: '系统设置', icon: '⚙' },
]

const platforms = [
  { name: 'CLI', status: 'online' as const },
  { name: 'iMessage', status: 'config' as const },
  { name: 'Telegram', status: 'offline' as const },
  { name: 'Discord', status: 'offline' as const },
]

export function Sidebar() {
  const { collapsed } = useSidebarStore()

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-card border-r border-border flex flex-col z-50 overflow-y-auto"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-5 border-b border-border"
        style={{ minHeight: 60 }}
      >
        <span className="text-[28px] leading-none flex-shrink-0">🐾</span>
        {!collapsed && (
          <>
            <span className="text-lg font-bold text-text">NanoClaw</span>
            <span className="text-[11px] text-text3 ml-auto">v2.0.33</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1">
        {!collapsed && (
          <div className="px-3 py-2 text-[11px] uppercase text-text3 font-semibold tracking-wide">
            导航
          </div>
        )}
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} collapsed={collapsed} />
        ))}

        {/* Quick actions */}
        <div className="mx-2 my-2 py-2 border-y border-border">
          <QuickAction collapsed={collapsed} icon="＋" label="创建新 Agent" />
          <QuickAction collapsed={collapsed} icon="↓" label="导入 Skill" />
        </div>
      </nav>

      {/* Platform status */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center gap-2 py-1.5 text-xs text-text3">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    p.status === 'online'
                      ? 'var(--color-green)'
                      : p.status === 'config'
                        ? 'var(--color-yellow)'
                        : 'var(--color-text3)',
                }}
              />
              <span>
                {p.name} {p.status === 'online' ? '已连接' : p.status === 'config' ? '配置中' : '未配置'}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

function NavItem({
  path,
  label,
  icon,
  collapsed,
}: {
  path: string
  label: string
  icon: string
  collapsed: boolean
}) {
  const location = useLocation()
  const isActive = location.pathname === path

  return (
    <Link
      to={path}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-btn)] text-sm transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-accent-dim text-accent font-semibold'
          : 'text-text2 hover:bg-card-hover hover:text-text'
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="w-[18px] text-center text-sm">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

function QuickAction({ icon, label, collapsed }: { icon: string; label: string; collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-[13px] text-text2 cursor-pointer transition-colors duration-150 hover:text-accent">
      <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  )
}
