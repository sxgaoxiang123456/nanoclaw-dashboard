# Dashboard 对比度优化设计文档

## 问题概述

nanoclaw-dashboard-v2 Dashboard 页面存在三个视觉对比度问题：

1. **Sidebar 选中项对比度低**：被选中的导航标签（如"控制台"）背景和文字在深色主题下难以辨认
2. **Dashboard 组件文本看不清**：StatsCard 大数字、Workflow CountCard 等关键文本与背景几乎融为一体，且存在文本溢出组件的情况
3. **标签/背景着色对比度低**：Agent 头像背景、状态标签、Workflow icon 背景、日志类型标签等着色在深色背景下区分度不高

**共同根因**：`globals.css` 中 `@theme inline` 区块覆盖了 `@theme` 中定义的 `--color-accent`，导致 `text-accent` 实际解析为 shadcn 的 `--accent` = `#1c1c1c`（深灰），在 `#161616` 的 card 背景和 `#0a0a0a` 的页面背景上几乎不可见。同时各处使用的低透明度 `rgba` 背景色（多为 `0.1-0.2`）对比度不足。

## 设计方案

### 1. CSS 变量修复（`src/styles/globals.css`）

**问题**：`@theme inline` 中 `--color-accent: var(--accent)` 覆盖了 `@theme` 中的 `--color-accent: #ff8c1a`。当前项目中所有使用 `text-accent`、`bg-accent` 的自定义组件（StatsCard 大数字、ChatPanel 按钮、Sidebar hover 等）均期望渲染为橙色，但实际被解析为 shadcn 的 `--accent` = `#1c1c1c`（深灰）。

**修复**：
- 在 `@theme inline` 中将 `--color-accent: var(--accent)` 直接替换为 `--color-accent: #ff8c1a`
- 这样 `text-accent` → 橙色文字，`bg-accent` → 橙色背景，与项目实际使用意图一致
- shadcn/ui 的 CSS 变量 `--accent`（`#1c1c1c`）继续保留，不影响现有 shadcn 组件（它们使用 `bg-muted`、`bg-secondary` 等，未直接使用 `bg-accent` Tailwind 类名）

**提升 accent-dim 不透明度**：
- `--color-accent-dim`: `rgba(255, 140, 26, 0.15)` → `rgba(255, 140, 26, 0.25)`

### 2. Sidebar 选中项修复（`src/components/layout/Sidebar.tsx`）

**当前代码**：
```tsx
className={`... ${isActive
  ? 'bg-accent-dim text-accent font-semibold'
  : 'text-text2 hover:bg-card-hover hover:text-text'
}`}
```

**修复后**：CSS 变量修复后，`bg-accent-dim`（更明显的半透明橙底）+ `text-accent`（橙色文字）将提供足够的对比度。无需修改组件代码。

### 3. Dashboard 文本对比度修复

#### 3.1 StatsCard 大数字（`src/components/dashboard/StatsCard.tsx`）

**当前**：`<div className="text-5xl font-bold text-accent leading-none mb-2">`

**修复**：CSS 变量修复后 `text-accent` 恢复橙色，大数字自动可见。

#### 3.2 StatsCard subtitle 溢出（`src/components/dashboard/StatsCard.tsx`）

**当前**：`<div className="text-[13px] text-text2 mb-3">{subtitle}...</div>`

**修复**：添加 `truncate` 防止长 subtitle 溢出卡片边界。

#### 3.3 Workflow CountCard（`src/components/dashboard/WorkflowStatus.tsx`）

**当前**：执行中 CountCard 使用 `bg-bg` 背景 + `text-accent` 文字 → 深灰在深黑上不可见

**修复**：
```tsx
// highlight CountCard
<div className={`flex-1 rounded-[var(--radius-btn)] p-3 text-center ${
  highlight ? 'bg-accent-dim border border-accent/30' : 'bg-bg'
} `}>
```
文字保持 `text-accent`，在修复后的橙色 accent 下可见。

### 4. 标签/背景着色对比度修复

#### 4.1 Agent 头像背景（`src/components/dashboard/AgentRow.tsx`）

**当前**：`rgba(..., 0.15-0.2)`

