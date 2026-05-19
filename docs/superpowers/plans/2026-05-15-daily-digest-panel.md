# Daily Digest Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Daily Digest panel to the Dashboard homepage showing recent AI tech news digests and next scheduled run time.

**Architecture:** Frontend panel polls `GET /api/daily-digest` every 60s. The API reads `sent-digests.jsonl` from the backend project (cross-project via `NANOCLAW_ROOT`) and queries backend SQLite for schedule info. The backend skill instructions are updated to persist full digest items.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, TanStack Query, Node.js HTTP server, SQLite3 CLI

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/index.ts` | Modify | Add `DigestItem`, `DailyDigest`, `DailyDigestResponse` types |
| `src/lib/constants.ts` | Modify | Add `DAILY_DIGEST_REFRESH_INTERVAL = 60_000` |
| `src/lib/api.ts` | Modify | Add `fetchDailyDigest()` API function |
| `src/hooks/useDailyDigest.ts` | Create | TanStack Query hook with 60s polling |
| `src/components/dashboard/DailyDigestPanel.tsx` | Create | Panel UI component |
| `src/routes/index.tsx` | Modify | Import and render `DailyDigestPanel` |
| `server.js` | Modify | Add `GET /api/daily-digest` route, JSONL reader, SQLite query helper |
| `nanoclaw-v2/container/skills/daily-digest/instructions.md` | Modify | Update two example JSONs to include `items` array |

---

### Task 1: Add TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add types to `src/types/index.ts`**

Append the following to the end of the file (after the existing `ApiResponse` interface):

```ts
export interface DigestItem {
  title: string
  summary: string
  url: string
  source: string
}

export interface DailyDigest {
  sentAt: string
  itemCount: number
  sections: string[]
  trigger?: 'scheduled' | 'manual'
  items?: DigestItem[]
}

