import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const NANOCLAW_ROOT = resolve(process.env.NANOCLAW_ROOT || '../nanoclaw-v2')
const PORT = parseInt(process.env.PORT || '7777', 10)
const HTML_PATH = resolve(__dirname, 'dist', 'index.html')
const CHAT_TIMEOUT_MS = 120_000
const MAX_CHAT_MESSAGE_LENGTH = 2000
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

// Check NanoClaw root
const hasNanoClaw = existsSync(resolve(NANOCLAW_ROOT, 'package.json'))

if (!hasNanoClaw) {
  console.warn(`[warn] NanoClaw root not found: ${NANOCLAW_ROOT}`)
  console.warn('  Running in MOCK mode. Set NANOCLAW_ROOT to enable real CLI calls.')
}

// Cache for dashboard stats (TTL: 10s)
// TODO(P1-SEC): Add rate limiting middleware for all API endpoints.
// TODO(P1-SEC): Add CSRF token validation for POST /api/chat.
let statsCache = null
let statsCacheTime = 0
const STATS_CACHE_TTL = 10_000

function cliSpawn(command, args = []) {
  return new Promise((resolve, reject) => {
    if (!hasNanoClaw) {
      reject(new Error('NanoClaw CLI not available'))
      return
    }

    const child = spawn('pnpm', ['run', command, ...args], {
      cwd: NANOCLAW_ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })

    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('Command timed out after 30s'))
    }, 30_000)

    child.on('error', (err) => {
      clearTimeout(timer)
      reject(new Error(`Failed to spawn: ${err.message}`))
    })

    child.on('close', (code) => {
      clearTimeout(timer)
      const filter = (l) => {
        const t = l.trim()
        return t.length > 0 && !t.startsWith('> ') && !t.includes('ELIFECYCLE')
      }
      const outLines = stdout.split('\n').filter(filter)
      const errLines = stderr.split('\n').filter(filter)
      const output = outLines.join('\n').trim()

      if (code !== 0 && !output) {
        reject(new Error(errLines.join('\n').trim() || `Exited with code ${code}`))
        return
      }
      resolve(output)
    })
  })
}

// Mock data generators (replace with real CLI calls as backend evolves)
function getMockStats() {
  return {
    agentCount: 5,
    runningAgents: 1,
    pausedAgents: 4,
    skillCount: 14,
    customSkills: 0,
    thirdPartySkills: 14,
    todayExecutions: 7,
    yesterdayExecutions: 3,
    todayCost: 0.04,
    monthlyCost: 0.04,
    monthlyBudget: 50,
  }
}

function getMockAgents() {
  return [
    { id: '1', name: 'Andy', description: '默认助理 Agent', model: 'Claude Opus 4.7', status: 'running', avatar: '🐾' },
    { id: '2', name: 'CodeReviewer', description: '代码审查 Agent', model: 'Claude Sonnet 4.6', status: 'paused', avatar: '⚡' },
    { id: '3', name: 'Explorer', description: '代码探索 Agent', model: 'Claude Haiku 4.5', status: 'paused', avatar: '🔍' },
    { id: '4', name: 'Planner', description: '任务规划 Agent', model: 'Claude Sonnet 4.6', status: 'paused', avatar: '📋' },
    { id: '5', name: 'Analyzer', description: '数据分析 Agent', model: 'Claude Opus 4.7', status: 'paused', avatar: '📊' },
  ]
}

