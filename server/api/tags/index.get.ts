import { getDbPool, validateUserId } from '~/server/utils/db'

export default defineCachedEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))

  try {
    const pool = getDbPool()

    const result = await pool.query(
      'SELECT * FROM tags WHERE user_id = $1 ORDER BY name',
      [userId]
    )

    const tags = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      userId: parseInt(row.user_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return {
      data: tags
    }
  } catch (error: any) {
    console.error('Error fetching tags:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch tags'
    })
  }
}, {
  maxAge: 60, // Cache for 1 minute (tags change infrequently)
  getKey: (event) => {
    const userId = getHeader(event, 'x-telegram-user-id')
    return `tags:${userId}`
  }
})