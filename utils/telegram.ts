/**
 * Utility functions for Telegram WebApp API
 */

/**
 * Check if Telegram WebApp API version is at least the specified version
 * @param tg - Telegram WebApp instance
 * @param version - Required version (e.g., '6.1', '6.2')
 * @returns true if current version is >= required version
 */
export const versionAtLeast = (tg: any, version: string): boolean => {
  if (!tg || !tg.version) return false
  
  const current = tg.version.split('.').map(Number)
  const required = version.split('.').map(Number)
  
  for (let i = 0; i < Math.max(current.length, required.length); i++) {
    const curr = current[i] || 0
    const req = required[i] || 0
    if (curr > req) return true
    if (curr < req) return false
  }
  
  return true
}

/**
 * Safely call a Telegram WebApp method if it's available and version is supported
 * @param tg - Telegram WebApp instance
 * @param methodName - Name of the method to call
 * @param minVersion - Minimum required version (optional)
 * @param args - Arguments to pass to the method
 */
export const safeCallTelegramMethod = (
  tg: any,
  methodName: string,
  minVersion?: string,
  ...args: any[]
): void => {
  if (!tg || typeof tg[methodName] !== 'function') {
    return
  }
  
  if (minVersion && !versionAtLeast(tg, minVersion)) {
    return
  }
  
  try {
    tg[methodName](...args)
  } catch (error) {
    // Silently ignore errors for unsupported methods
    console.warn(`Telegram WebApp method ${methodName} failed:`, error)
  }
}

