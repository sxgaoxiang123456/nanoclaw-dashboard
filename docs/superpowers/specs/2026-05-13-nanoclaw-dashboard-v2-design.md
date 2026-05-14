# NanoClaw Dashboard v2 设计文档

## 1. 项目背景与目标

### 1.1 现状

NanoClaw Dashboard 当前为单个 HTML 文件（~27KB），内联全部 CSS 与 JavaScript，配套一个极简 Node.js 服务器（server.js）提供静态文件服务与 `/chat` API 代理。所有仪表盘数据为硬编码 mock，仅控制台页面可用，其余导航项为占位。

### 1.2 升级目标

将 Dashboard 升级为**产品级本地开发工具**：组件化、类型安全、真实数据驱动、可扩展、可维护。保持轻量、零配置、开箱即用的开发者体验，不引入认证或多租户等 SaaS 复杂度。

### 1.3 核心约束

- 本地开发工具定位，面向 NanoClaw 开发者
- 完全保留现有暗色视觉风格（#0a0a0a 背景、橘色 accent）
- 渐进式重构，分阶段交付，每阶段可独立运行
- 接受现代前端工程化（构建工具、类型系统、组件框架）

---

## 2. 现有项目分析

### 2.1 可复用资产

| 资产 | 复用方式 |
|------|----------|
| 设计系统（CSS 变量：颜色、间距、圆角、阴影、字体） | 完整迁移到 Tailwind `@theme` + CSS 自定义属性 |
| 布局骨架（Sidebar + TopBar + Main） | 提取为 React 布局组件 |
| 基础组件样式（卡片、徽章、进度条、迷你图表） | 映射为 Tailwind utility classes |
| 聊天功能交互逻辑 | 提取为 React hooks + 组件 |
| server.js 的 CLI 代理模式 | 扩展为通用 API 网关 |

### 2.2 必须重做

| 资产 | 原因 |
|------|------|
| 单文件 HTML 结构 | 无法组件化、无法类型检查、无法单元测试 |
| 硬编码 mock 数据 | 产品级 Dashboard 必须对接真实数据源 |
| 内联 CSS/JS | 无法复用、无法 tree-shake、维护成本高 |
| 无路由系统 | 多页面导航无法扩展 |
| 无状态管理 | 跨组件数据共享混乱 |
| 无错误处理 | API 失败、超时无用户反馈 |

---

## 3. 技术栈决策

| 层级 | 选型 | 版本 | 理由 |
|------|------|------|------|
| 构建工具 | Vite | ^6.0 | 极速 HMR、ESM 原生、生态成熟 |
| UI 框架 | React | ^19.0 | 生态最广、shadcn/ui 原生支持、团队熟悉度高 |
| 类型系统 | TypeScript | ^5.7 | 编译时类型安全、IDE 体验、可维护性 |
| 样式引擎 | Tailwind CSS | ^4.0 | 新版引擎性能提升、暗色主题配置灵活 |
| 组件基座 | shadcn/ui | latest | Headless + 可自定义样式，暗色主题易覆盖 |
| 路由 | TanStack Router | ^1.0 | 文件路由、类型安全、与 TanStack Query 生态一致 |
| 服务端状态 | TanStack Query | ^5.0 | 自动缓存、重试、刷新、去重请求 |
| 客户端状态 | Zustand | ^5.0 | 轻量（<1KB）、无样板代码、TypeScript 友好 |
| 图表 | Recharts | ^2.0（P2 引入） | React 原生、暗色主题适配简单 |
| 测试框架 | Vitest | ^3.0 | Vite 原生集成、Jest API 兼容 |

---

## 4. 架构设计

### 4.1 整体架构

