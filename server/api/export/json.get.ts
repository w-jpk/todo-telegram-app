import { getDbPool, validateUserId } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))

  const pool = getDbPool()

  try {
    // Get all todos for the user
    const todosResult = await pool.query(
      `SELECT
        t.id, t.text, t.description, t.completed, t.priority, t.user_id,
        t.project_id, t.parent_id, t.created_at, t.updated_at, t.due_date,
        t.recurrence_type, t.recurrence_interval, t.recurrence_end_date,
        t.recurrence_days_of_week, t.recurrence_day_of_month, t.is_recurring,
        p.name as project_name,
        array_agg(DISTINCT jsonb_build_object(
          'id', tg.tag_id,
          'name', tag.name,
          'color', tag.color
        )) FILTER (WHERE tg.tag_id IS NOT NULL) as tags
       FROM todos t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN todo_tags tg ON t.id = tg.todo_id
       LEFT JOIN tags tag ON tg.tag_id = tag.id
       WHERE t.user_id = $1
       GROUP BY t.id, p.name
       ORDER BY t.created_at`,
      [userId]
    )

    // Get all projects for the user
    const projectsResult = await pool.query(
      'SELECT id, name, color, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY created_at',
      [userId]
    )

    // Get all tags for the user
    const tagsResult = await pool.query(
      'SELECT id, name, color, created_at, updated_at FROM tags WHERE user_id = $1 ORDER BY created_at',
      [userId]
    )

    // Update last backup date
    await pool.query(
      'UPDATE user_settings SET last_backup_date = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    )

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userId: userId,
      todos: todosResult.rows.map(row => ({
        id: row.id,
        text: row.text,
        description: row.description || undefined,
        completed: row.completed,
        priority: row.priority || 'none',
        projectId: row.project_id || undefined,
        projectName: row.project_name || undefined,
        parentId: row.parent_id || undefined,
        tags: row.tags && row.tags[0] !== null ? row.tags : [],
        recurrenceRule: row.is_recurring ? {
          type: row.recurrence_type,
          interval: row.recurrence_interval,
          endDate: row.recurrence_end_date || undefined,
          daysOfWeek: row.recurrence_days_of_week || undefined,
          dayOfMonth: row.recurrence_day_of_month || undefined
        } : undefined,
        isRecurring: row.is_recurring,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dueDate: row.due_date || undefined
      })),
      projects: projectsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      tags: tagsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    }

    // Set response headers for file download
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="todo-export-${new Date().toISOString().split('T')[0]}.json"`)

    return exportData
  } catch (error) {
    console.error('Export error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to export data'
    })
  }
})