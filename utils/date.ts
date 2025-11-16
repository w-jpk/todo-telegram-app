/**
 * Date utility functions for the Todo app
 */

/**
 * Format a date to YYYY-MM-DD string
 */
export const formatDateISO = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateISO(date1) === formatDateISO(date2)
}

/**
 * Get start of day for a date
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date): string => {
  const today = startOfDay(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateOnly = startOfDay(date)

  if (isSameDay(dateOnly, today)) return 'Today'
  if (isSameDay(dateOnly, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Check if date is overdue
 */
export const isOverdue = (date: Date): boolean => {
  const today = startOfDay(new Date())
  const dateOnly = startOfDay(date)
  return dateOnly < today
}

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date())
}

/**
 * Get relative time string
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Format month and year with locale
 */
export const formatMonthYear = (date: Date, locale: string = 'en'): string => {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

/**
 * Format full date with locale
 */
export const formatFullDate = (date: Date, locale: string = 'en'): string => {
  return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
}