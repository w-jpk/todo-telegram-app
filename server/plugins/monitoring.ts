interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  userId?: string
  path?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: any
}

class MonitoringService {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  log(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }

    this.logs.push(logEntry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    const prefix = `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}:`
    const details = [
      logEntry.userId && `User: ${logEntry.userId}`,
      logEntry.method && logEntry.path && `${logEntry.method} ${logEntry.path}`,
      logEntry.statusCode && `Status: ${logEntry.statusCode}`,
      logEntry.duration && `Duration: ${logEntry.duration}ms`
    ].filter(Boolean).join(' | ')

    console.log(`${prefix} ${logEntry.message}${details ? ` (${details})` : ''}`)

    if (logEntry.error) {
      console.error(logEntry.error)
    }
  }

  getLogs(level?: LogEntry['level'], limit = 100) {
    let filteredLogs = this.logs
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level)
    }
    return filteredLogs.slice(-limit)
  }

  getStats() {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    const last24Hours = now - (24 * 60 * 60 * 1000)

    const recentLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > lastHour)
    const dailyLogs = this.logs.filter(log => new Date(log.timestamp).getTime() > last24Hours)

    return {
      totalRequests: this.logs.filter(log => log.method).length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      recentErrors: recentLogs.filter(log => log.level === 'error').length,
      dailyErrors: dailyLogs.filter(log => log.level === 'error').length,
      avgResponseTime: this.calculateAvgResponseTime(recentLogs)
    }
  }

  private calculateAvgResponseTime(logs: LogEntry[]) {
    const responseLogs = logs.filter(log => log.duration !== undefined)
    if (responseLogs.length === 0) return 0
    const total = responseLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
    return Math.round(total / responseLogs.length)
  }
}

const monitoring = new MonitoringService()

export default defineNitroPlugin(() => {
  console.log('✅ Monitoring system initialized')
  console.log('   - Basic error logging enabled')
})