import { getDbPool, validateUserId } from '~/server/utils/db'
import type { Project, CreateProjectDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
  const body = await readBody<CreateProjectDto>(event)
  
  if (!body.name || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Project name is required'
    })
  }
  
  try {
    const pool = getDbPool()
    
    // Check if project with same name already exists
    const existing = await pool.query(
      'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
      [userId, body.name.trim()]
    )
    
    if (existing.rows.length > 0) {
      throw createError({
        statusCode: 409,
        message: 'Project with this name already exists'
      })
    }
    
    // Create project
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, color, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, body.name.trim(), body.color || '#2481cc']
    )
    
    const row = result.rows[0]
    const project: Project = {
      id: row.id,
      name: row.name,
      color: row.color,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
    
    return {
      data: project
    }
  } catch (error: any) {
    console.error('Error creating project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create project'
    })
  }
})

