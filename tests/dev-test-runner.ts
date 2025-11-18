/**
 * Dev Test Runner - запускает тесты в dev режиме
 * Используется для быстрого тестирования во время разработки
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface DevTestOptions {
  watch?: boolean
  ui?: boolean
  coverage?: boolean
  pattern?: string
}

/**
 * Запускает unit тесты в dev режиме
 */
export async function runDevTests(options: DevTestOptions = {}) {
  const { watch = true, ui = false, coverage = false, pattern } = options

  let command = 'vitest'
  
  if (watch) {
    command += ' --watch'
  }
  
  if (ui) {
    command += ' --ui'
  }
  
  if (coverage) {
    command += ' --coverage'
  }
  
  if (pattern) {
    command += ` --testNamePattern="${pattern}"`
  }

  console.log(`🚀 Running dev tests: ${command}`)
  
  try {
    const { stdout, stderr } = await execAsync(command)
    console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error: any) {
    console.error('Test execution error:', error.message)
    throw error
  }
}

/**
 * Запускает E2E тесты в dev режиме
 */
export async function runDevE2ETests(options: { ui?: boolean } = {}) {
  const { ui = false } = options
  
  let command = 'playwright test'
  
  if (ui) {
    command += ' --ui'
  }

  console.log(`🚀 Running E2E tests: ${command}`)
  
  try {
    const { stdout, stderr } = await execAsync(command)
    console.log(stdout)
    if (stderr) console.error(stderr)
  } catch (error: any) {
    console.error('E2E test execution error:', error.message)
    throw error
  }
}