```
┌─────────────────────────────────────────────┐
│                  Browser                      │
│  ┌─────────┐  ┌───────────────────────────┐ │
│  │ Sidebar │  │      TopBar               │ │
│  │         │  │  Search + Badges + Avatar │ │
│  │ Nav     │  └───────────────────────────┘ │
│  │ Quick   │  ┌───────────────────────────┐ │
│  │ Platform│  │      <Outlet />           │ │
│  │ Status  │  │  Dashboard / Agents / ... │ │
│  └─────────┘  └───────────────────────────┘ │
│  ┌─────────────────────────────┐            │
│  │     ChatPanel (浮动)         │            │
│  └─────────────────────────────┘            │
└─────────────────────────────────────────────┘
                      │
                      ▼ HTTP / SSE
┌─────────────────────────────────────────────┐
│           Dashboard Server (Node.js)          │
│  ┌─────────────┐  ┌───────────────────────┐ │
│  │ Static File │  │  API Gateway          │ │
│  │   Server    │  │  /api/* → CLI spawn   │ │
│  │             │  │  /chat  → chat proxy  │ │
│  └─────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────┘
                      │
                      ▼ child_process
┌─────────────────────────────────────────────┐
│           NanoClaw Backend (CLI)              │
│         (pnpm run status / list / ...)        │
└─────────────────────────────────────────────┘
```

### 4.2 数据源演进

- **P0 阶段**：server.js 扩展为通用 API 网关，通过 `child_process.spawn` 执行 NanoClaw CLI 命令获取状态，结果缓存为 JSON 返回
- **长期演进**：NanoClaw 后端暴露原生 REST API，Dashboard 直接对接，server.js 退化为纯静态文件服务或完全移除

---

## 5. 设计系统

### 5.1 颜色体系（完全复刻现有）

```css
@theme {
  --color-bg: #0a0a0a;
  --color-card: #161616;
  --color-card-hover: #1c1c1c;
  --color-border: #262626;
  --color-border-hover: #3a3a3a;
  --color-text: #f5f5f5;
  --color-text2: #a1a1a1;
  --color-text3: #737373;
  --color-accent: #ff8c1a;
  --color-accent-dim: rgba(255, 140, 26, 0.15);
  --color-green: #22c55e;
  --color-red: #ef4444;
  --color-purple: #a855f7;
  --color-blue: #3b82f6;
}
```

### 5.2 间距与形状

```css
@theme {
  --radius-card: 12px;
  --radius-btn: 8px;
  --radius-badge: 6px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3);
  --font-sans: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
}
```

### 5.3 布局常量

| 变量 | 值 | 用途 |
|------|-----|------|
| `--sidebar-width` | 240px | 侧边栏固定宽度 |
| `--topbar-height` | 60px | 顶部栏固定高度 |

---

## 6. 项目结构

```
nanoclaw-dashboard-v2/
├── src/
│   ├── main.tsx                    # 应用入口：ReactDOM.createRoot + RouterProvider
│   ├── routeTree.gen.ts            # TanStack Router 自动生成（gitignore）
│   ├── routes/                     # 文件路由（TanStack Router 约定）
│   │   ├── __root.tsx              # 根布局：Sidebar + TopBar + <Outlet />
│   │   ├── index.tsx               # 控制台仪表盘（/）
│   │   ├── agents.tsx              # Agent 管理（/agents）— P1
│   │   ├── skills.tsx              # Skills 市场（/skills）— P1
│   │   ├── workflows.tsx           # 工作流编排（/workflows）— P1
│   │   ├── logs.tsx                # 运行日志（/logs）— P2
│   │   ├── security.tsx            # 安全中心（/security）
│   │   └── settings.tsx            # 系统设置（/settings）
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 组件（Button, Input, Badge, Card, ScrollArea...）
│   │   ├── layout/                 # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MainLayout.tsx
│   │   └── dashboard/              # 控制台业务组件
│   │       ├── StatsCard.tsx
│   │       ├── StatsGrid.tsx
│   │       ├── AgentRow.tsx
│   │       ├── WorkflowRow.tsx
│   │       ├── LogRow.tsx
│   │       ├── SecurityCard.tsx
│   │       └── MiniChart.tsx
│   ├── hooks/
│   │   ├── useDashboardStats.ts    # TanStack Query hook
│   │   ├── useAgents.ts
│   │   ├── useWorkflows.ts
│   │   ├── useLogs.ts
│   │   └── useChat.ts              # 聊天逻辑封装
│   ├── lib/
│   │   ├── api.ts                  # fetch 封装 + API 函数
│   │   ├── utils.ts                # 通用工具函数
│   │   └── constants.ts            # 常量定义
│   ├── stores/
│   │   ├── sidebarStore.ts         # Zustand：侧边栏折叠
│   │   ├── chatStore.ts            # Zustand：聊天状态
│   │   └── themeStore.ts           # Zustand：主题切换（P2）
│   ├── types/
│   │   └── index.ts                # TypeScript 类型定义
│   └── styles/
│       └── globals.css             # Tailwind 指令 + 设计系统 CSS 变量
├── public/                         # 静态资源
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 7. 路由设计

TanStack Router 文件路由，无需手动维护路由表。

| 路由 | 页面组件 | 阶段 |
|------|----------|------|
| `/` | `DashboardPage` | P0 |
| `/agents` | `AgentsPage` | P1 |
| `/skills` | `SkillsPage` | P1 |
| `/workflows` | `WorkflowsPage` | P1 |
| `/logs` | `LogsPage` | P2 |
| `/security` | `SecurityPage` | P0（占位）|
| `/settings` | `SettingsPage` | P0（占位）|

根布局 `__root.tsx` 始终渲染 Sidebar + TopBar + ChatPanel（浮动），中间 `<Outlet />` 渲染当前页。

**导航激活状态**：通过 `useMatch` 精确匹配当前路由路径，高亮 Sidebar 对应项。

---

## 8. 组件架构

### 8.1 组件分层

```
Page (路由级)
  └── 组合 Layout + Section + Business Component
       └── Layout (Sidebar, TopBar)
       └── Section (StatsGrid, PanelsGrid)
       └── Business Component (StatsCard, AgentRow, WorkflowRow)
            └── UI Primitive (Card, Badge, Button, Avatar) — shadcn/ui
