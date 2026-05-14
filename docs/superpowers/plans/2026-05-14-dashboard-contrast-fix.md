# Dashboard 对比度优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 nanoclaw-dashboard-v2 Dashboard 页面三个视觉对比度问题：Sidebar 选中项对比度、Dashboard 文本对比度及溢出、标签/背景着色对比度。

**Architecture:** 修复根因（Tailwind v4 `@theme inline` 覆盖导致 `text-accent`/`bg-accent` 被解析为深灰色 `#1c1c1c`），同时提升各处低透明度 `rgba` 背景色的不透明度。

**Tech Stack:** React + TypeScript + Tailwind CSS v4 + shadcn/ui + Vite

---

## 文件结构

| 文件 | 职责 | 操作 |
|------|------|------|
| `src/styles/globals.css` | 全局 CSS 变量、Tailwind 主题定义 | 修改 |
| `src/components/dashboard/StatsCard.tsx` | 统计卡片组件 | 修改 |
| `src/components/dashboard/WorkflowStatus.tsx` | 工作流状态组件 | 修改 |
| `src/components/dashboard/AgentRow.tsx` | Agent 行组件 | 修改 |
| `src/components/dashboard/WorkflowRow.tsx` | 工作流行组件 | 修改 |
| `src/components/dashboard/LogRow.tsx` | 日志行组件 | 修改 |

---

### Task 1: 修复 CSS 变量冲突 — text-accent/bg-accent 恢复橙色

**Files:**
- Modify: `src/styles/globals.css`

**背景:** `@theme inline` 中 `--color-accent: var(--accent)` 覆盖了 `@theme` 中 `--color-accent: #ff8c1a`，导致所有 `text-accent`/`bg-accent` 渲染为深灰色 `#1c1c1c`。

- [ ] **Step 1: 修改 `@theme inline` 中的 `--color-accent`**

在 `src/styles/globals.css` 中，找到 `@theme inline` 区块，将：

```css
--color-accent: var(--accent);
```

替换为：

```css
--color-accent: #ff8c1a;
```

这样 `text-accent` → `#ff8c1a`（橙色文字），`bg-accent` → `#ff8c1a`（橙色背景），与项目中所有自定义组件的实际使用意图一致。shadcn/ui 的 CSS 变量 `--accent: #1c1c1c` 继续保留，不影响现有 shadcn 组件（它们未直接使用 `bg-accent` Tailwind 类名）。

- [ ] **Step 2: 验证修改**

确认 `@theme inline` 中 `--color-accent` 行现在为 `#ff8c1a`，且 `:root` 中的 `--accent: #1c1c1c` 未被改动。

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "fix: restore accent color to orange #ff8c1a by fixing CSS variable override"
```

---

### Task 2: 提升 accent-dim 不透明度

**Files:**
- Modify: `src/styles/globals.css`

**背景:** `accent-dim` 当前为 `rgba(255, 140, 26, 0.15)`，在深色背景上几乎不可见。

- [ ] **Step 1: 修改 accent-dim 值**

在 `src/styles/globals.css` 的 `@theme` 区块中，将：

```css
--color-accent-dim: rgba(255, 140, 26, 0.15);
```

替换为：

```css
--color-accent-dim: rgba(255, 140, 26, 0.25);
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/globals.css
git commit -m "fix: increase accent-dim opacity from 0.15 to 0.25 for better visibility"
```

---

### Task 3: 修复 StatsCard subtitle 文本溢出

**Files:**
- Modify: `src/components/dashboard/StatsCard.tsx`

**背景:** StatsCard 中的 subtitle 可能因内容过长而溢出卡片边界。

- [ ] **Step 1: 为 subtitle 添加 truncate**

在 `src/components/dashboard/StatsCard.tsx` 中，找到第 60 行的 subtitle div：

```tsx
<div className="text-[13px] text-text2 mb-3">
```

替换为：

```tsx
<div className="text-[13px] text-text2 mb-3 truncate">
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/StatsCard.tsx
git commit -m "fix: add truncate to StatsCard subtitle to prevent overflow"
```

---

### Task 4: 修复 Workflow CountCard "执行中" 对比度

**Files:**
- Modify: `src/components/dashboard/WorkflowStatus.tsx`

**背景:** CountCard highlight（"执行中"）使用 `bg-bg`（`#0a0a0a`）背景 + `text-accent`（修复前为深灰），几乎不可见。修复后 `text-accent` 已恢复橙色，但深色背景仍然不够突出。

- [ ] **Step 1: 修改 highlight CountCard 背景**