export interface DailyDigestResponse {
  recentDigests: DailyDigest[]
  nextRun: string | null
  recurrence: string | null
  mock?: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add DailyDigest types for digest panel"
```

---

### Task 2: Add API Function and Constants

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Add refresh interval constant**

In `src/lib/constants.ts`, add after line 6:

```ts
export const DAILY_DIGEST_REFRESH_INTERVAL = 60_000
```

- [ ] **Step 2: Add `fetchDailyDigest` to `src/lib/api.ts`**

Add after the `fetchSecurityStatus` function (before the Chat API section):

```ts
export async function fetchDailyDigest(): Promise<DailyDigestResponse> {
  return request<DailyDigestResponse>('/daily-digest')
}
```

Also add `DailyDigestResponse` to the import from `@/types`:

```ts
import type { Agent, DailyDigestResponse, DashboardStats, LogEntry, SecurityStatus, Workflow } from '@/types'
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts src/lib/api.ts
git commit -m "feat(api): add fetchDailyDigest and refresh interval constant"
```

---

### Task 3: Create `useDailyDigest` Hook

**Files:**
- Create: `src/hooks/useDailyDigest.ts`

- [ ] **Step 1: Create the hook file**

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchDailyDigest } from '@/lib/api'
import { DAILY_DIGEST_REFRESH_INTERVAL } from '@/lib/constants'

export function useDailyDigest() {
  return useQuery({
    queryKey: ['dailyDigest'],
    queryFn: fetchDailyDigest,
    staleTime: DAILY_DIGEST_REFRESH_INTERVAL / 2,
    refetchInterval: DAILY_DIGEST_REFRESH_INTERVAL,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDailyDigest.ts
git commit -m "feat(hooks): add useDailyDigest with 60s polling"
```

---

### Task 4: Create `DailyDigestPanel` Component

**Files:**
- Create: `src/components/dashboard/DailyDigestPanel.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import type { DailyDigestResponse } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

interface DailyDigestPanelProps {
  data: DailyDigestResponse | undefined
  isLoading: boolean
}

function formatSentAt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNextRun(iso: string | null): string {
  if (!iso) return '未安排'
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `今天 ${timeStr}`
  const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  return `${dateStr} ${timeStr}`
}

export function DailyDigestPanel({ data, isLoading }: DailyDigestPanelProps) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-card)] mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span className="text-sm font-semibold text-text">AI 技术日报</span>
        </div>
        <div className="flex items-center gap-3">
          {data?.mock && (
            <span className="text-[10px] text-text2 bg-bg px-2 py-0.5 rounded-[var(--radius-badge)] border border-border">
              模拟数据
            </span>
          )}
          <span className="text-xs text-text2">
            下次：{formatNextRun(data?.nextRun ?? null)}
          </span>
          {data?.recurrence && (
            <span className="text-[10px] text-accent bg-accent-dim px-2 py-0.5 rounded-[var(--radius-badge)] font-mono">
              {data.recurrence}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.recentDigests || data.recentDigests.length === 0) && (
        <div className="text-sm text-text2 py-8 text-center">暂无日报记录</div>
      )}

      {!isLoading && data?.recentDigests.map((digest) => (
        <div key={digest.sentAt} className="mb-4 last:mb-0">
          <div className="flex items-center gap-2 text-xs text-text2 mb-2 pb-2 border-b border-border">
            <span>{formatSentAt(digest.sentAt)}</span>
            <span>·</span>
            <span>{digest.itemCount} 条</span>
            <span>·</span>
            <span>{digest.trigger === 'manual' ? '手动触发' : '定时触发'}</span>
          </div>

          {digest.items && digest.items.length > 0 ? (
            <div className="space-y-3">
              {digest.items.map((item, idx) => (
                <div key={idx} className="group">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1 text-sm font-medium text-text hover:text-accent transition-colors"
                  >
                    <span className="mt-0.5">·</span>
                    <span className="flex-1">{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-text2" />
                  </a>
                  <p className="text-xs text-text2 ml-3.5 mt-0.5 line-clamp-2">{item.summary}</p>
                  <span className="text-[10px] text-text3 ml-3.5 mt-0.5 inline-block bg-bg px-1.5 py-0.5 rounded-[var(--radius-badge)]">
                    {item.source}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-text2 ml-3.5 py-1">摘要暂不可用（历史记录）</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DailyDigestPanel.tsx
git commit -m "feat(ui): add DailyDigestPanel component"
```

---

### Task 5: Wire Panel into Dashboard Homepage

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Import and render the panel**

Add imports at the top of `src/routes/index.tsx`:

```tsx
import { useDailyDigest } from '@/hooks/useDailyDigest'
import { DailyDigestPanel } from '@/components/dashboard/DailyDigestPanel'
```

In the `DashboardPage` component, add the hook call:

```tsx
const { data: dailyDigest, isLoading: digestLoading } = useDailyDigest()
```

Add the panel at the end of the return JSX (after the last `</div>` grid):

```tsx
<DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
```

The final return should look like:

```tsx
return (
  <div>
    <StatsGrid stats={stats} isLoading={statsLoading} />

    <div className="grid grid-cols-2 gap-4 mb-5">
      <AgentList agents={agents} isLoading={agentsLoading} />
      <WorkflowStatus workflows={workflows} isLoading={workflowsLoading} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <LogList logs={logs} isLoading={logsLoading} />
      <SecurityGrid security={security} isLoading={securityLoading} />
    </div>

    <DailyDigestPanel data={dailyDigest} isLoading={digestLoading} />
  </div>
)
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(dashboard): wire DailyDigestPanel into homepage"
```

---

### Task 6: Add API Route to `server.js`

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Add helper functions before the server creation**

After the `cliSpawn` function definition (around line 79), add:

```js
async function readSentDigests() {
  const filePath = resolve(NANOCLAW_ROOT, 'groups/cli-with-muyu/daily-digest/data/sent-digests.jsonl')
  if (!existsSync(filePath)) {
    return []
  }
  try {
    const content = await readFile(filePath, 'utf8')
    const lines = content.split('\n').filter((l) => l.trim().length > 0)
    const digests = []
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line)
        digests.push(parsed)
      } catch {
        console.warn(`[warn] Failed to parse sent-digests line: ${line.slice(0, 100)}`)
      }
    }
    // Return most recent 3, newest first
    return digests.reverse().slice(0, 3)
  } catch (err) {
    console.warn('[warn] Failed to read sent-digests:', err.message)
    return []
  }
}

function querySQLite(dbPath, sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('sqlite3', [dbPath, sql], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('sqlite3 query timed out'))
    }, 5_000)
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code !== 0) {
        reject(new Error(stderr.trim() || `sqlite3 exited with code ${code}`))
        return
      }
      resolve(stdout.trim())
    })
  })
}

async function getDailyDigestSchedule() {
  if (!hasNanoClaw) {
    return { nextRun: null, recurrence: null, mock: true }
  }
  try {
    const dbPath = resolve(NANOCLAW_ROOT, 'data/v2.db')
    if (!existsSync(dbPath)) {
      return { nextRun: null, recurrence: null }
    }
    const sql = `SELECT recurrence || '|' || process_after FROM messages_in WHERE kind = 'task' AND content LIKE '%daily-digest%' AND status = 'pending' ORDER BY process_after ASC LIMIT 1`
    const result = await querySQLite(dbPath, sql)
    if (!result) {
      return { nextRun: null, recurrence: null }
    }
    const [recurrence, processAfter] = result.split('|')
    return {
      nextRun: processAfter || null,
      recurrence: recurrence || null,
    }
  } catch (err) {
    console.warn('[warn] Failed to query daily-digest schedule:', err.message)
    return { nextRun: null, recurrence: null }
  }
}
```

- [ ] **Step 2: Add the route handler**

In the API routes section of the server (after the `/api/security` handler, before the `/api/chat` handler), add:

```js
if (req.method === 'GET' && url.pathname === '/api/daily-digest') {
  try {
    const [recentDigests, schedule] = await Promise.all([
      readSentDigests(),
      getDailyDigestSchedule(),
    ])
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      recentDigests,
      nextRun: schedule.nextRun,
      recurrence: schedule.recurrence,
      ...(schedule.mock ? { mock: true } : {}),
    }))
  } catch (err) {
    console.error('[error] /api/daily-digest:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to fetch daily digest' }))
  }
  return
}
```

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat(api): add GET /api/daily-digest route"
```

---

### Task 7: Update Backend Skill Instructions

**Files:**
- Modify: `nanoclaw-v2/container/skills/daily-digest/instructions.md`

- [ ] **Step 1: Update the scheduled trigger example**

Find this line (around line 123):

```json
{"sentAt":"2026-05-15T09:00:00+08:00","itemCount":6,"sections":["大模型","开源工具"]}
```

Replace with:

```json
{"sentAt":"2026-05-15T09:00:00+08:00","itemCount":6,"sections":["大模型","开源工具"],"items":[{"title":"GPT-5 技术报告发布","summary":"OpenAI 发布了 GPT-5 的技术报告，展示了在推理能力和多模态理解上的重大提升。","url":"https://openai.com/research/gpt-5","source":"hackernews"}]}
```

- [ ] **Step 2: Update the manual trigger example**

Find this line (around line 418):

```json
{"sentAt":"2026-05-15T14:30:00+08:00","itemCount":6,"sections":["大模型","开源工具"],"trigger":"manual"}
```

Replace with:

```json
{"sentAt":"2026-05-15T14:30:00+08:00","itemCount":6,"sections":["大模型","开源工具"],"trigger":"manual","items":[{"title":"GPT-5 技术报告发布","summary":"OpenAI 发布了 GPT-5 的技术报告，展示了在推理能力和多模态理解上的重大提升。","url":"https://openai.com/research/gpt-5","source":"hackernews"}]}
```

- [ ] **Step 3: Commit**

```bash
git add nanoclaw-v2/container/skills/daily-digest/instructions.md
git commit -m "feat(daily-digest): persist full items array to sent-digests.jsonl"
```

---

### Task 8: Manual Verification

- [ ] **Step 1: Start the dev server**

```bash
pnpm run dev
```

Verify both services start:
- API Server on `http://127.0.0.1:7777`
- Vite Dev Server on `http://localhost:5173`

- [ ] **Step 2: Verify API endpoint**

```bash
curl http://127.0.0.1:7777/api/daily-digest | jq
```

Expected: Returns `recentDigests` array (may be empty if no backend connected), `nextRun`, `recurrence`.

- [ ] **Step 3: Verify UI**

Open `http://localhost:5173` in browser. Confirm:
- Panel appears at bottom of Dashboard
- "暂无日报记录" or existing data displays correctly
- No console errors
- Panel refreshes every 60s (check Network tab for repeated `/api/daily-digest` calls)

- [ ] **Step 4: Commit any fixes**

If any fixes were needed during verification:

```bash
git add -A
git commit -m "fix: daily-digest panel verification fixes"
```

---

## Self-Review

**Spec coverage:**
- [x] Data model extension (`items` array) → Task 7
- [x] API route (`GET /api/daily-digest`) → Task 6
- [x] Panel component with card styling → Task 4
- [x] 60s polling → Task 3
- [x] Cross-project path handling → Task 6 (`NANOCLAW_ROOT`)
- [x] Schedule info from SQLite → Task 6
- [x] Old record compatibility → Task 4 (`items ? ... : "摘要暂不可用"`)
- [x] Click-to-open URL → Task 4 (`<a target="_blank">`)

**Placeholder scan:** No TBD, TODO, or vague steps found.

**Type consistency:**
- `DigestItem`, `DailyDigest`, `DailyDigestResponse` defined in Task 1
- Used in `fetchDailyDigest` return type (Task 2), `useDailyDigest` (Task 3), and `DailyDigestPanel` props (Task 4)
- Server response shape matches `DailyDigestResponse` (Task 6)

**No gaps found.**
