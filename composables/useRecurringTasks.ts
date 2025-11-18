import type { Todo, RecurrenceRule, RecurrenceType, CreateTodoDto } from '~/types/todo'

export const useRecurringTasks = (createTodoFn?: (data: CreateTodoDto) => Promise<Todo | null>) => {

  // Calculate next occurrence date based on recurrence rule
  const calculateNextDate = (baseDate: Date, rule: RecurrenceRule): Date => {
    const nextDate = new Date(baseDate)

    switch (rule.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + rule.interval)
        break
      case 'weekly':
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          // Find next day of week
          const currentDay = nextDate.getDay()
          const targetDays = rule.daysOfWeek.sort((a, b) => a - b)

          let nextDay = targetDays.find(day => day > currentDay)
          if (!nextDay) {
            // Wrap to next week
            nextDay = targetDays[0]
            nextDate.setDate(nextDate.getDate() + (7 - currentDay + nextDay))
          } else {
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDay))
          }
        } else {
          nextDate.setDate(nextDate.getDate() + (rule.interval * 7))
        }
        break
      case 'monthly':
        if (rule.dayOfMonth) {
          nextDate.setMonth(nextDate.getMonth() + rule.interval)
          nextDate.setDate(rule.dayOfMonth)
        } else {
          nextDate.setMonth(nextDate.getMonth() + rule.interval)
        }
        break
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + rule.interval)
        break
    }

    return nextDate
  }

  // Check if a recurring task should generate a new instance
  const shouldGenerateInstance = (todo: Todo): boolean => {
    if (!todo.recurrenceRule || !todo.dueDate) return false

    const now = new Date()
    const dueDate = new Date(todo.dueDate)

    // If due date is in the past and task is not completed, generate new instance
    return dueDate < now && !todo.completed
  }

  // Generate next instance of a recurring task
  const generateNextInstance = async (todo: Todo): Promise<Todo | null> => {
    if (!todo.recurrenceRule || !todo.dueDate) return null

    // Check if we've reached the end date
    if (todo.recurrenceRule.endDate) {
      const endDate = new Date(todo.recurrenceRule.endDate)
      const nextDueDate = calculateNextDate(new Date(todo.dueDate), todo.recurrenceRule)
      if (nextDueDate > endDate) return null
    }

    const nextDueDate = calculateNextDate(new Date(todo.dueDate), todo.recurrenceRule)

    const newTodoData = {
      text: todo.text,
      description: todo.description,
      priority: todo.priority,
      projectId: todo.projectId,
      dueDate: nextDueDate,
      tagIds: todo.tags?.map(tag => tag.id),
      recurrenceRule: todo.recurrenceRule // Keep the same recurrence rule
    }

    if (!createTodoFn) return null
    return await createTodoFn(newTodoData)
  }

  // Process all recurring tasks that need new instances
  const processRecurringTasks = async (todos: Todo[]): Promise<void> => {
    const recurringTasks = todos.filter(todo =>
      todo.isRecurring && shouldGenerateInstance(todo)
    )

    for (const task of recurringTasks) {
      try {
        await generateNextInstance(task)
      } catch (error) {
        console.error('Error generating recurring task instance:', error)
      }
    }
  }

  // Get human-readable description of recurrence rule
  const getRecurrenceDescription = (rule: RecurrenceRule): string => {
    const interval = rule.interval
    const type = rule.type

    let description = ''

    switch (type) {
      case 'daily':
        description = interval === 1 ? 'Ежедневно' : `Каждые ${interval} дней`
        break
      case 'weekly':
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          const dayNames = rule.daysOfWeek.map(day => {
            const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
            return days[day]
          })
          description = `Еженедельно: ${dayNames.join(', ')}`
        } else {
          description = interval === 1 ? 'Еженедельно' : `Каждые ${interval} недель`
        }
        break
      case 'monthly':
        if (rule.dayOfMonth) {
          description = `Ежемесячно ${rule.dayOfMonth} числа`
        } else {
          description = interval === 1 ? 'Ежемесячно' : `Каждые ${interval} месяцев`
        }
        break
      case 'yearly':
        description = interval === 1 ? 'Ежегодно' : `Каждые ${interval} лет`
        break
    }

    if (rule.endDate) {
      description += ` до ${rule.endDate.toLocaleDateString()}`
    }

    return description
  }

  return {
    calculateNextDate,
    shouldGenerateInstance,
    generateNextInstance,
    processRecurringTasks,
    getRecurrenceDescription
  }
}