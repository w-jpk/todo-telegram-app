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
        array_agg(DISTINCT tag.name) FILTER (WHERE tag.name IS NOT NULL) as tag_names
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
      'SELECT id, name, color, created_at FROM projects WHERE user_id = $1 ORDER BY created_at',
      [userId]
    )

    // Convert to Todoist-like format
    const todoistData = {
      type: 'todoist_backup',
      version: '1.0',
      projects: projectsResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        created_at: new Date(row.created_at).toISOString()
      })),
      items: todosResult.rows.map((row: any) => {
        const item: any = {
          id: row.id,
          content: row.text,
          description: row.description || '',
          completed: row.completed,
          priority: getTodoistPriority(row.priority),
          project_id: row.project_id || null,
          parent_id: row.parent_id || null,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString()
        }

        // Add due date if exists
        if (row.due_date) {
          item.due = {
            date: new Date(row.due_date).toISOString().split('T')[0],
            is_recurring: row.is_recurring || false
          }

          // Add recurrence info if recurring
          if (row.is_recurring && row.recurrence_type) {
            item.due.recurring = {
              type: row.recurrence_type,
              interval: row.recurrence_interval || 1,
              ...(row.recurrence_end_date && {
                end_date: new Date(row.recurrence_end_date).toISOString().split('T')[0]
              }),
              ...(row.recurrence_days_of_week && {
                days_of_week: row.recurrence_days_of_week
              }),
              ...(row.recurrence_day_of_month && {
                day_of_month: row.recurrence_day_of_month
              })
            }
          }
        }

        // Add labels (tags)
        if (row.tag_names && row.tag_names[0] !== null) {
          item.labels = row.tag_names
        }

        return item
      })
    }

    // Set response headers for file download
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="todoist-export-${new Date().toISOString().split('T')[0]}.json"`)

    // Update last backup date
    await pool.query(
      'UPDATE user_settings SET last_backup_date = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    )

    return todoistData
  } catch (error) {
    console.error('Todoist export error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to export Todoist data'
    })
  }
})

// Convert our priority to Todoist priority (1-4, where 1 is highest)
function getTodoistPriority(priority: string): number {
  switch (priority) {
    case 'high': return 1
    case 'medium': return 2
    case 'low': return 3
    default: return 4
  }
}