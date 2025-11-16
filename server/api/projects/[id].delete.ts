import { getDbPool, validateUserId, validateUUID } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  const id = validateUUID(getRouterParam(event, 'id'))
  
  try {
    const pool = getDbPool()
    
    // Check if project is default "Inbox" - prevent deletion
    const project = await pool.query(
      'SELECT name FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    
    if (project.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Project not found'
      })
    }
    
    if (project.rows[0].name === 'Inbox') {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete default Inbox project'
      })
    }
    
    // Move todos from this project to Inbox
    const inboxProject = await pool.query(
      'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
      [userId, 'Inbox']
    )
    
    if (inboxProject.rows.length > 0) {
      await pool.query(
        'UPDATE todos SET project_id = $1 WHERE project_id = $2',
        [inboxProject.rows[0].id, id]
      )
    }
    
    // Delete project
    const result = await pool.query(
      'DELETE FROM projects WHERE user_id = $1 AND id = $2 RETURNING id',
      [userId, id]
    )
    
    if (result.rows.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Project not found'
      })
    }
    
    return {
      success: true,
      message: 'Project deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete project'
    })
  }
})

