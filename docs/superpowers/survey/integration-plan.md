# NanoClaw Dashboard 深度调研报告

> 调研日期：2026/05/18
> 调研范围：nanoclaw-dashboard-v2（前端）+ nanoclaw-v2（后端容器运行层）
> 约束：所有结论均基于实际代码读取，附文件路径与行号

---

## 1. Dashboard 技术栈

### 1.1 框架与构建工具

| 层级 | 技术选型 | 代码证据 |
|------|----------|----------|
| 前端框架 | **React 19** + TypeScript | `nanoclaw-dashboard-v2/package.json` 第 22-23 行：`"react": "^19.2.6"` |
| 构建工具 | **Vite 8** | `nanoclaw-dashboard-v2/package.json` 第 48 行：`"vite": "^8.0.12"` |
| 开发服务器 | Vite Dev Server（端口 5173） | `nanoclaw-dashboard-v2/vite.config.ts` 第 14-20 行：proxy 配置指向 `localhost:7777` |
| API 服务器 | Node.js 原生 `http` 模块（`server.js`） | `nanoclaw-dashboard-v2/server.js` 第 1 行：`import { createServer } from 'http'` |

### 1.2 样式系统

- **Tailwind CSS v4**（`nanoclaw-dashboard-v2/package.json` 第 45 行：`"tailwindcss": "^4.3.0"`）
- **Tailwind Vite 插件**：`nanoclaw-dashboard-v2/vite.config.ts` 第 3 行：`import tailwindcss from '@tailwindcss/vite'`
- **动画库**：`tw-animate-css`（`package.json` 第 26 行）

### 1.3 路由

- **TanStack Router**：`nanoclaw-dashboard-v2/package.json` 第 18 行：`"@tanstack/react-router": "^1.169.2"`
- Vite 插件自动生成路由树：`vite.config.ts` 第 4 行：`import { TanStackRouterVite } from '@tanstack/router-plugin/vite'`
- 路由文件位于 `src/routes/` 目录，采用文件系统路由约定

### 1.4 状态管理

采用**双轨状态管理**架构：

| 类型 | 库 | 用途 | 代码证据 |
|------|-----|------|----------|
| 服务端状态 | **TanStack Query v5** | API 数据获取、缓存、轮询 | `package.json` 第 17 行：`"@tanstack/react-query": "^5.100.10"`；`src/hooks/useDailyDigest.ts` 第 1 行：`import { useQuery } from '@tanstack/react-query'` |
| 客户端状态 | **Zustand v5** | Chat 面板 UI 状态、侧边栏、主题 | `package.json` 第 27 行：`"zustand": "^5.0.13"`；`src/stores/chatStore.ts` 第 1 行：`import { create } from 'zustand'` |

### 1.5 UI 组件库

- **shadcn/ui**：`package.json` 第 24 行：`"shadcn": "^4.7.0"`
- **Base UI**：`package.json` 第 15 行：`"@base-ui/react": "^1.4.1"`
- **图标**：Lucide React（`package.json` 第 21 行：`"lucide-react": "^1.14.0"`）

### 1.6 端口配置

| 服务 | 端口 | 配置位置 |
|------|------|----------|
| Dashboard API / Mock Server | **7777** | `server.js` 第 10 行：`const PORT = parseInt(process.env.PORT || '7777', 10)` |
| Vite Dev Server | **5173** | `vite.config.ts` 默认端口；`server.js` 第 16 行 CORS 允许 `http://localhost:5173` |
| 前端 API 代理 | `/api` -> `localhost:7777` | `vite.config.ts` 第 15-19 行 |

---

## 2. Dashboard 与 nanoclaw-v2 后端的通信机制

### 2.1 通信方式：HTTP REST API（通过中间层）

Dashboard **不直接连接**后端的 SQLite 数据库。所有数据流都通过 `server.js` 提供的 HTTP REST API 进行。

**数据流路径**：

```
前端 (React) --HTTP--> Vite Proxy (/api) --HTTP--> server.js (port 7777) --文件读取/SQLite查询--> nanoclaw-v2
```

代码证据：
- `nanoclaw-dashboard-v2/src/lib/api.ts` 第 18-44 行：封装了基于 `fetch` 的 HTTP 请求层，所有 API 调用都走 `/api` 前缀
- `nanoclaw-dashboard-v2/vite.config.ts` 第 15-19 行：Vite 开发服务器将 `/api` 代理到 `http://localhost:7777`

### 2.2 server.js 的双重角色

