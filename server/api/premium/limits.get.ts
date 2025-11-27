import { validateUserId } from '~/server/utils/db'
import { getUserLimits } from '~/server/utils/premium'
import type { PremiumLimits } from '~/types/todo'

export default defineEventHandler(async (event) => {
  const userId = validateUserId(getHeader(event, 'x-telegram-user-id'))
  
  try {
    const limits: PremiumLimits = await getUserLimits(userId)
    
    return {
      data: limits
    }
  } catch (error: any) {
    console.error('Error fetching premium limits:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch premium limits'
    })
  }
})

