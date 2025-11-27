import { getDbPool, validateUserId } from '~/server/utils/db'
import type { Todo, SortOption } from '~/types/todo'

export default defineEventHandler(async (event) => {
  // Get userId header - check both lowercase and original case
  const userIdHeader = getHeader(event, 'x-telegram-user-id') || getHeader(event, 'X-Telegram-User-Id')
  
  // Log for debugging in production
  if (process.env.NODE_ENV === 'production') {
    console.log('[Todos API] Request headers:', {
      'x-telegram-user-id': userIdHeader,
      'user-agent': getHeader(event, 'user-agent'),
      'referer': getHeader(event, 'referer')
    })
  }
  
  const userId = validateUserId(userIdHeader)
  const query = getQuery(event)

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 50))
  const offset = (page - 1) * limit

  try {
    const pool = getDbPool()

    // Get user settings
    const settingsResult = await pool.query(
      'SELECT default_sort_by, show_completed_tasks FROM user_settings WHERE user_id = $1',
      [userId]
    )
    const settings = settingsResult.rows[0] || {}
    const defaultSortBy: SortOption = settings.default_sort_by || 'dueDate'
    const showCompletedTasks = settings.show_completed_tasks ?? true

    // Get total count for pagination (respecting show_completed_tasks setting)
    const countQuery = showCompletedTasks
      ? 'SELECT COUNT(*) as total FROM todos WHERE user_id = $1 AND parent_id IS NULL'
      : 'SELECT COUNT(*) as total FROM todos WHERE user_id = $1 AND parent_id IS NULL AND completed = false'
    const countResult = await pool.query(countQuery, [userId])
    const total = parseInt(countResult.rows[0].total)

    // Build WHERE clause based on show_completed_tasks setting
    const whereClause = showCompletedTasks
      ? 'WHERE t.user_id = $1 AND t.parent_id IS NULL'
      : 'WHERE t.user_id = $1 AND t.parent_id IS NULL AND t.completed = false'

    // Build ORDER BY clause based on default_sort_by setting
    let orderByClause = ''
    switch (defaultSortBy) {
      case 'priority':
        orderByClause = `ORDER BY
          CASE t.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
          END,
          t.due_date NULLS LAST,
          t.created_at DESC`
        break
      case 'dueDate':
        orderByClause = 'ORDER BY t.due_date NULLS LAST, t.created_at DESC'
        break
      case 'createdAt':
        orderByClause = 'ORDER BY t.created_at DESC'
        break
      case 'text':
        orderByClause = 'ORDER BY t.text ASC'
        break
      default:
        orderByClause = `ORDER BY
          CASE t.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
          END,
          t.due_date NULLS LAST,
          t.created_at DESC`
    }

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
       ${whereClause}
       GROUP BY t.id, p.id, p.name, p.color, p.created_at, p.updated_at
       ${orderByClause}
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
    console.error('[Todos API] Error fetching todos:', {
      error: error.message,
      userId,
      stack: error.stack
    })
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch todos'
    })
  }
})

