export type AgentStatus = 'running' | 'paused'

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: AgentStatus
  avatar: string
}

export type SkillSource = 'builtin' | 'third-party'

export interface Skill {
  id: string
  name: string
  source: SkillSource
  installed: boolean
}

export type WorkflowStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface Workflow {
  id: string
  name: string
  status: WorkflowStatus
  startedAt: string
  completedAt?: string
  result?: string
}

export type LogType = 'exec' | 'create' | 'config' | 'error'

export interface LogEntry {
  id: string
  time: string
  type: LogType
  message: string
}

export interface DashboardStats {
  agentCount: number
  runningAgents: number
  pausedAgents: number
  skillCount: number
  customSkills: number
  thirdPartySkills: number
  todayExecutions: number
  yesterdayExecutions: number
  todayCost: number
  monthlyCost: number
  monthlyBudget: number
}

export type SecurityOverallStatus = 'healthy' | 'warning' | 'critical'

export interface SecurityStatus {
  costControl: {
    singleLimit: number
    monthlyUsed: number
    monthlyLimit: number
    status: SecurityOverallStatus
  }
  skillAudit: {
    total: number
    pending: number
    status: SecurityOverallStatus
  }
  manualApproval: {
    pendingRequests: number
    status: SecurityOverallStatus
  }
  overall: SecurityOverallStatus
  lastCheckedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: 'sent' | 'loading' | 'error'
  timestamp: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
