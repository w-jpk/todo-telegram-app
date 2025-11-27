import { getDbPool } from './db'

/**
 * Premium limits configuration
 */
export const PREMIUM_LIMITS = {
  FREE: {
    maxTodos: 50,
    maxProjects: 5, // including "Inbox"
    maxTags: 10,
    maxSubtaskLevels: 3,
    maxRecurringTasks: 5,
  },
  PREMIUM: {
    maxTodos: Infinity,
    maxProjects: Infinity,
    maxTags: Infinity,
    maxSubtaskLevels: Infinity,
    maxRecurringTasks: Infinity,
  },
} as const

/**
 * Check if user has premium status
 * @param userId - User ID
 * @returns Promise<boolean> - true if user has premium
 */
export async function checkPremiumStatus(userId: number): Promise<boolean> {
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT is_premium FROM users WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return false
    }
    
    return result.rows[0].is_premium === true
  } catch (error) {
    console.error('Error checking premium status:', error)
    return false
  }
}

/**
 * Get user limits based on premium status
 * @param userId - User ID
 * @returns Promise with limits object
 */
export async function getUserLimits(userId: number) {
  const isPremium = await checkPremiumStatus(userId)
  return isPremium ? PREMIUM_LIMITS.PREMIUM : PREMIUM_LIMITS.FREE
}

/**
 * Get count of active todos for user
 * @param userId - User ID
 * @returns Promise<number> - count of active todos
 */
export async function getActiveTodosCount(userId: number): Promise<number> {
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM todos WHERE user_id = $1 AND completed = FALSE',
      [userId]
    )
    return parseInt(result.rows[0].count, 10)
  } catch (error) {
    console.error('Error getting active todos count:', error)
    return 0
  }
}

/**
 * Get count of projects for user
 * @param userId - User ID
 * @returns Promise<number> - count of projects
 */
export async function getProjectsCount(userId: number): Promise<number> {
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM projects WHERE user_id = $1',
      [userId]
    )
    return parseInt(result.rows[0].count, 10)
  } catch (error) {
    console.error('Error getting projects count:', error)
    return 0
  }
}

/**
 * Get count of tags for user
 * @param userId - User ID
 * @returns Promise<number> - count of tags
 */
export async function getTagsCount(userId: number): Promise<number> {
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM tags WHERE user_id = $1',
      [userId]
    )
    return parseInt(result.rows[0].count, 10)
  } catch (error) {
    console.error('Error getting tags count:', error)
    return 0
  }
}

/**
 * Get count of recurring tasks for user
 * @param userId - User ID
 * @returns Promise<number> - count of recurring tasks
 */
export async function getRecurringTasksCount(userId: number): Promise<number> {
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM todos WHERE user_id = $1 AND is_recurring = TRUE',
      [userId]
    )
    return parseInt(result.rows[0].count, 10)
  } catch (error) {
    console.error('Error getting recurring tasks count:', error)
    return 0
  }
}

/**
 * Get maximum depth of subtasks for a todo
 * @param todoId - Todo ID
 * @returns Promise<number> - maximum depth (0 = no subtasks, 1 = one level, etc.)
 */
export async function getSubtaskDepth(todoId: string): Promise<number> {
  try {
    const pool = getDbPool()
    
    // Recursive query to find maximum depth
    const result = await pool.query(
      `WITH RECURSIVE subtask_tree AS (
        SELECT id, parent_id, 0 as depth
        FROM todos
        WHERE id = $1
        
        UNION ALL
        
        SELECT t.id, t.parent_id, st.depth + 1
        FROM todos t
        INNER JOIN subtask_tree st ON t.parent_id = st.id
      )
      SELECT MAX(depth) as max_depth FROM subtask_tree`,
      [todoId]
    )
    
    return parseInt(result.rows[0].max_depth || '0', 10)
  } catch (error) {
    console.error('Error getting subtask depth:', error)
    return 0
  }
}

/**
 * Check if user can create a new todo
 * @param userId - User ID
 * @returns Promise<{ allowed: boolean, reason?: string }>
 */
export async function canCreateTodo(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  const currentCount = await getActiveTodosCount(userId)
  
  if (currentCount >= limits.maxTodos) {
    return {
      allowed: false,
      reason: `Достигнут лимит задач (${limits.maxTodos}). Получите Premium для неограниченного использования.`
    }
  }
  
  return { allowed: true }
}

/**
 * Check if user can create a new project
 * @param userId - User ID
 * @returns Promise<{ allowed: boolean, reason?: string }>
 */
export async function canCreateProject(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  const currentCount = await getProjectsCount(userId)
  
  if (currentCount >= limits.maxProjects) {
    return {
      allowed: false,
      reason: `Достигнут лимит проектов (${limits.maxProjects}). Получите Premium для неограниченного использования.`
    }
  }
  
  return { allowed: true }
}

/**
 * Check if user can create a new tag
 * @param userId - User ID
 * @returns Promise<{ allowed: boolean, reason?: string }>
 */
export async function canCreateTag(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  const currentCount = await getTagsCount(userId)
  
  if (currentCount >= limits.maxTags) {
    return {
      allowed: false,
      reason: `Достигнут лимит тегов (${limits.maxTags}). Получите Premium для неограниченного использования.`
    }
  }
  
  return { allowed: true }
}

/**
 * Check if user can create a recurring task
 * @param userId - User ID
 * @returns Promise<{ allowed: boolean, reason?: string }>
 */
export async function canCreateRecurringTask(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  const currentCount = await getRecurringTasksCount(userId)
  
  if (currentCount >= limits.maxRecurringTasks) {
    return {
      allowed: false,
      reason: `Достигнут лимит повторяющихся задач (${limits.maxRecurringTasks}). Получите Premium для неограниченного использования.`
    }
  }
  
  return { allowed: true }
}

/**
 * Check if user can create a subtask at the specified depth
 * @param userId - User ID
 * @param parentTodoId - Parent todo ID
 * @returns Promise<{ allowed: boolean, reason?: string }>
 */
export async function canCreateSubtask(userId: number, parentTodoId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUserLimits(userId)
  const currentDepth = await getSubtaskDepth(parentTodoId)
  
  if (currentDepth >= limits.maxSubtaskLevels) {
    return {
      allowed: false,
      reason: `Достигнут лимит уровней вложенности подзадач (${limits.maxSubtaskLevels}). Получите Premium для неограниченного использования.`
    }
  }
  
  return { allowed: true }
}

