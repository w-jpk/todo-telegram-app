import type { PremiumStatus, PremiumLimits } from '~/types/todo'

export const usePremium = () => {
  const premiumStatus = useState<PremiumStatus | null>('premium:status', () => null)
  const loading = useState<boolean>('premium:loading', () => false)
  const error = useState<string | null>('premium:error', () => null)

  const { $telegram } = useNuxtApp()
  const userId = computed(() => $telegram?.user?.id || null)

  // Get headers for API requests
  const getHeaders = () => {
    if (!userId.value) {
      throw new Error('User ID is not available. Please wait for Telegram initialization.')
    }

    const headers: Record<string, string> = {
      'x-telegram-user-id': userId.value.toString()
    }

    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  // Check premium status from Telegram (client-side check)
  const isPremiumFromTelegram = computed(() => {
    return $telegram?.user?.is_premium || false
  })

  // Fetch premium status from server
  const fetchPremiumStatus = async () => {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: PremiumStatus }>('/api/premium/status', {
        method: 'GET',
        headers: getHeaders()
      })
      premiumStatus.value = data
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Failed to fetch premium status'
      error.value = errorMessage
      console.error('Error fetching premium status:', err)
    } finally {
      loading.value = false
    }
  }

  // Get premium limits
  const fetchLimits = async (): Promise<PremiumLimits | null> => {
    if (!userId.value) return null

    try {
      const { data } = await $fetch<{ data: PremiumLimits }>('/api/premium/limits', {
        method: 'GET',
        headers: getHeaders()
      })
      return data
    } catch (err: any) {
      console.error('Error fetching premium limits:', err)
      return null
    }
  }

  // Computed properties
  const isPremium = computed(() => {
    // First check from server status, then fallback to Telegram
    if (premiumStatus.value) {
      return premiumStatus.value.isPremium
    }
    return isPremiumFromTelegram.value
  })

  const limits = computed(() => {
    return premiumStatus.value?.limits || {
      maxTodos: 50,
      maxProjects: 5,
      maxTags: 10,
      maxSubtaskLevels: 3,
      maxRecurringTasks: 5,
    }
  })

  const currentUsage = computed(() => {
    return premiumStatus.value?.currentUsage || {
      todos: 0,
      projects: 0,
      tags: 0,
      recurringTasks: 0,
    }
  })

  // Check if user can create a todo
  const canCreateTodo = computed(() => {
    if (isPremium.value) return true
    return currentUsage.value.todos < limits.value.maxTodos
  })

  // Check if user can create a project
  const canCreateProject = computed(() => {
    if (isPremium.value) return true
    return currentUsage.value.projects < limits.value.maxProjects
  })

  // Check if user can create a tag
  const canCreateTag = computed(() => {
    if (isPremium.value) return true
    return currentUsage.value.tags < limits.value.maxTags
  })

  // Check if user can create a recurring task
  const canCreateRecurringTask = computed(() => {
    if (isPremium.value) return true
    return currentUsage.value.recurringTasks < limits.value.maxRecurringTasks
  })

  // Get remaining count for todos
  const remainingTodos = computed(() => {
    if (isPremium.value) return Infinity
    return Math.max(0, limits.value.maxTodos - currentUsage.value.todos)
  })

  // Get remaining count for projects
  const remainingProjects = computed(() => {
    if (isPremium.value) return Infinity
    return Math.max(0, limits.value.maxProjects - currentUsage.value.projects)
  })

  // Get remaining count for tags
  const remainingTags = computed(() => {
    if (isPremium.value) return Infinity
    return Math.max(0, limits.value.maxTags - currentUsage.value.tags)
  })

  // Get remaining count for recurring tasks
  const remainingRecurringTasks = computed(() => {
    if (isPremium.value) return Infinity
    return Math.max(0, limits.value.maxRecurringTasks - currentUsage.value.recurringTasks)
  })

  // Check if limit is reached for todos
  const isTodosLimitReached = computed(() => {
    return !canCreateTodo.value
  })

  // Check if limit is reached for projects
  const isProjectsLimitReached = computed(() => {
    return !canCreateProject.value
  })

  // Check if limit is reached for tags
  const isTagsLimitReached = computed(() => {
    return !canCreateTag.value
  })

  // Check if limit is reached for recurring tasks
  const isRecurringTasksLimitReached = computed(() => {
    return !canCreateRecurringTask.value
  })

  return {
    // State
    premiumStatus: readonly(premiumStatus),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    isPremium,
    isPremiumFromTelegram,
    limits,
    currentUsage,
    canCreateTodo,
    canCreateProject,
    canCreateTag,
    canCreateRecurringTask,
    remainingTodos,
    remainingProjects,
    remainingTags,
    remainingRecurringTasks,
    isTodosLimitReached,
    isProjectsLimitReached,
    isTagsLimitReached,
    isRecurringTasksLimitReached,
    
    // Methods
    fetchPremiumStatus,
    fetchLimits,
  }
}