```

### 8.2 关键组件接口

```typescript
// StatsCard
interface StatsCardProps {
  title: string;
  icon: string;
  value: string | number;
  subtitle: string;
  trend?: { direction: 'up' | 'down'; value: string };
  progress?: { value: number; color: 'accent' | 'green' | 'blue' };
  chart?: number[]; // 迷你图表数据
}

// AgentRow
interface AgentRowProps {
  agent: Agent;
}

// WorkflowRow
interface WorkflowRowProps {
  workflow: Workflow;
}

// LogRow
interface LogRowProps {
  log: LogEntry;
}

// ChatPanel（全局浮动）
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'sent' | 'loading' | 'error';
  timestamp: string;
}
```

---

## 9. 数据层设计

### 9.1 API 客户端

`src/lib/api.ts` 封装 fetch：

- 统一 baseURL（`/api`）
- 统一错误格式 `{ error: string }`
- 统一请求取消（AbortController）
- 响应超时处理

### 9.2 核心数据接口

```typescript
// types/index.ts

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: 'running' | 'paused';
  avatar: string;
}

interface Skill {
  id: string;
  name: string;
  source: 'builtin' | 'third-party';
  installed: boolean;
}

interface Workflow {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: string;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'exec' | 'create' | 'config' | 'error';
  message: string;
}

interface DashboardStats {
  agentCount: number;
  runningAgents: number;
  pausedAgents: number;
  skillCount: number;
  customSkills: number;
  thirdPartySkills: number;
  todayExecutions: number;
  yesterdayExecutions: number;
  todayCost: number;
  monthlyCost: number;
  monthlyBudget: number;
}

