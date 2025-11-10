import { getDbPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const botToken = config.telegramBotToken
  
  if (!botToken) {
    throw createError({
      statusCode: 500,
      message: 'Telegram bot token is not configured'
    })
  }
  
  const body = await readBody<{
    userId: number
    message: string
  }>(event)
  
  if (!body.userId || !body.message) {
    throw createError({
      statusCode: 400,
      message: 'User ID and message are required'
    })
  }
  
  try {
    // Send message via Telegram Bot API
    const response = await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: body.userId,
        text: body.message,
        parse_mode: 'HTML'
      }
    })
    
    return {
      success: true,
      data: response
    }
  } catch (error: any) {
    console.error('Error sending notification:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send notification'
    })
  }
})

