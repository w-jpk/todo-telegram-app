import { getDbPool } from '~/server/utils/db'
import type { Project, UpdateProjectDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = getHeader(event, 'x-telegram-user-id')
  const id = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User ID is required'
    })
  }
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Project ID is required'
    })
  }
  
  const body = await readBody<UpdateProjectDto>(event)
  
  try {
    const pool = getDbPool()
    
    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(body.name.trim())
    }
    
    if (body.color !== undefined) {
      updates.push(`color = $${paramIndex++}`)
      values.push(body.color)
    }
    
    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId, id)
    
    const result = await pool.query(
      `UPDATE projects 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex++}
       RETURNING *`,
      values
    )
    
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Project not found'
      })
    }
    
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
    console.error('Error updating project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update project'
    })
  }
})

