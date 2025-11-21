import { Client } from 'pg'
import { validateUserId } from '~/server/utils/db'
import type { Todo, Project, Tag, CreateTodoDto, CreateProjectDto, CreateTagDto } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded'
    })
  }

  const file = formData[0]
  if (!file.data) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file'
    })
  }

  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  try {
    await client.query('BEGIN')

    let importData: any

    try {
      const fileContent = file.data.toString('utf-8')
      importData = JSON.parse(fileContent)
    } catch (error) {
      throw createError({
        statusCode: 400,
        message: 'Invalid JSON file'
      })
    }

    const results = {
      projects: { created: 0, skipped: 0 },
      tags: { created: 0, skipped: 0 },
      todos: { created: 0, skipped: 0 }
    }

    // Import projects first
    if (importData.projects && Array.isArray(importData.projects)) {
      for (const project of importData.projects) {
        try {
          await importProject(client, project, userId)
          results.projects.created++
        } catch (error) {
          console.warn('Failed to import project:', project, error)
          results.projects.skipped++
        }
      }
    }

    // Import tags
    if (importData.tags && Array.isArray(importData.tags)) {
      for (const tag of importData.tags) {
        try {
          await importTag(client, tag, userId)
          results.tags.created++
        } catch (error) {
          console.warn('Failed to import tag:', tag, error)
          results.tags.skipped++
        }
      }
    }

    // Import todos
    if (importData.todos && Array.isArray(importData.todos)) {
      for (const todo of importData.todos) {
        try {
          await importTodo(client, todo, userId)
          results.todos.created++
        } catch (error) {
          console.warn('Failed to import todo:', todo, error)
          results.todos.skipped++
        }
      }
    }

    await client.query('COMMIT')

    return {
      success: true,
      message: 'Import completed successfully',
      results
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Import error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to import data'
    })
  } finally {
    client.release()
  }
})

async function importProject(client: Client, project: any, userId: number): Promise<void> {
  // Check if project with same name already exists
  const existing = await client.query(
    'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
    [userId, project.name]
  )

  if (existing.rows.length > 0) {
    throw new Error('Project already exists')
  }

  await client.query(
    'INSERT INTO projects (id, name, color, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      project.id,
      project.name,
      project.color || '#6366f1',
      userId,
      project.createdAt ? new Date(project.createdAt) : new Date(),
      project.updatedAt ? new Date(project.updatedAt) : new Date()
    ]
  )
}

async function importTag(client: Client, tag: any, userId: number): Promise<void> {
  // Check if tag with same name already exists
  const existing = await client.query(
    'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
    [userId, tag.name]
  )

  if (existing.rows.length > 0) {
    throw new Error('Tag already exists')
  }

  await client.query(
    'INSERT INTO tags (id, name, color, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      tag.id,
      tag.name,
      tag.color || '#6366f1',
      userId,
      tag.createdAt ? new Date(tag.createdAt) : new Date(),
      tag.updatedAt ? new Date(tag.updatedAt) : new Date()
    ]
  )
}

async function importTodo(client: Client, todo: any, userId: number): Promise<void> {
  // Check if todo with same ID already exists
  const existing = await client.query(
    'SELECT id FROM todos WHERE user_id = $1 AND id = $2',
    [userId, todo.id]
  )

  if (existing.rows.length > 0) {
    throw new Error('Todo already exists')
  }

  // Insert the todo
  await client.query(
    `INSERT INTO todos (
      id, text, description, completed, priority, user_id, project_id, parent_id,
      created_at, updated_at, due_date, recurrence_type, recurrence_interval,
      recurrence_end_date, recurrence_days_of_week, recurrence_day_of_month, is_recurring
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      todo.id,
      todo.text,
      todo.description || null,
      todo.completed || false,
      todo.priority || 'none',
      userId,
      todo.projectId || null,
      todo.parentId || null,
      todo.createdAt ? new Date(todo.createdAt) : new Date(),
      todo.updatedAt ? new Date(todo.updatedAt) : new Date(),
      todo.dueDate ? new Date(todo.dueDate) : null,
      todo.recurrenceRule?.type || null,
      todo.recurrenceRule?.interval || null,
      todo.recurrenceRule?.endDate ? new Date(todo.recurrenceRule.endDate) : null,
      todo.recurrenceRule?.daysOfWeek ? todo.recurrenceRule.daysOfWeek : null,
      todo.recurrenceRule?.dayOfMonth || null,
      todo.isRecurring || false
    ]
  )

  // Import tags for this todo
  if (todo.tags && Array.isArray(todo.tags)) {
    for (const tag of todo.tags) {
      try {
        await client.query(
          'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [todo.id, tag.id]
        )
      } catch (error) {
        console.warn('Failed to link tag to todo:', tag, error)
      }
    }
  }
}