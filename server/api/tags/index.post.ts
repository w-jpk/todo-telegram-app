import { getDbPool, validateUserId } from '~/server/utils/db'
import type { CreateTagDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  const body = await readBody<CreateTagDto>(event)

  if (!body.name || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Tag name is required'
    })
  }

  try {
    const pool = getDbPool()

    const result = await pool.query(
      `INSERT INTO tags (user_id, name, color, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        userId,
        body.name.trim(),
        body.color || '#6366f1'
      ]
    )

    const row = result.rows[0]
    const tag = {
      id: row.id,
      name: row.name,
      color: row.color,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return {
      data: tag
    }
  } catch (error: any) {
    console.error('Error creating tag:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create tag'
    })
  }
})