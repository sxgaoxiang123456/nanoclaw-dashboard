# Daily Digest Panel 设计方案

## 背景

nanoclaw-v2 后端已跑通 daily-news Agent（Andy），每天早上 9:00 自动抓取 HN + RSS 技术源，经 LLM 筛选摘要后通过微信推送。现需在 Dashboard 前端增加一个面板，展示最近推送过的日报内容和下次调度信息。

## 目标

- 在 Dashboard 主页底部新增全宽 panel
- 显示最近推送的日报新闻（标题 + 中文摘要 + 来源 URL + 推送时间）
- 显示下次调度执行时间 + recurrence 表达式
- 60s 轮询刷新，不使用 WebSocket
- 视觉风格与现有 PanelCard 保持一致

## 数据模型

### sent-digests.jsonl 扩展格式

在现有字段基础上增加 `items` 数组，存储 LLM 生成后的完整日报内容。旧记录无 `items` 字段，前端兼容渲染。

```json
{
  "sentAt": "2026-05-15T09:00:00+08:00",
  "itemCount": 6,
  "sections": ["大模型", "开源工具"],
  "trigger": "scheduled",
  "items": [
    {
      "title": "GPT-5 技术报告发布",
      "summary": "OpenAI 发布了 GPT-5 的技术报告，展示了在推理能力和多模态理解上的重大提升。",
      "url": "https://openai.com/research/gpt-5",
      "source": "hackernews"
    }
  ]
}
```

字段说明：

| 字段 | 类型 | 说明 |
|------|------|------|
| `sentAt` | ISO 8601 string | 推送时间，带时区 |
| `itemCount` | number | 本次推送总条目数 |
| `sections` | string[] | 板块名称列表 |
| `trigger` | `"scheduled" \| "manual"` | 触发方式 |
| `items` | DigestItem[] | 每条新闻的完整信息 |

DigestItem：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文章标题 |
| `summary` | string | 2~3 句话中文摘要 |
| `url` | string | 原文链接 |
| `source` | string | 来源标识，如 `hackernews`、`rss` |

### 调度信息来源

后端 SQLite `v2.db` 的 `messages_in` 表：

```sql
SELECT recurrence, process_after
FROM messages_in
WHERE kind = 'task'
  AND content LIKE '%daily-digest%'
  AND status = 'pending'
ORDER BY process_after ASC
LIMIT 1
```

## API 设计

### 路由

```
GET /api/daily-digest
```

### 成功响应（200）

```json
{
  "recentDigests": [
    {
      "sentAt": "2026-05-17T09:00:00+08:00",
      "itemCount": 8,
      "sections": ["AI开发工具", "AI产业观察", "AI生态动态"],
      "trigger": "scheduled",
      "items": [
        {
          "title": "Claude 4.7 发布",
          "summary": "Anthropic 发布 Claude 4.7，在代码理解和长上下文处理上有显著提升。",
          "url": "https://anthropic.com/news/claude-4-7",
          "source": "hackernews"
        }
      ]
    }
  ],
  "nextRun": "2026-05-18T09:00:00+08:00",
  "recurrence": "0 9 * * *"
}
```

### 错误响应

| 场景 | 状态码 | 响应体 |
|------|--------|--------|
| NanoClaw 未连接（MOCK 模式） | 200 | `{ recentDigests: [], nextRun: null, recurrence: null, mock: true }` |
| 数据库读取失败 | 500 | `{ error: "Failed to read schedule info" }` |
| sent-digests.jsonl 不存在或为空 | 200 | `recentDigests: []` |
| 某行 JSONL 解析失败 | 200 | 跳过该行，解析其余行 |

### 缓存策略

无缓存，每次请求实时读取。数据量小（文件 < 1MB），文件读取快。

## 前端组件设计

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/components/dashboard/DailyDigestPanel.tsx` | Panel 组件 |
| `src/hooks/useDailyDigest.ts` | TanStack Query hook（60s 轮询） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/lib/api.ts` | 新增 `fetchDailyDigest()` |
| `src/types/index.ts` | 新增 `DailyDigest`, `DigestItem`, `DailyDigestResponse` 类型 |
| `src/routes/index.tsx` | 引入并渲染 `DailyDigestPanel` |
| `server.js` | 新增 `GET /api/daily-digest` 路由处理器 |

### Dashboard 布局变更

在现有两栏 grid 下方新增全宽 panel：

```tsx
<div>
  <StatsGrid ... />
  <div className="grid grid-cols-2 gap-4 mb-5">...</div>
  <div className="grid grid-cols-2 gap-4 mb-5">...</div>
  <DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
</div>
```

### 视觉设计

沿用现有 card 样式：
- 外层：`bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)]`
- 头部：左标题"AI 技术日报"，右显示下次执行时间 + cron 表达式
- 主体：最近 3 条日报，按时间倒序排列

