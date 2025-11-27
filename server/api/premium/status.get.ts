import { validateUserId } from '~/server/utils/db'
import { checkPremiumStatus } from '~/server/utils/premium'
import type { PremiumStatus } from '~/types/todo'
import {
  getUserLimits,
  getActiveTodosCount,
  getProjectsCount,
  getTagsCount,
  getRecurringTasksCount,
} from '~/server/utils/premium'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
  try {
    const isPremium = await checkPremiumStatus(userId)
    const limits = await getUserLimits(userId)
    
    const [todosCount, projectsCount, tagsCount, recurringTasksCount] = await Promise.all([
      getActiveTodosCount(userId),
      getProjectsCount(userId),
      getTagsCount(userId),
      getRecurringTasksCount(userId),
    ])
    
    const status: PremiumStatus = {
      isPremium,
      limits,
      currentUsage: {
        todos: todosCount,
        projects: projectsCount,
        tags: tagsCount,
        recurringTasks: recurringTasksCount,
      },
    }
    
    return {
      data: status
    }
  } catch (error: any) {
    console.error('Error fetching premium status:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch premium status'
    })
  }
})