`server.js` 同时承担两个职责：

1. **Mock API 服务器**：为 Dashboard 提供 `/api/stats`、`/api/agents`、`/api/workflows`、`/api/logs`、`/api/security`、`/api/daily-digest` 等端点
2. **Chat 转发器**：将前端 Chat 消息通过 `pnpm run chat` 转发到 nanoclaw-v2 后端

代码证据：`nanoclaw-dashboard-v2/server.js` 第 334-418 行定义了所有 API 路由。

### 2.3 DB 访问方式

`server.js` 对 nanoclaw-v2 的数据访问有两种方式：

#### 方式 A：直接文件读取（daily-digest 历史记录）

```javascript
// server.js 第 81-104 行
async function readSentDigests() {
  const filePath = resolve(NANOCLAW_ROOT, 'groups/cli-with-muyu/daily-digest/data/sent-digests.jsonl')
  // ... 读取 JSONL 文件
}
```

#### 方式 B：直接 SQLite 查询（daily-digest 调度信息）

```javascript
// server.js 第 106-128 行
function querySQLite(dbPath, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', [dbPath, sql], { ... })
    // ... 通过 sqlite3 子进程查询
  })
}

// server.js 第 130-153 行
async function getDailyDigestSchedule() {
  const sql = `SELECT recurrence || '|' || process_after FROM messages_in WHERE kind = 'task' AND content LIKE '%daily-digest%' AND status = 'pending' ORDER BY process_after ASC LIMIT 1`
  const result = await querySQLite(dbPath, sql)
}
```

**注意**：`server.js` 直接通过 `sqlite3` 二进制查询 nanoclaw-v2 的 `data/v2.db`，而非通过 nanoclaw-v2 提供的 API。

#### 方式 C：CLI 子进程调用（Chat 消息）

```javascript
// server.js 第 218-263 行
function chatSpawn(msg) {
  const child = spawn('pnpm', ['run', 'chat', msg], {
    cwd: NANOCLAW_ROOT,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}
```

### 2.4 安全检查

`server.js` 实现了以下安全控制：

1. **CORS 限制**：`server.js` 第 14-16 行、第 274-277 行
   ```javascript
   const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
     ? process.env.ALLOWED_ORIGINS.split(',')
     : ['http://localhost:5173', 'http://127.0.0.1:5173']
   ```

2. **Chat 输入消毒**：`server.js` 第 265-272 行
   ```javascript
   function sanitizeChatInput(input) {
     return input
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;')
   }
   ```

3. **消息长度限制**：`server.js` 第 13 行：`const MAX_CHAT_MESSAGE_LENGTH = 2000`

4. **TODO 标注的安全缺口**：`server.js` 第 27-28 行
   ```javascript
   // TODO(P1-SEC): Add rate limiting middleware for all API endpoints.
   // TODO(P1-SEC): Add CSRF token validation for POST /api/chat.
   ```

### 2.5 Mock 模式

当 `NANOCLAW_ROOT` 指向的目录不存在 `package.json` 时，`server.js` 进入 **MOCK 模式**：

```javascript
// server.js 第 19-24 行
const hasNanoClaw = existsSync(resolve(NANOCLAW_ROOT, 'package.json'))
if (!hasNanoClaw) {
  console.warn(`[warn] NanoClaw root not found: ${NANOCLAW_ROOT}`)
  console.warn('  Running in MOCK mode. Set NANOCLAW_ROOT to enable real CLI calls.')
}
```

在 MOCK 模式下：
- `/api/stats`、`/api/agents`、`/api/workflows`、`/api/logs`、`/api/security` 返回硬编码的 Mock 数据（第 156-212 行）
- `/api/chat` 返回模拟回复（第 214-216 行）
- `/api/daily-digest` 返回 `{ mock: true }` 标记（第 370-389 行）

---

## 3. daily-news 面板的"实时"更新机制

### 3.1 实现方式：TanStack Query 轮询

**daily-news 面板没有使用 WebSocket、SSE 或长连接**。它采用基于 TanStack Query 的**定时轮询**机制。

代码证据：

```typescript
// src/hooks/useDailyDigest.ts 第 1-12 行
import { useQuery } from '@tanstack/react-query'
import { fetchDailyDigest } from '@/lib/api'
import { DAILY_DIGEST_REFRESH_INTERVAL } from '@/lib/constants'

export function useDailyDigest() {
  return useQuery({
    queryKey: ['dailyDigest'],
    queryFn: fetchDailyDigest,
    staleTime: DAILY_DIGEST_REFRESH_INTERVAL / 2,
    refetchInterval: DAILY_DIGEST_REFRESH_INTERVAL,  // <-- 定时轮询
  })
}
```

