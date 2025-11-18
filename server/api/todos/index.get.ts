import { getDbPool, validateUserId } from '~/server/utils/db'
import type { Todo } from '~/types/todo'

export default defineCachedEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  const query = getQuery(event)

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  try {
    const pool = getDbPool()

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM todos WHERE user_id = $1',
      [userId]
    )
    const total = parseInt(countResult.rows[0].total)

    // Get paginated todos with selective fields
    const result = await pool.query(
      `SELECT
        t.id, t.text, t.description, t.completed, t.priority, t.user_id,
        t.project_id, t.parent_id, t.created_at, t.updated_at, t.due_date,
        t.recurrence_type, t.recurrence_interval, t.recurrence_end_date,
        t.recurrence_days_of_week, t.recurrence_day_of_month, t.is_recurring,
        p.id as project_id_full, p.name as project_name, p.color as project_color,
        p.created_at as project_created_at, p.updated_at as project_updated_at,
        array_agg(DISTINCT jsonb_build_object(
          'id', tg.tag_id,
          'name', tag.name,
          'color', tag.color,
          'userId', tag.user_id,
          'createdAt', tag.created_at,
          'updatedAt', tag.updated_at
        )) FILTER (WHERE tg.tag_id IS NOT NULL) as tags
       FROM todos t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN todo_tags tg ON t.id = tg.todo_id
       LEFT JOIN tags tag ON tg.tag_id = tag.id
       WHERE t.user_id = $1 AND t.parent_id IS NULL
       GROUP BY t.id, p.id, p.name, p.color, p.created_at, p.updated_at
       ORDER BY
         CASE t.priority
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
           ELSE 4
         END,
         t.due_date NULLS LAST,
         t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    
    // Get all subtasks for the main todos
    const todoIds = result.rows.map(row => row.id)
    const subtasksResult = await pool.query(
      `SELECT
        t.id, t.text, t.description, t.completed, t.priority, t.user_id,
        t.project_id, t.parent_id, t.created_at, t.updated_at, t.due_date,
        p.id as project_id_full, p.name as project_name, p.color as project_color,
        p.created_at as project_created_at, p.updated_at as project_updated_at
       FROM todos t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.user_id = $1 AND t.parent_id = ANY($2)`,
      [userId, todoIds]
    )

    const subtasksMap = new Map<string, Todo[]>()
    subtasksResult.rows.forEach(row => {
      const subtask: Todo = {
        id: row.id,
        text: row.text,
        description: row.description || undefined,
        completed: row.completed,
        priority: row.priority || 'none',
        userId: parseInt(row.user_id),
        projectId: row.project_id || undefined,
        parentId: row.parent_id,
        project: row.project_id_full ? {
          id: row.project_id_full,
          name: row.project_name,
          color: row.project_color,
          userId: parseInt(row.user_id),
          createdAt: row.project_created_at || new Date(),
          updatedAt: row.project_updated_at || new Date()
        } : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dueDate: row.due_date || undefined
      }

      if (!subtasksMap.has(row.parent_id)) {
        subtasksMap.set(row.parent_id, [])
      }
      subtasksMap.get(row.parent_id)!.push(subtask)
    })

    const todos: Todo[] = result.rows.map(row => {
      const recurrenceRule = row.is_recurring ? {
        type: row.recurrence_type,
        interval: row.recurrence_interval,
        endDate: row.recurrence_end_date || undefined,
        daysOfWeek: row.recurrence_days_of_week || undefined,
        dayOfMonth: row.recurrence_day_of_month || undefined
      } : undefined

      return {
        id: row.id,
        text: row.text,
        description: row.description || undefined,
        completed: row.completed,
        priority: row.priority || 'none',
        userId: parseInt(row.user_id),
        projectId: row.project_id || undefined,
        parentId: row.parent_id || undefined,
        subtasks: subtasksMap.get(row.id) || [],
        tags: row.tags && row.tags[0] !== null ? row.tags : [],
        recurrenceRule,
        isRecurring: row.is_recurring,
        project: row.project_id_full ? {
          id: row.project_id_full,
          name: row.project_name,
          color: row.project_color,
          userId: parseInt(row.user_id),
          createdAt: row.project_created_at || new Date(),
          updatedAt: row.project_updated_at || new Date()
        } : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        dueDate: row.due_date || undefined
      }
    })
    
    return {
      data: todos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  } catch (error: any) {
    console.error('Error fetching todos:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch todos'
    })
  }
}, {
  maxAge: 30, // Cache for 30 seconds
  getKey: (event) => {
    const userId = getHeader(event, 'x-telegram-user-id')
    const query = getQuery(event)
    const page = query.page || '1'
    const limit = query.limit || '50'
    return `todos:${userId}:page${page}:limit${limit}` // Unique cache key per user and pagination
  }
})