在 `src/components/dashboard/WorkflowStatus.tsx` 中，找到 `CountCard` 组件的 div（第 70-74 行）：

```tsx
<div
  className={`flex-1 bg-bg rounded-[var(--radius-btn)] p-3 text-center ${
    highlight ? 'border border-accent-dim' : ''
  }`}
>
```

替换为：

```tsx
<div
  className={`flex-1 rounded-[var(--radius-btn)] p-3 text-center ${
    highlight ? 'bg-accent-dim border border-accent/30' : 'bg-bg'
  }`}
>
```

这样"执行中"卡片使用更亮的半透明橙底，与"排队中"和"已完成"的深色背景形成区分。

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/WorkflowStatus.tsx
git commit -m "fix: use accent-dim background for highlighted workflow count card"
```

---

### Task 5: 修复 AgentRow 头像和状态标签对比度

**Files:**
- Modify: `src/components/dashboard/AgentRow.tsx`

**背景:** Agent 头像背景透明度 `0.15-0.2` 过低，emoji 看不清；状态标签背景 `bg-green/15`、`bg-red/15` 也过淡。

- [ ] **Step 1: 提升头像背景不透明度**

在 `src/components/dashboard/AgentRow.tsx` 中，将 `avatarColors` 对象（第 3-9 行）：

```ts
const avatarColors: Record<string, string> = {
  '🐾': 'rgba(255, 140, 26, 0.2)',
  '⚡': 'rgba(168, 85, 247, 0.15)',
  '🔍': 'rgba(59, 130, 246, 0.15)',
  '📋': 'rgba(34, 197, 94, 0.15)',
  '📊': 'rgba(161, 161, 161, 0.15)',
}
```

替换为：

```ts
const avatarColors: Record<string, string> = {
  '🐾': 'rgba(255, 140, 26, 0.35)',
  '⚡': 'rgba(168, 85, 247, 0.3)',
  '🔍': 'rgba(59, 130, 246, 0.3)',
  '📋': 'rgba(34, 197, 94, 0.3)',
  '📊': 'rgba(161, 161, 161, 0.3)',
}
```

- [ ] **Step 2: 提升状态标签背景不透明度**

在同文件中，找到第 33-38 行的状态标签 className：

```tsx
<span
  className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-badge)] font-medium flex-shrink-0 ${
    agent.status === 'running'
      ? 'bg-green/15 text-green'
      : 'bg-red/15 text-red'
  }`}
>
```

替换为：

```tsx
<span
  className={`text-[11px] px-2 py-0.5 rounded-[var(--radius-badge)] font-medium flex-shrink-0 ${
    agent.status === 'running'
      ? 'bg-green/25 text-green'
      : 'bg-red/25 text-red'
  }`}
>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/AgentRow.tsx
git commit -m "fix: increase AgentRow avatar and status badge background opacity"
```

---

### Task 6: 修复 WorkflowRow icon 背景对比度

**Files:**
- Modify: `src/components/dashboard/WorkflowRow.tsx`

**背景:** Workflow 状态 icon 背景透明度 `0.1-0.15` 过低，看不清 icon。

- [ ] **Step 1: 提升 icon 背景不透明度**

在 `src/components/dashboard/WorkflowRow.tsx` 中，将 `statusConfig` 对象（第 4-9 行）：

```ts
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  queued: { bg: 'rgba(161, 161, 161, 0.1)', text: 'var(--color-text3)', label: '排队中' },
  running: { bg: 'rgba(255, 140, 26, 0.15)', text: 'var(--color-accent)', label: '执行中' },
  completed: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--color-green)', label: '成功' },
  failed: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-red)', label: '失败' },
}
```

替换为：

```ts
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  queued: { bg: 'rgba(161, 161, 161, 0.25)', text: 'var(--color-text3)', label: '排队中' },
  running: { bg: 'rgba(255, 140, 26, 0.3)', text: 'var(--color-accent)', label: '执行中' },
  completed: { bg: 'rgba(34, 197, 94, 0.25)', text: 'var(--color-green)', label: '成功' },
  failed: { bg: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-red)', label: '失败' },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/WorkflowRow.tsx
git commit -m "fix: increase WorkflowRow status icon background opacity"
```

---

### Task 7: 修复 LogRow 类型标签对比度

**Files:**
- Modify: `src/components/dashboard/LogRow.tsx`

**背景:** 日志类型标签背景透明度 `0.15` 过低，类型标签不够醒目。

- [ ] **Step 1: 提升类型标签背景不透明度**

