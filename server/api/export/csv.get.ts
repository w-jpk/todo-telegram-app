import { Client } from 'pg'
import { validateUserId } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))

  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  try {
    // Get all todos for the user
    const todosResult = await client.query(
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

    // Create CSV header
    const headers = [
      'ID',
      'Text',
      'Description',
      'Completed',
      'Priority',
      'Project',
      'Tags',
      'Due Date',
      'Created At',
      'Updated At',
      'Is Recurring',
      'Recurrence Type',
      'Recurrence Interval',
      'Recurrence End Date',
      'Recurrence Days of Week',
      'Recurrence Day of Month'
    ]

    // Create CSV rows
    const rows = todosResult.rows.map((row: any) => [
      row.id,
      `"${row.text.replace(/"/g, '""')}"`, // Escape quotes
      row.description ? `"${row.description.replace(/"/g, '""')}"` : '',
      row.completed ? 'true' : 'false',
      row.priority || 'none',
      row.project_name || '',
      row.tag_names && row.tag_names[0] !== null ? `"${row.tag_names.join(', ')}"` : '',
      row.due_date ? new Date(row.due_date).toISOString().split('T')[0] : '',
      new Date(row.created_at).toISOString(),
      new Date(row.updated_at).toISOString(),
      row.is_recurring ? 'true' : 'false',
      row.recurrence_type || '',
      row.recurrence_interval || '',
      row.recurrence_end_date ? new Date(row.recurrence_end_date).toISOString().split('T')[0] : '',
      row.recurrence_days_of_week ? `"${row.recurrence_days_of_week.join(',')}"` : '',
      row.recurrence_day_of_month || ''
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => field.toString()).join(','))
      .join('\n')

    // Set response headers for file download
    setHeader(event, 'Content-Type', 'text/csv')
    setHeader(event, 'Content-Disposition', `attachment; filename="todo-export-${new Date().toISOString().split('T')[0]}.csv"`)

    return csvContent
  } catch (error) {
    console.error('CSV export error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to export CSV data'
    })
  } finally {
    await client.end()
  }
})