**修复**：
```ts
const avatarColors: Record<string, string> = {
  '🐾': 'rgba(255, 140, 26, 0.35)',
  '⚡': 'rgba(168, 85, 247, 0.3)',
  '🔍': 'rgba(59, 130, 246, 0.3)',
  '📋': 'rgba(34, 197, 94, 0.3)',
  '📊': 'rgba(161, 161, 161, 0.3)',
}
```

#### 4.2 Agent 状态标签（`src/components/dashboard/AgentRow.tsx`）

**当前**：`bg-green/15 text-green`、`bg-red/15 text-red`

**修复**：`bg-green/15` → `bg-green/25`，`bg-red/15` → `bg-red/25`

#### 4.3 AgentList "运行中" 标签（`src/components/dashboard/AgentList.tsx`）

**当前**：`text-accent bg-accent-dim`

**修复**：CSS 变量修复后自动可见。同时提升 `accent-dim` 不透明度使其更明显。

#### 4.4 Workflow icon 背景（`src/components/dashboard/WorkflowRow.tsx`）

**当前**：`rgba(255, 140, 26, 0.15)` 等

**修复**：
```ts
const statusConfig = {
  queued:  { bg: 'rgba(161, 161, 161, 0.25)', text: 'var(--color-text3)', ... },
  running: { bg: 'rgba(255, 140, 26, 0.3)',   text: 'var(--color-accent)', ... },
  completed:{ bg: 'rgba(34, 197, 94, 0.25)',   text: 'var(--color-green)', ... },
  failed:  { bg: 'rgba(239, 68, 68, 0.25)',   text: 'var(--color-red)', ... },
}
```

#### 4.5 日志类型标签（`src/components/dashboard/LogRow.tsx`）

**当前**：`rgba(..., 0.15)`

**修复**：
```ts
const typeStyles = {
  exec:   { bg: 'rgba(168, 85, 247, 0.3)', text: 'var(--color-purple)', ... },
  create: { bg: 'rgba(59, 130, 246, 0.3)', text: 'var(--color-blue)', ... },
  config: { bg: 'rgba(161, 161, 161, 0.25)', text: 'var(--color-text2)', ... },
  error:  { bg: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-red)', ... },
}
```

#### 4.6 LogList "全部" 标签（`src/components/dashboard/LogList.tsx`）

**当前**：`text-accent bg-accent-dim`

**修复**：CSS 变量修复后自动可见。

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/styles/globals.css` | 修复 `--color-accent` 变量冲突；提升 `accent-dim` 不透明度 |
| `src/components/dashboard/StatsCard.tsx` | subtitle 添加 `truncate` |
| `src/components/dashboard/WorkflowStatus.tsx` | CountCard highlight 改用 `bg-accent-dim` |
| `src/components/dashboard/AgentRow.tsx` | 提升头像背景、状态标签背景不透明度 |
| `src/components/dashboard/WorkflowRow.tsx` | 提升 icon 背景不透明度 |
| `src/components/dashboard/LogRow.tsx` | 提升类型标签背景不透明度 |

## 颜色值变更对照

| 用途 | 当前值 | 修复后值 |
|------|--------|----------|
| `text-accent` | `#1c1c1c`（被覆盖） | `#ff8c1a`（恢复橙色） |
| `accent-dim` | `rgba(255, 140, 26, 0.15)` | `rgba(255, 140, 26, 0.25)` |
| Agent 头像背景 | `0.15-0.2` | `0.3-0.35` |
| Agent 状态标签背景 | `/15` | `/25` |
| Workflow icon 背景 | `0.1-0.15` | `0.25-0.3` |
| 日志类型标签背景 | `0.15` | `0.25-0.3` |

## 验收标准

- [ ] Sidebar 选中项文字清晰可辨（橙色文字在稍深橙底上）
- [ ] StatsCard 大数字（如 Agent 总数、Skills 总数等）清晰可见
- [ ] Workflow 执行中 CountCard 数字和标签清晰可见
- [ ] Agent 头像 emoji 在背景上清晰可见
- [ ] "运行中"/"已暂停"等状态标签文字在背景上清晰可见
- [ ] Workflow 状态 icon 在背景上清晰可见
- [ ] 日志类型标签（执行/新建/配置/错误）清晰可见
- [ ] StatsCard subtitle 不溢出卡片边界