单条日报渲染结构：
- 时间分区行：`2026-05-17 09:00 · 8 条 · 定时触发`
- 板块标题：`【AI 开发工具】`
- 新闻条目：
  - 标题（可点击，新标签页打开原文）
  - 摘要（2~3 句话）
  - 来源标签：`[hackernews]` + 外链图标

### 交互

- **标题点击**：`window.open(url, '_blank')` 新标签页打开原文
- **无数据状态**：显示"暂无日报记录"
- **MOCK 模式**：右上角小标签"模拟数据"
- **旧记录兼容**：无 `items` 字段时显示"摘要暂不可用"

### 轮询策略

```ts
useQuery({
  queryKey: ['dailyDigest'],
  queryFn: fetchDailyDigest,
  refetchInterval: 60_000, // 60s
  staleTime: 30_000,
})
```

## 跨项目路径处理

前端 `server.js` 已有 `NANOCLAW_ROOT` 环境变量（默认 `../nanoclaw-v2`）。新增路由中直接使用：

```js
const DIGEST_LOG_PATH = resolve(NANOCLAW_ROOT, 'groups/cli-with-muyu/daily-digest/data/sent-digests.jsonl')
const V2_DB_PATH = resolve(NANOCLAW_ROOT, 'data/v2.db')
```

边界处理：
- `sent-digests.jsonl` 不存在 → `recentDigests: []`
- `v2.db` 不存在（MOCK 模式）→ `nextRun: null, recurrence: null, mock: true`
- 文件读取权限错误 → 500，带具体错误信息
- JSONL 中某行解析失败 → 跳过该行，记录 warn 日志，继续解析后续行

## 后端同步变更（详细）

### 变更文件

仅修改一个文件：`nanoclaw-v2/container/skills/daily-digest/instructions.md`

### 具体修改位置

该文件中有两处"推送成功后记录发送日志"的示例 JSON，需要同步更新：

1. **Step 5 — 定时触发**（约第 123 行）：
   ```json
   {"sentAt":"2026-05-15T09:00:00+08:00","itemCount":6,"sections":["大模型","开源工具"]}
   ```
   更新为包含 `items` 数组的完整格式。

2. **手动触发章节**（约第 418 行）：
   ```json
   {"sentAt":"2026-05-15T14:30:00+08:00","itemCount":6,"sections":["大模型","开源工具"],"trigger":"manual"}
   ```
   同样更新为包含 `items` 数组的完整格式，`trigger` 字段保留。

### 写入机制说明

Agent 容器在推送成功后，通过 MCP tool（`write_file` / `append_file`）将 JSON 记录追加到 `sent-digests.jsonl`。`items` 数组的内容来源于 Step 3 LLM 结构化输出的 `DailyDigest.sections[].items`，此前仅用于微信推送，现增加持久化。

### 增量开发评估

| 评估项 | 结论 |
|--------|------|
| Host 端代码是否修改 | **否**。不涉及 `src/` 下任何文件 |
| 数据库 schema 是否变更 | **否**。`sent-digests.jsonl` 是文本文件，非 SQLite 表 |
| 容器镜像是否需要重建 | **否**。`instructions.md` 在容器 spawn 时由 `composeGroupClaudeMd()` 动态组装到 CLAUDE.md 中，无需重建镜像 |
| 现有运行是否中断 | **否**。旧记录保留，新记录追加，JSONL 格式天然支持异构行共存 |
| 是否需要协调前后端上线顺序 | **否**。前端先上线并兼容旧记录，后端 instructions 更新后下一次 Agent 执行即生效 |
| 回滚策略 | 如需回滚，只需将 `instructions.md` 改回旧示例。已写入的新格式记录不影响旧逻辑 |

### 兼容性说明

旧记录（无 `items`）和新记录（有 `items`）可在同一文件中共存：

```jsonl
{"sentAt":"2026-05-15T09:00:00+08:00","itemCount":6,"sections":["大模型","开源工具"]}          // 旧记录
{"sentAt":"2026-05-16T09:00:00+08:00","itemCount":8,"sections":["AI开发工具"],"trigger":"scheduled","items":[...]}  // 新记录
```

前端解析时每行独立处理，缺失 `items` 时显示"摘要暂不可用"，不影响其他记录的渲染。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4（样式）
- TanStack Query（数据获取 + 轮询）
- shadcn/ui Skeleton（加载态）

## 测试要点

1. API 返回空数组时面板正常渲染
2. 旧记录（无 `items`）兼容显示
3. MOCK 模式下返回 `mock: true` 标志
4. 60s 轮询正常触发 refetch
5. 标题点击正确打开外部链接
6. JSONL 某行损坏时跳过该行不崩溃