### 3.2 轮询间隔配置

```typescript
// src/lib/constants.ts 第 1-7 行
export const API_BASE_URL = '/api'
export const CHAT_TIMEOUT_MS = 120_000
export const DASHBOARD_REFRESH_INTERVAL = 30_000    // 30 秒
export const AGENT_REFRESH_INTERVAL = 10_000        // 10 秒
export const LOG_REFRESH_INTERVAL = 5_000           // 5 秒
export const DAILY_DIGEST_REFRESH_INTERVAL = 60_000 // 60 秒
```

### 3.3 各面板轮询策略对比

| 面板 | Hook 文件 | 轮询间隔 | staleTime | 是否轮询 |
|------|-----------|----------|-----------|----------|
| Stats | `useDashboardStats.ts` | 无 | 30s | 否（仅首次加载） |
| Agents | `useAgents.ts` | 10s | 10s | 是 |
| Workflows | `useWorkflows.ts` | 10s | 10s | 是 |
| Logs | `useLogs.ts` | 5s | 5s | 是 |
| Security | `useSecurityStatus.ts` | 无 | 60s | 否（仅首次加载） |
| Daily Digest | `useDailyDigest.ts` | 60s | 30s | 是 |

### 3.4 前端组件渲染

```typescript
// src/routes/index.tsx 第 20-26 行
function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: workflows, isLoading: workflowsLoading } = useWorkflows()
  const { data: logs, isLoading: logsLoading } = useLogs()
  const { data: security, isLoading: securityLoading } = useSecurityStatus()
  const { data: dailyDigest, isLoading: digestLoading } = useDailyDigest()
  // ...
}
```

`DailyDigestPanel` 组件接收 `data` 和 `isLoading` props，在数据加载时显示 Skeleton 骨架屏（`src/components/dashboard/DailyDigestPanel.tsx` 第 56-66 行）。

---

## 4. 触发 Agent 运行的现有机制

### 4.1 前端触发方式

Dashboard 前端**只有一种**触发 Agent 运行的方式：**Chat 面板发送消息**。

代码证据：

```typescript
// src/components/chat/ChatPanel.tsx 第 36-40 行
const handleSend = useCallback(async () => {
  const content = inputValue.trim()
  if (!content || isLoading) return
  setInputValue('')
  await send(content)
}, [inputValue, isLoading, send])
```

Chat 消息通过 `useChat` Hook 调用 `sendChatMessage` API：

```typescript
// src/hooks/useChat.ts 第 8-16 行
const send = useCallback(async (content: string) => {
  store.sendMessage(content)
  try {
    const { reply } = await sendChatMessage(content)
    store.receiveResponse(reply)
  } catch (err) {
    store.setError(err instanceof Error ? err.message : '发送失败，请重试')
  }
}, [store])
```

### 4.2 后端接收触发的方式

后端 nanoclaw-v2 有**多种**触发 Agent 运行的机制：

#### 机制 A：CLI Socket 消息（Chat 面板走的路线）

```typescript
// nanoclaw-v2/src/channels/cli.ts 第 51-136 行
const adapter: ChannelAdapter = {
  name: 'cli',
  channelType: 'cli',
  supportsThreads: false,
  // ...
  async setup(config: ChannelSetup): Promise<void> {
    server = net.createServer((socket) => handleConnection(socket, config))
    server.listen(sock, () => { ... })
  }
}
```

CLI 通道监听 Unix Socket (`data/cli.sock`)，接收消息后通过 `routeInbound` 路由到对应 Agent。

#### 机制 B：WeChat 消息

```typescript
// nanoclaw-v2/src/channels/wechat.ts 第 78-231 行
registerChannelAdapter('wechat', {
  factory: () => {
    // ... WeChatClient 长轮询接收消息
    client.on('message', (msg) => { onMessage(msg) })
  }
})
```

#### 机制 C：Host Sweep 定时唤醒（任务调度）

```typescript
// nanoclaw-v2/src/host-sweep.ts 第 174-186 行
const dueCount = countDueMessages(inDb)
if (dueCount > 0 && !isContainerRunning(session.id)) {
  log.info('Waking container for due messages', { sessionId: session.id, count: dueCount })
  await wakeContainer(session)
}
```

