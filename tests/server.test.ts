import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn } from 'child_process'
import { resolve } from 'path'

describe('api gateway', () => {
  let serverProcess: ReturnType<typeof spawn>
  let baseUrl = 'http://127.0.0.1:17777'

  beforeAll(async () => {
    // Start server.js as a child process on a test port
    serverProcess = spawn('node', ['server.js'], {
      cwd: resolve(__dirname, '..'),
      env: { ...process.env, PORT: '17777' },
      stdio: 'pipe',
    })

    // Wait for server to start listening
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server failed to start within 5s'))
      }, 5000)

      serverProcess.stdout?.on('data', (data) => {
        const text = data.toString()
        if (text.includes('NanoClaw Dashboard')) {
          clearTimeout(timeout)
          resolve()
        }
      })

      serverProcess.stderr?.on('data', (data) => {
        const text = data.toString()
        // If NanoClaw root not found, server exits - that's expected before implementation
        if (text.includes('NanoClaw root not found')) {
          clearTimeout(timeout)
          reject(new Error('Server exited: NanoClaw root not found'))
        }
      })

      serverProcess.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })

      serverProcess.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout)
          reject(new Error(`Server exited with code ${code}`))
        }
      })
    })
  })

  afterAll(async () => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM')
      // Give it a moment to clean up
      await new Promise((r) => setTimeout(r, 500))
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL')
      }
    }
  })

  it('GET /api/stats returns dashboard stats', async () => {
    const res = await fetch(`${baseUrl}/api/stats`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('agentCount')
    expect(data).toHaveProperty('skillCount')
    expect(data).toHaveProperty('monthlyBudget')
  })

  it('GET /api/agents returns agent list', async () => {
    const res = await fetch(`${baseUrl}/api/agents`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('status')
  })

  it('GET /api/workflows returns workflow list', async () => {
    const res = await fetch(`${baseUrl}/api/workflows`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('status')
  })

  it('GET /api/logs returns log entries', async () => {
    const res = await fetch(`${baseUrl}/api/logs`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('time')
    expect(data[0]).toHaveProperty('type')
    expect(data[0]).toHaveProperty('message')
  })

  it('GET /api/security returns security status', async () => {
    const res = await fetch(`${baseUrl}/api/security`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('costControl')
    expect(data).toHaveProperty('skillAudit')
    expect(data).toHaveProperty('manualApproval')
    expect(data).toHaveProperty('overall')
    expect(data).toHaveProperty('lastCheckedAt')
  })

  it('POST /api/chat with valid message returns reply', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello' }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('reply')
  }, 15000)

  it('POST /api/chat without message returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data).toHaveProperty('error')
  })

  it('serves static index.html for root path', async () => {
    const res = await fetch(`${baseUrl}/`)
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('<html')
  })

  it('CORS headers are present', async () => {
    const res = await fetch(`${baseUrl}/api/stats`)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})
