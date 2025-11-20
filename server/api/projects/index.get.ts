import { getDbPool, validateUserId } from '~/server/utils/db'
import type { Project } from '~/types/todo'

export default defineEventHandler(async (event) => {
  // Get userId header - check both lowercase and original case
  const userIdHeader = getHeader(event, 'x-telegram-user-id') || getHeader(event, 'X-Telegram-User-Id')
  const userId = validateUserId(userIdHeader)
  
  try {
    const pool = getDbPool()
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY name ASC',
      [userId]
    )
    
    const projects: Project[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
    
    return {
      data: projects
    }
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch projects'
    })
  }
})