Host Sweep 每 60 秒检查一次所有 session 的 `messages_in` 表，如果有到期的 pending 消息且容器未运行，则自动唤醒容器。

#### 机制 D：Router 直接唤醒（消息到达时）

```typescript
// nanoclaw-v2/src/router.ts 第 472-484 行
if (wake) {
  startTypingRefresh(session.id, session.agent_group_id, event.channelType, event.platformId, event.threadId)
  const freshSession = getSession(session.id)
  if (freshSession) {
    const woke = await wakeContainer(freshSession)
    if (!woke) stopTypingRefresh(freshSession.id)
  }
}
```

当消息通过 `routeInbound` 路由到 Agent 时，如果 `wake=true`，直接调用 `wakeContainer` 唤醒容器。

### 4.3 Dashboard 到 Agent 的完整触发链路

```
用户点击 Chat 按钮 -> 输入消息 -> 点击发送
  -> ChatPanel.handleSend() -> useChat.send()
  -> api.ts sendChatMessage() -> POST /api/chat
  -> server.js chatSpawn() -> spawn('pnpm', ['run', 'chat', msg])
  -> nanoclaw-v2 CLI channel (data/cli.sock)
  -> router.ts routeInbound()
  -> session-manager.ts writeSessionMessage() -> inbound.db
  -> container-runner.ts wakeContainer() -> Docker spawn
  -> Agent 容器启动 -> 轮询 inbound.db -> 处理消息
```

### 4.4 重要结论

**Dashboard 前端目前没有提供除 Chat 以外的任何 Agent 触发方式**。没有"手动运行 Agent"、"触发工作流"、"发送任务"等按钮或 API。所有 Dashboard 的 stats/agents/workflows/logs/security 数据都是 Mock 数据或被动读取，不能主动触发后端行为。

---

## 5. 并发判断：多 Agent 容器并发与 Session 互斥

### 5.1 结论：支持多 Agent 并发，Session 级别互斥

**nanoclaw-v2 后端支持多 Agent 容器并发运行，但同一 Session 同时只能运行一个容器。**

### 5.2 并发控制机制

#### 5.2.1 全局活跃容器追踪

```typescript
// nanoclaw-v2/src/container-runner.ts 第 51 行
const activeContainers = new Map<string, { process: ChildProcess; containerName: string }>()
```

Key 是 `session.id`，这意味着**每个 session 最多只能有一个活跃容器**。

#### 5.2.2 Wake 去重机制

```typescript
// nanoclaw-v2/src/container-runner.ts 第 61-104 行
const wakePromises = new Map<string, Promise<boolean>>()

export function wakeContainer(session: Session): Promise<boolean> {
  if (activeContainers.has(session.id)) {
    log.debug('Container already running', { sessionId: session.id })
    return Promise.resolve(true)
  }
  const existing = wakePromises.get(session.id)
  if (existing) {
    log.debug('Container wake already in-flight — joining existing promise', { sessionId: session.id })
    return existing
  }
  // ... spawn
}
```

双重检查：
1. `activeContainers.has(session.id)` — 容器已在运行，直接返回
2. `wakePromises.get(session.id)` — 容器正在启动中（异步），复用已有 Promise

#### 5.2.3 Session 互斥的数据库层面保障

```typescript
// nanoclaw-v2/src/session-manager.ts 第 186-192 行
export function writeSessionMessage(...): void {
  const db = openInboundDb(agentGroupId, sessionId)
  try {
    insertMessage(db, { ... })
  } finally {
    db.close()
  }
}
```

**关键设计**：每次写入后立即关闭 DB 连接（`db.close()`），这是为了遵守"跨挂载可见性"原则——容器通过挂载看到的数据库文件需要 Host 关闭连接后才能刷新页缓存。

#### 5.2.4 双数据库架构的写互斥

```typescript
// nanoclaw-v2/src/session-manager.ts 第 1-12 行（文件头注释）
/**
 * Two-DB split — inbound.db (host writes) + outbound.db (container writes).
 * Three cross-mount invariants are load-bearing:
 *   1. journal_mode=DELETE — WAL's mmapped -shm doesn't refresh host->guest
 *   2. Host opens-writes-CLOSES per op — close invalidates the container's page cache
 *   3. One writer per file — DELETE-mode journal-unlink isn't atomic across the mount
 */
```

- **inbound.db**：Host 独占写入，容器只读
- **outbound.db**：容器独占写入，Host 只读（特殊情况下 Host 在容器停止后可写）

### 5.3 多 Session 并发

**不同 Session 之间完全独立，可以并发运行**：

