# NanoClaw Dashboard v2

NanoClaw Dashboard v2 是 NanoClaw 智能体平台的管理仪表盘，提供实时的 Agent 状态监控、工作流管理、日志审计、安全态势感知和全局 AI 助手对话能力。

## 功能概览

| 模块 | 说明 |
|------|------|
| **Dashboard** | 核心数据总览：Agent 在线状态、工作流执行统计、最近日志、安全评分 |
| **Agents** | Agent 列表与管理（占位页面，预留扩展） |
| **Skills** | Skill 技能库浏览（占位页面，预留扩展） |
| **Workflows** | 工作流编排与状态追踪（占位页面，预留扩展） |
| **Logs** | 系统运行日志审计（占位页面，预留扩展） |
| **Security** | 安全态势评分与风险告警 |
| **Settings** | 系统配置（占位页面，预留扩展） |
| **AI Chat** | 全局悬浮聊天面板，支持 NanoClaw CLI 智能体对话 |

## 技术栈

| 领域 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS v4 + tw-animate-css |
| UI 组件 | shadcn/ui + @base-ui/react |
| 路由 | TanStack Router（文件系统路由） |
| 状态管理 | Zustand |
| 数据获取 | TanStack Query |
| 测试 | Vitest + jsdom + Testing Library |
| 字体 | Geist Variable |
| API 网关 | Node.js 原生 http 模块 |

## 项目启动

### 前置要求

- Node.js >= 20
- pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 开发模式

需要同时启动前端 Dev Server 和 API Gateway：

```bash
# 终端 1：启动 API Gateway（端口 7777）
node server.js

# 终端 2：启动前端（端口 5173）
pnpm dev
```

前端通过 Vite 代理将 `/api` 请求转发到 Gateway。

### 生产构建

```bash
pnpm build
node server.js
```

Gateway 会托管 `dist` 目录下的静态资源。

### 运行测试

```bash
pnpm test        # 交互式 watch 模式
pnpm test:run    # 一次性运行
```

## 支持的服务

### API Gateway (`server.js`)

Gateway 提供以下端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `GET /api/stats` | GET | 仪表盘统计数据（Agent 数、工作流数、日志数、安全评分） |
| `GET /api/agents` | GET | Agent 列表 |
| `GET /api/workflows` | GET | 工作流列表 |
| `GET /api/logs` | GET | 最近日志 |
| `GET /api/security` | GET | 安全状态 |
| `POST /api/chat` | POST | AI 聊天消息转发（输入长度限制 2000 字符） |

### 运行模式

- **Mock 模式**（默认）：当 `NANOCLAW_ROOT` 指向的目录不存在时，Gateway 返回模拟数据
- **真实模式**：设置 `NANOCLAW_ROOT=../nanoclaw-v2`，Gateway 会通过 `pnpm run` 调用 NanoClaw CLI 获取真实数据

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `7777` | API Gateway 端口 |
| `NANOCLAW_ROOT` | `../nanoclaw-v2` | NanoClaw CLI 根目录 |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS 允许的源 |

## 项目结构

```
├── server.js              # API Gateway（mock 数据 + NanoClaw CLI 代理）
├── vite.config.ts         # Vite 配置（含 /api 代理）
├── src/
│   ├── main.tsx           # 应用入口
│   ├── routes/            # TanStack Router 页面路由
│   │   ├── index.tsx      # Dashboard 首页
│   │   ├── agents.tsx     # Agents 页
│   │   ├── skills.tsx     # Skills 页
│   │   ├── workflows.tsx  # Workflows 页
│   │   ├── logs.tsx       # Logs 页
│   │   ├── security.tsx   # Security 页
│   │   └── settings.tsx   # Settings 页
│   ├── components/
│   │   ├── ui/            # shadcn/ui 基础组件
│   │   ├── layout/        # Sidebar, TopBar 布局组件
│   │   ├── dashboard/     # Dashboard 业务组件
│   │   └── chat/          # ChatPanel, ChatBubble 聊天组件
│   ├── hooks/             # 业务数据 Hooks（TanStack Query）
│   ├── stores/            # Zustand 全局状态（sidebar, theme, chat）
│   ├── lib/               # 工具函数、API 客户端、格式化器
│   ├── types/             # TypeScript 类型定义
│   └── styles/            # 全局样式
└── ...
```
