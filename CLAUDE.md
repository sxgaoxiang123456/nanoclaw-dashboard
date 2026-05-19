# NanoClaw Dashboard v2

NanoClaw 多 Agent 系统的管理控制台前端。提供 Agent 管理、工作流监控、统计看板、安全状态、以及右下角 Andy Agent 实时对话面板。

## 技术栈

- **框架**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4
- **路由**: TanStack Router
- **状态**: TanStack Query（服务端数据）+ Zustand（客户端状态）
- **UI 组件**: shadcn/ui + Base UI

## 外部依赖

- **后端 API 服务** (`server.js`, 端口 7777)：提供 Dashboard Mock 数据（`/api/stats`、`/api/agents`、`/api/workflows`、`/api/logs`、`/api/security`）和 Chat 接口（`/api/chat`）
- **NanoClaw v2 后端**（`../nanoclaw-v2`）：Chat 消息通过 `pnpm run chat` 转发到后端 CLI socket，由 Andy Agent 处理

## 启动方式

```bash
cd nanoclaw-dashboard-v2
pnpm install
pnpm run dev
```

`pnpm run dev` 会自动同时启动两个服务：
- **API Server** (`server.js`) → `http://127.0.0.1:7777`
- **Vite Dev Server** → `http://localhost:5173`

前端页面通过 Vite proxy `/api` → `localhost:7777` 访问数据。生产环境先 `pnpm run build` 再 `node server.js`（静态文件 + API 合一）。