```typescript
// nanoclaw-v2/src/delivery.ts 第 121-134 行
async function pollActive(): Promise<void> {
  const sessions = getRunningSessions()
  for (const session of sessions) {
    await deliverSessionMessages(session)
  }
  setTimeout(pollActive, ACTIVE_POLL_MS)
}
```

投递轮询遍历所有 running session，每个 session 的 outbound.db 独立读取。

```typescript
// nanoclaw-v2/src/host-sweep.ts 第 132-145 行
async function sweep(): Promise<void> {
  const sessions = getActiveSessions()
  for (const session of sessions) {
    await sweepSession(session)
  }
  setTimeout(sweep, SWEEP_INTERVAL_MS)
}
```

Host Sweep 同样遍历所有 active session，每个 session 独立检查和处理。

### 5.4 Session 的创建与查找

```typescript
// nanoclaw-v2/src/session-manager.ts 第 92-133 行
export function resolveSession(
  agentGroupId: string,
  messagingGroupId: string | null,
  threadId: string | null,
  sessionMode: 'shared' | 'per-thread' | 'agent-shared',
): { session: Session; created: boolean } {
  if (sessionMode === 'agent-shared') {
    const existing = findSessionByAgentGroup(agentGroupId)
    if (existing) return { session: existing, created: false }
  }
  // ...
}
```

Session 模式决定并发粒度：
- `shared`：一个 messaging group 对应一个 session（同组消息串行）
- `per-thread`：每个 thread 一个 session（同组不同 thread 可并行）
- `agent-shared`：一个 agent group 只有一个 session（该 agent 的所有消息串行）

### 5.5 容器生命周期管理

```typescript
// nanoclaw-v2/src/container-runner.ts 第 178-191 行
container.on('close', (code) => {
  activeContainers.delete(session.id)
  markContainerStopped(session.id)
  stopTypingRefresh(session.id)
  log.info('Container exited', { sessionId: session.id, code, containerName })
})
```

容器退出时自动清理 `activeContainers` 映射，允许后续消息再次唤醒。

### 5.6 并发策略总结

| 维度 | 策略 |
|------|------|
| 同一 Session | **互斥** — 同时只能有一个容器运行 |
| 不同 Session | **并发** — 完全独立，各自有独立的容器和 DB |
| 同一 Agent Group | 取决于 session_mode — `agent-shared` 时互斥，`per-thread` 时可并发 |
| 同一 Messaging Group | 取决于 wiring — 多个 Agent 可分别有自己的 session |
| 消息写入 | Host 串行写入 inbound.db（每次 open-write-close） |
| 消息读取 | 容器串行读取 inbound.db（轮询） |
| 投递 | Host 并发遍历所有 running session 的 outbound.db |

---

## 6. 集成方案建议

### 6.1 触发机制集成建议

**现状**：Dashboard 只能通过 Chat 面板触发 Agent（走 CLI socket）。

**建议**：
1. **扩展 `server.js` API**：添加 `POST /api/agents/:id/trigger` 端点，允许前端直接触发指定 Agent 运行
2. **后端新增 HTTP API 通道**：在 nanoclaw-v2 中添加一个轻量级 HTTP channel adapter（类似 CLI adapter），接收 Dashboard 的 HTTP 请求并转化为 `InboundEvent`
3. **任务队列界面**：在 Dashboard 添加"手动触发日报"、"运行工作流"等按钮，调用新的 trigger API

**实现路径**：
- 参考 `nanoclaw-v2/src/channels/cli.ts` 实现一个 `http-admin.ts` channel adapter
- 在 `server.js` 中添加 `POST /api/trigger` 端点，通过新的 channel 注入消息
- 或者复用 CLI channel，通过 `chatSpawn` 发送带 `to` 字段的定向消息

### 6.2 实时推流集成建议

**现状**：所有面板都是 TanStack Query 轮询（5s-60s 不等），没有真正的实时推送。

**建议**：

#### 方案 A：Server-Sent Events (SSE) — 推荐
1. 在 `server.js` 中添加 SSE 端点 `/api/events`
2. 后端 nanoclaw-v2 在关键事件发生时（容器启动/停止、消息投递、任务完成）写入一个事件文件或使用 SQLite 的 `notify` 机制
3. `server.js` 监听这些事件并通过 SSE 推送到前端
4. 前端用 `EventSource` 接收事件，触发 TanStack Query 的 `queryClient.invalidateQueries()`