function getMockWorkflows() {
  return [
    { id: '1', name: 'Andy 对话会话', status: 'running', startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { id: '2', name: 'Skill: 文件搜索', status: 'completed', startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '3', name: 'Agent: 代码审查', status: 'completed', startedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString() },
    { id: '4', name: 'Skill: 依赖分析', status: 'completed', startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: '5', name: 'Agent: 安全扫描', status: 'failed', startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ]
}

function getMockLogs() {
  const now = new Date()
  return [
    { id: '1', time: new Date(now.getTime() - 18 * 60 * 1000).toISOString(), type: 'exec', message: 'Andy 对话 · "帮我分析这个项目的结构"' },
    { id: '2', time: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), type: 'exec', message: 'Skill: 文件搜索 · 查找 src/ 下所有 TypeScript 文件' },
    { id: '3', time: new Date(now.getTime() - 72 * 60 * 1000).toISOString(), type: 'create', message: 'Agent: CodeReviewer 已创建 (Sonnet 4.6)' },
    { id: '4', time: new Date(now.getTime() - 90 * 60 * 1000).toISOString(), type: 'config', message: 'Skills 市场同步完成 · 14 个 Skill 可用' },
    { id: '5', time: new Date(now.getTime() - 120 * 60 * 1000).toISOString(), type: 'exec', message: 'Skill: 代码审查 · "review PR #42 的安全变更"' },
    { id: '6', time: new Date(now.getTime() - 180 * 60 * 1000).toISOString(), type: 'create', message: '工作流: 每日安全扫描 已创建' },
  ]
}

function getMockSecurity() {
  return {
    costControl: { singleLimit: 5, monthlyUsed: 0.04, monthlyLimit: 50, status: 'healthy' },
    skillAudit: { total: 14, pending: 0, status: 'healthy' },
    manualApproval: { pendingRequests: 0, status: 'healthy' },
    overall: 'healthy',
    lastCheckedAt: new Date().toISOString(),
  }
}

function mockChatReply(msg) {
  return { reply: `你好！我是 Andy，NanoClaw 的智能助手。收到你的消息："${msg}"\n\n（注意：当前运行在 Mock 模式，NanoClaw 后端未连接）` }
}

function chatSpawn(msg) {
  return new Promise((resolve, reject) => {
    if (!hasNanoClaw) {
      resolve(mockChatReply(msg))
      return
    }

    const child = spawn('pnpm', ['run', 'chat', msg], {
      cwd: NANOCLAW_ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8') })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8') })

    const timer = setTimeout(() => {
      child.kill()
      resolve(mockChatReply(msg))
    }, 5000)

    child.on('error', (err) => {
      clearTimeout(timer)
      resolve(mockChatReply(msg))
    })

    child.on('close', (code) => {
      clearTimeout(timer)
      const filter = (l) => {
        const t = l.trim()
        return t.length > 0 && !t.startsWith('> ') && !t.includes('ELIFECYCLE')
      }
      const outLines = stdout.split('\n').filter(filter)
      const errLines = stderr.split('\n').filter(filter)
      const reply = outLines.join('\n').trim()
      if (code !== 0 && !reply) {
        resolve(mockChatReply(msg))
        return
      }
      resolve({ reply: reply || '(no response)' })
    })
  })
}

function sanitizeChatInput(input) {
  // Remove potentially dangerous HTML/script tags
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function isValidOrigin(origin) {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || ''
  if (isValidOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || ALLOWED_ORIGINS[0])
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  // Serve static files from dist
  if (req.method === 'GET' && url.pathname.startsWith('/assets/')) {
    try {
      const filePath = resolve(__dirname, 'dist', url.pathname.slice(1))
      const content = await readFile(filePath)
      const ext = url.pathname.split('.').pop()
      const contentType = ext === 'js' ? 'application/javascript' : ext === 'css' ? 'text/css' : 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    } catch {
      res.writeHead(404)
      res.end('Not found')
    }
    return
  }

  // Serve index.html
  if (req.method === 'GET' && url.pathname === '/') {
    try {
      const html = await readFile(HTML_PATH, 'utf8')
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
    } catch {
      // Fallback HTML if dist/index.html doesn't exist (e.g., before build)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>NanoClaw Dashboard</title></head>
<body style="background:#0a0a0a;color:#f5f5f5;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h1>NanoClaw Dashboard</h1>
    <p>Dashboard not built yet. Run <code>npm run build</code> first.</p>
  </div>
</body>
</html>`)
    }
    return
  }

  // API Routes
  if (req.method === 'GET' && url.pathname === '/api/stats') {
    const now = Date.now()
    if (!statsCache || now - statsCacheTime > STATS_CACHE_TTL) {
      statsCache = getMockStats()
      statsCacheTime = now
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(statsCache))
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/agents') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(getMockAgents()))
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/workflows') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(getMockWorkflows()))
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/logs') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(getMockLogs()))
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/security') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(getMockSecurity()))
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    let body = ''
    req.on('data', (c) => { body += c })
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body)
        if (!message || typeof message !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'message is required' }))
          return
        }
        if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: `message exceeds max length of ${MAX_CHAT_MESSAGE_LENGTH}` }))
          return
        }

        const sanitizedMessage = sanitizeChatInput(message)
        const result = await chatSpawn(sanitizedMessage)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`NanoClaw Dashboard → http://127.0.0.1:${PORT}`)
  console.log(`  NanoClaw root: ${NANOCLAW_ROOT}`)
  console.log(`  Mode: ${hasNanoClaw ? 'REAL' : 'MOCK'}`)
  console.log(`  Serving static files from: ${resolve(__dirname, 'dist')}`)
})
