import { spawn } from 'child_process'

const env = { ...process.env }

// Start API server (provides /api/* endpoints and mock data)
const api = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env,
})

// Start Vite dev server (bypass pnpm wrapper to avoid deps-status check)
const vite = spawn('node', ['./node_modules/vite/bin/vite.js'], {
  stdio: 'inherit',
  env,
})

function shutdown() {
  api.kill()
  vite.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

api.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`API server exited with code ${code}`)
    vite.kill()
    process.exit(code)
  }
})

vite.on('exit', (code) => {
  api.kill()
  process.exit(code ?? 0)
})