#### 方案 B：缩短轮询间隔 + 增量更新
1. 将关键面板（workflows、logs）的轮询间隔缩短到 1-2 秒
2. API 返回增量数据（带 `since` 参数），减少传输量
3. 保持现有架构不变，实现简单

#### 方案 C：WebSocket
1. 在 `server.js` 中添加 WebSocket 服务器
2. 前后端建立持久连接
3. 适合双向通信（如 Chat 的实时打字指示器）

**推荐采用方案 A（SSE）**：
- 实现复杂度低于 WebSocket
- 天然支持单向推送（Dashboard 主要是接收状态更新）
- 与现有 HTTP 架构兼容
- 可复用现有 CORS 和安全配置

### 6.3 并发唤醒集成建议

**现状**：并发控制完全由后端 `container-runner.ts` 管理，前端无感知。

**建议**：
1. **前端显示容器状态**：在 Dashboard Agent 列表中显示每个 Agent 的容器状态（running / stopped / idle）
2. **暴露并发限制配置**：在 Dashboard 设置中允许调整 `ABSOLUTE_CEILING_MS`、`CLAIM_STUCK_MS` 等参数
3. **并发运行多个 Agent**：
   - 确保不同 Agent Group 使用不同的 session（默认行为）
   - 在 Dashboard 中提供"并行运行"开关，允许同一 Agent 的多个任务并发（需要后端支持 `per-thread` session mode）

**后端需要配合的改动**：
- 在 `data/v2.db` 的 `sessions` 表中已有 `container_status` 字段（`nanoclaw-v2/src/db/schema.ts` 第 111-112 行）
- 需要添加 API 暴露这些状态到 `server.js`
- 考虑添加 `GET /api/sessions` 端点返回所有 session 的容器状态

### 6.4 数据流架构图

```
+------------------+      HTTP REST       +------------------+      文件读取/SQLite      +------------------+
|  Dashboard React | <------------------> |   server.js      | <-----------------------> |  nanoclaw-v2     |
|  (port 5173)     |   /api/* (port 7777) |  (Mock API +     |    pnpm run chat /       |  (Host + Docker  |
|                  |                      |   Chat Forward)  |    sqlite3 query         |   Containers)    |
+------------------+                      +------------------+                          +------------------+
       ^                                                                           |              |
       | TanStack Query 轮询                                                      |              |
       | (5s-60s)                                                                  |  wakeContainer|
       |                                                                           |      |       |
       v                                                                           v      v       v
+------------------+                                                      +------------------------+
|  DailyDigestPanel|                                                      |   Session (inbound.db) |
|  AgentList       |                                                      |   Session (outbound.db)|
|  WorkflowStatus  |                                                      |   Container (Docker)   |
|  ...             |                                                      +------------------------+
+------------------+
```

---

## 附录：关键文件索引

| 文件路径 | 用途 |
|----------|------|
| `nanoclaw-dashboard-v2/package.json` | 前端依赖配置 |
| `nanoclaw-dashboard-v2/vite.config.ts` | Vite 配置（含代理） |
| `nanoclaw-dashboard-v2/server.js` | Mock API + Chat 转发服务器 |
| `nanoclaw-dashboard-v2/src/lib/api.ts` | 前端 HTTP API 封装 |
| `nanoclaw-dashboard-v2/src/lib/constants.ts` | 轮询间隔常量 |
| `nanoclaw-dashboard-v2/src/hooks/useDailyDigest.ts` | Daily Digest 轮询 Hook |
| `nanoclaw-dashboard-v2/src/hooks/useChat.ts` | Chat 消息发送 Hook |
| `nanoclaw-dashboard-v2/src/stores/chatStore.ts` | Chat 状态管理（Zustand） |
| `nanoclaw-v2/src/container-runner.ts` | 容器生命周期管理 |
| `nanoclaw-v2/src/session-manager.ts` | Session 创建、DB 写入 |
| `nanoclaw-v2/src/router.ts` | 入站消息路由 |
| `nanoclaw-v2/src/host-sweep.ts` | 定时 Sweep（唤醒、超时检测） |
| `nanoclaw-v2/src/delivery.ts` | 出站消息投递 |
| `nanoclaw-v2/src/channels/cli.ts` | CLI Socket 通道 |
| `nanoclaw-v2/src/db/schema.ts` | 数据库 Schema 定义 |
| `nanoclaw-v2/src/db/sessions.ts` | Session CRUD |
| `nanoclaw-v2/src/db/session-db.ts` | Session DB 操作 |