interface SecurityStatus {
  costControl: {
    singleLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  skillAudit: {
    total: number;
    pending: number;
    status: 'healthy' | 'warning';
  };
  manualApproval: {
    pendingRequests: number;
    status: 'healthy' | 'warning';
  };
  overall: 'healthy' | 'warning' | 'critical';
  lastCheckedAt: string;
}
```

### 9.3 TanStack Query 配置

| Hook | Query Key | Stale Time | Refetch Interval | 说明 |
|------|-----------|------------|------------------|------|
| `useDashboardStats` | `['stats']` | 30s | — | 仪表盘核心数据 |
| `useAgents` | `['agents']` | 10s | 10s | Agent 状态需准实时 |
| `useWorkflows` | `['workflows']` | 10s | 10s | 工作流状态 |
| `useLogs` | `['logs']` | 5s | 5s | 日志需高频刷新 |
| `useSecurityStatus` | `['security']` | 60s | — | 安全状态变化慢 |

### 9.4 Zustand Store

```typescript
// sidebarStore
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

// chatStore
interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  currentAgent: string;
  toggle: () => void;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

// themeStore (P2)
interface ThemeState {
  mode: 'dark' | 'light';
  toggle: () => void;
}
```

---

## 10. P0 阶段详细功能清单

P0 目标：**工程化骨架就绪 + 控制台仪表盘真实数据化 + 聊天改进**

### 10.1 工程搭建

| 功能 | 验收标准 |
|------|----------|
| Vite + React + TS + Tailwind 初始化 | `npm install` 成功，`npm run dev` 启动无报错 |
| shadcn/ui 配置 | 暗色主题变量正确注入，组件可正常导入使用 |
| TanStack Router 配置 | 文件路由生效，`/`, `/agents`, `/skills` 等可访问 |
| 类型检查 | `tsc --noEmit` 无错误 |
| 构建输出 | `npm run build` 生成优化后的静态文件 |

### 10.2 设计系统迁移

| 功能 | 验收标准 |
|------|----------|
| CSS 变量迁移到 Tailwind `@theme` | 所有颜色、圆角、阴影、字体变量在 Tailwind 中可用 |
| 全局样式 | `globals.css` 包含 Tailwind 指令 + 设计系统变量 + 滚动条样式 |
| 暗色主题 | 无需手动切换 class，默认暗色，所有组件适配 |

### 10.3 布局框架

| 功能 | 验收标准 |
|------|----------|
| Sidebar | 固定宽度 240px，包含 Logo、导航、快捷操作、平台状态 |
| TopBar | 固定高度 60px，包含搜索框（⌘K 聚焦）、状态徽章、通知、头像 |
| Main | 自动计算 padding 避开 Sidebar 和 TopBar |
| 路由切换 | 点击 Sidebar 导航项平滑切换页面，URL 同步更新 |
| 导航高亮 | 当前页面对应导航项高亮（accent 背景色）|

### 10.4 控制台仪表盘

| 功能 | 验收标准 |
|------|----------|
| 统计卡片网格 | 4 列布局，展示 Agent/Skills/执行/API 消耗 |
| 统计数字 | 从真实 API 获取，加载时显示骨架屏 |
| 趋势指示 | 较昨日对比，绿色上升箭头 + 百分比 |
| 进度条 | 卡片底部进度条，颜色按类型区分 |
| 迷你图表 | API 消耗卡片底部 12 柱迷你图 |
| 活跃 Agent 列表 | 展示头像、名称、模型、状态标签（运行中/已暂停）|
| 工作流概览 | 顶部 3 个状态卡片（排队/执行中/已完成）+ 最近 5 条记录 |
| 最近日志 | 时间 + 类型标签（执行/新建/配置）+ 消息摘要 |
| 安全防线 | 3 张安全卡片 + 底部整体状态横幅 |

### 10.5 聊天浮层改进

| 功能 | 验收标准 |
|------|----------|
| 展开/收起 | 点击右下角按钮展开，点击关闭按钮或再次点击收起 |
| 消息展示 | 用户消息右对齐（accent 背景），助手消息左对齐（card-hover 背景）|
| 加载状态 | 发送后显示"..."加载消息，禁止重复发送 |
| 错误处理 | API 失败显示错误提示，提供重试按钮 |
| 空状态 | 无消息时显示 Andy 欢迎语 |
| 空输入保护 | 空内容禁止发送 |
| 历史记录 | 当前会话消息在 Zustand 中持久化（页面刷新保留）|

### 10.6 空页面占位

| 路由 | 内容 |
|------|------|
| `/agents` | "Agent 管理即将推出" + 当前 Agent 数量展示 |
| `/skills` | "Skills 市场即将推出" + 当前 Skills 数量展示 |
| `/workflows` | "工作流编排即将推出" |
| `/logs` | "运行日志即将推出" |
| `/security` | 安全防线总览（与控制台安全卡片相同数据）|
| `/settings` | "系统设置即将推出" |

---

## 11. 错误处理策略

| 场景 | 处理方式 |
|------|----------|
| API 请求失败 | TanStack Query 自动重试 3 次（指数退避），最终显示内联错误状态 |
| NanoClaw 后端未启动 | 全局错误边界捕获，显示"无法连接到 NanoClaw 后端" + 重试按钮 |
| 聊天请求超时 | 保留 120s 超时逻辑，前端显示"请求超时，请重试" |
| 聊天请求失败 | 消息状态标记为 error，显示重试按钮 |
| 路由 404 | 兜底页面，引导回控制台 |
| 未知运行时错误 | React Error Boundary 捕获，显示友好错误页 + 刷新按钮 |

---

## 12. 测试策略

| 层级 | 工具 | 范围 | 阶段 |
|------|------|------|------|
| 类型检查 | `tsc --noEmit` | 全量 TypeScript 代码 | P0 |
| 单元测试 | Vitest | `lib/utils.ts`, `stores/*` | P0 |
| 组件测试 | Vitest + React Testing Library | `StatsCard`, `AgentRow`, `ChatPanel` | P0 |
| E2E 测试 | Playwright | 核心用户流程（P1 后补充）| P1+ |

---

## 13. 路线图

### P0：骨架 + 控制台（当前阶段）

工期：2-3 天

- [x] 工程化搭建（Vite + React + TS + Tailwind + shadcn/ui）
- [x] 设计系统迁移
- [x] 布局框架（Sidebar + TopBar + 路由）
- [x] 控制台仪表盘真实数据化
- [x] 聊天浮层改进
- [x] 空页面占位
- [x] API 客户端 + TanStack Query hooks

### P1：管理功能

工期：2-3 天

- [ ] Agent CRUD（创建、编辑、暂停/启动、删除）
- [ ] Skills 市场浏览与安装/卸载
- [ ] 工作流编排界面（列表 + 详情）
- [ ] 平台连接配置（iMessage / Telegram / Discord）

### P2：增强体验

工期：2-3 天

- [ ] Server-Sent Events 实时日志推送（替代轮询）
- [ ] 执行趋势图表（Recharts）
- [ ] API 消耗趋势图表
- [ ] 多 Agent 对话切换
- [ ] 浅色/深色主题切换
- [ ] 通知中心（Toast 系统）

---

## 14. 风险分析

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| NanoClaw CLI 命令输出格式不稳定 | 中 | 高 | API 层做格式适配和版本兼容，增加健壮解析 |
| CLI 命令执行性能差（秒级延迟） | 中 | 中 | API 层加缓存（TTL 5-10s），TanStack Query 客户端缓存 |
| Tailwind v4 与 shadcn/ui 兼容问题 | 低 | 中 | 使用官方兼容方案，遇到问题回退 v3 |
| TanStack Router 学习成本 | 低 | 低 | 文件路由约定简单，官方文档完善 |
| 设计系统迁移遗漏细节 | 中 | 低 | 与现有 HTML 逐像素对比，建立视觉回归检查清单 |
| 单 HTML 拆分为组件时的状态遗漏 | 中 | 中 | 拆分前完整梳理所有交互状态，建立状态映射表 |

---

## 15. 附录：现有代码映射表

将现有 `index.html` 中的模块映射到新架构：

| 现有模块 | 新位置 | 类型 |
|----------|--------|------|
| `:root` CSS 变量 | `src/styles/globals.css` `@theme` | 样式 |
| `.sidebar` | `src/components/layout/Sidebar.tsx` | 组件 |
| `.topbar` | `src/components/layout/TopBar.tsx` | 组件 |
| `.stats-grid` + `.stat-card` | `src/components/dashboard/StatsGrid.tsx` + `StatsCard.tsx` | 组件 |
| `.agent-row` | `src/components/dashboard/AgentRow.tsx` | 组件 |
| `.workflow-row` | `src/components/dashboard/WorkflowRow.tsx` | 组件 |
| `.log-row` | `src/components/dashboard/LogRow.tsx` | 组件 |
| `.security-grid` + `.security-card` | `src/components/dashboard/SecurityCard.tsx` | 组件 |
| `.chat-panel` + `.chat-btn` | `src/components/layout/ChatPanel.tsx` | 组件 |
| 聊天 JS 逻辑 | `src/hooks/useChat.ts` + `src/stores/chatStore.ts` | Hook + Store |
| `⌘K` 搜索聚焦 | `src/components/layout/TopBar.tsx` 内联 | 组件 |
| server.js `/chat` | 保留并扩展为通用 API 网关 | 服务端 |