在 `src/components/dashboard/LogRow.tsx` 中，将 `typeStyles` 对象（第 4-9 行）：

```ts
const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  exec: { bg: 'rgba(168, 85, 247, 0.15)', text: 'var(--color-purple)', label: '执行' },
  create: { bg: 'rgba(59, 130, 246, 0.15)', text: 'var(--color-blue)', label: '新建' },
  config: { bg: 'rgba(161, 161, 161, 0.15)', text: 'var(--color-text2)', label: '配置' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-red)', label: '错误' },
}
```

替换为：

```ts
const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  exec: { bg: 'rgba(168, 85, 247, 0.3)', text: 'var(--color-purple)', label: '执行' },
  create: { bg: 'rgba(59, 130, 246, 0.3)', text: 'var(--color-blue)', label: '新建' },
  config: { bg: 'rgba(161, 161, 161, 0.25)', text: 'var(--color-text2)', label: '配置' },
  error: { bg: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-red)', label: '错误' },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/LogRow.tsx
git commit -m "fix: increase LogRow type badge background opacity"
```

---

### Task 8: 端到端视觉验证

**Files:** 无需修改代码文件，使用浏览器验证。

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证 Sidebar 选中项对比度**

在浏览器中访问 Dashboard 页面，点击 Sidebar 中的不同导航项，确认：
- 选中项文字为橙色 `#ff8c1a`，在半透明橙底 `rgba(255, 140, 26, 0.25)` 上清晰可辨
- 未选中项 hover 时文字变为橙色

- [ ] **Step 3: 验证 Dashboard 文本对比度**

确认 StatsGrid 中四个卡片的大数字（如 Agent 总数、Skills 总数等）为橙色 `#ff8c1a`，在深色 card 背景上清晰可见。

确认 WorkflowStatus 中"执行中" CountCard 使用 `bg-accent-dim` 背景，数字和标签清晰可见。

确认 StatsCard subtitle 在长内容时不溢出卡片边界。

- [ ] **Step 4: 验证标签/背景着色对比度**

确认：
- AgentList 中 Agent 头像 emoji 在背景上清晰可见
- "运行中"/"已暂停"状态标签背景色与文字形成足够对比
- AgentList 顶部"X 运行中"标签和 LogList 顶部"全部"标签清晰可见
- WorkflowRow 中状态 icon（⏳/💬/✓/✗）在背景上清晰可见
- LogRow 中类型标签（执行/新建/配置/错误）清晰可见

- [ ] **Step 5: 运行现有测试**

```bash
npm test
```

Expected: 所有现有测试通过（本计划仅修改样式，不改变逻辑）。

- [ ] **Step 6: Commit（如测试通过）**

```bash
git commit --allow-empty -m "chore: verify dashboard contrast fixes visually and via tests"
```

---

## 自我审查

### 1. Spec 覆盖检查

| Spec 要求 | 对应 Task |
|-----------|-----------|
| CSS 变量冲突修复（`--color-accent` 恢复橙色） | Task 1 |
| 提升 `accent-dim` 不透明度 | Task 2 |
| StatsCard subtitle 溢出修复 | Task 3 |
| Workflow CountCard highlight 对比度修复 | Task 4 |
| AgentRow 头像背景对比度 | Task 5 Step 1 |
| AgentRow 状态标签对比度 | Task 5 Step 2 |
| WorkflowRow icon 背景对比度 | Task 6 |
| LogRow 类型标签对比度 | Task 7 |
| 端到端视觉验证 | Task 8 |

**无遗漏。**

### 2. Placeholder 扫描

- 无 "TBD"、"TODO"、"implement later"
- 无 "Add appropriate error handling" 等模糊描述
- 所有修改都包含完整代码块
- 所有验证步骤包含具体命令和预期结果

### 3. 类型一致性

- 所有颜色值使用 `rgba()` 或 Hex 格式，与现有代码一致
- Tailwind 类名使用 `/25`、`/30`、`/35` 等百分比透明度语法，与现有代码的 `/15` 风格一致
- 未引入新的类型或接口

---

## Out-of-Scope（明确不包含）

- 不修改任何布局结构（grid、flex、padding、margin 等）
- 不修改 Chat 相关组件（ChatBubble.tsx、ChatPanel.tsx 等）的功能或交互
- 不修改数据获取逻辑、API 调用
- 不添加新组件或新页面
- 不修改 shadcn/ui 基础组件（badge、button、card 等）
- 不修改路由配置
- 不修改 store 逻辑
