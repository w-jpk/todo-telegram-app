<template>
  <div
    ref="todoCard"
    class="group relative bg-telegram-section-bg border border-white/10 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all touch-manipulation overflow-hidden"
    @click="handleCardClick"
    @mouseenter="showDeleteButton = true"
    @mouseleave="showDeleteButton = false"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Delete Action Background (visible when swiping) - behind content -->
    <div
      class="absolute inset-y-0 right-0 bg-red-600 flex items-center justify-center z-10 rounded-r-xl"
      :style="{ 
        width: `${Math.max(Math.abs(swipeOffset), 0)}px`, 
        opacity: Math.abs(swipeOffset) > 10 ? 1 : 0,
        transition: isSwiping ? 'none' : 'width 0.3s ease-out, opacity 0.3s ease-out'
      }"
    >
      <Trash2 
        :size="32" 
        class="text-white drop-shadow-lg"
        :style="{ 
          opacity: Math.abs(swipeOffset) > 20 ? 1 : Math.abs(swipeOffset) / 20 
        }"
      />
    </div>

    <!-- Content Wrapper - slides left on swipe -->
    <div 
      class="relative z-20 flex items-start gap-4 p-4 pointer-events-auto bg-telegram-section-bg rounded-xl"
      :style="{ 
        transform: `translateX(${swipeOffset}px)`, 
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
      }"
    >
      <!-- Checkbox -->
      <button
        @click.stop="toggleComplete"
        :class="{
          'text-blue-500 bg-blue-500/20 border-blue-500': todo.completed,
          'text-gray-400 dark:text-gray-500 border-gray-400 dark:border-gray-500 bg-transparent': !todo.completed
        }"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 mt-0.5"
      >
        <svg v-if="todo.completed" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <p
          class="text-base font-medium break-words mb-1"
          :class="{
            'line-through text-gray-500 dark:text-gray-400': todo.completed,
            'text-telegram-text': !todo.completed
          }"
        >
          {{ todo.text }}
        </p>
        
        <!-- Description -->
        <p
          v-if="todo.description"
          class="text-sm mb-2"
          :class="{
            'text-gray-600 dark:text-gray-400': todo.completed,
            'text-telegram-subtitle-text': !todo.completed
          }"
        >
          {{ todo.description }}
        </p>
        
        <!-- Meta Info: Project and Date -->
        <div class="flex items-center gap-2 flex-wrap">
          <div
            v-if="todo.project"
            class="flex items-center gap-1.5"
          >
            <div
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: todo.project.color }"
            />
            <span 
              class="text-xs"
              :class="{
                'text-gray-600 dark:text-gray-400': todo.completed,
                'text-telegram-subtitle-text': !todo.completed
              }"
            >
              {{ todo.project.name }}
            </span>
          </div>
          
          <!-- Date next to project -->
          <template v-if="todo.dueDate">
            <span
              v-if="todo.project"
              class="text-xs text-telegram-hint"
            >
              •
            </span>
            <span
              class="text-xs"
              :class="{
                'text-gray-600 dark:text-gray-400': todo.completed,
                'text-telegram-subtitle-text': !todo.completed && !isOverdue,
                'text-red-500 dark:text-red-400': isOverdue && !todo.completed
              }"
            >
              {{ formatDateShort(todo.dueDate) }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- Priority Flag (top right corner) - moves with content -->
    <div
      v-if="todo.priority && todo.priority !== 'none'"
      class="absolute top-3 right-10 z-30 pointer-events-none"
      :style="{ 
        transform: `translateX(${swipeOffset}px)`, 
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
      }"
      :class="getPriorityClass(todo.priority)"
    >
      <Flag :size="14" />
    </div>

    <!-- Delete Button (top right, visible on hover/desktop) - moves with content -->
    <button
      @click.stop="handleDelete"
      class="absolute top-3 right-3 transition-opacity p-1.5 text-telegram-destructive-text hover:bg-telegram-secondary-bg rounded-lg touch-manipulation z-30 hidden sm:block"
      :style="{ 
        transform: `translateX(${swipeOffset}px)`, 
        transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
      }"
      :class="showDeleteButton ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
    >
      <Trash2 :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Flag, Trash2 } from 'lucide-vue-next'
import type { Todo, TodoPriority } from '~/types/todo'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [id: string, completed: boolean]
  delete: [id: string]
  edit: [todo: Todo]
}>()

// Try to use todos composable, but handle case when it's not available (dev mode)
let updateTodoFn: ((id: string, data: any) => Promise<any>) | null = null
let deleteTodoFn: ((id: string) => Promise<boolean>) | null = null

try {
  const todosComposable = useTodos()
  updateTodoFn = todosComposable.updateTodo
  deleteTodoFn = todosComposable.deleteTodo
} catch (e) {
  // In dev mode without Telegram user, composable might not work
  console.warn('useTodos not available, using direct emit mode')
}

const showDeleteButton = ref(false)

// Swipe functionality
const todoCard = ref<HTMLElement | null>(null)
const swipeOffset = ref(0)
const isSwiping = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const SWIPE_THRESHOLD = 80 // Minimum swipe distance to trigger delete

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = Math.abs(currentY - touchStartY.value)
  
  // Only allow horizontal swipe (prevent vertical scrolling interference)
  if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
    e.preventDefault()
    swipeOffset.value = Math.max(deltaX, -120) // Limit max swipe distance
  }
}

const handleTouchEnd = () => {
  isSwiping.value = false
  
  if (Math.abs(swipeOffset.value) >= SWIPE_THRESHOLD) {
    // Trigger delete without confirmation (swipe is the confirmation)
    performDelete(false)
  } else {
    // Reset position
    swipeOffset.value = 0
  }
}

const handleCardClick = (e: MouseEvent) => {
  // Don't open modal if we just finished a swipe
  if (Math.abs(swipeOffset.value) > 0) {
    swipeOffset.value = 0
    return
  }
  
  // Don't open modal if clicking on interactive elements
  const target = e.target as HTMLElement
  if (target.closest('button') || target.closest('svg') || target.closest('a')) {
    return
  }
  
  // Prevent event if clicking on the card itself (not content)
  if (target === todoCard.value) {
    return
  }
  
  handleOpenModal()
}

const toggleComplete = async () => {
  const newCompleted = !props.todo.completed
  
  // Try to update via API if available, otherwise just emit
  if (updateTodoFn) {
    try {
      await updateTodoFn(props.todo.id, { completed: newCompleted })
    } catch (e) {
      console.warn('Failed to update via API, using emit only:', e)
    }
  }
  
  emit('update', props.todo.id, newCompleted)
  
  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const handleOpenModal = () => {
  emit('edit', props.todo)
}

const performDelete = async (showConfirm: boolean = true) => {
  if (showConfirm && !confirm('Вы уверены, что хотите удалить эту задачу?')) {
    swipeOffset.value = 0
    return
  }
  
  // Try to delete via API if available, otherwise just emit
  if (deleteTodoFn) {
    try {
      await deleteTodoFn(props.todo.id)
    } catch (e) {
      console.warn('Failed to delete via API, using emit only:', e)
    }
  }
  
  emit('delete', props.todo.id)
  
  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
  
  swipeOffset.value = 0
}

const handleDelete = () => {
  performDelete(true)
}

const formatDateShort = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const isOverdue = computed(() => {
  if (!props.todo.dueDate || props.todo.completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(props.todo.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
})

const getPriorityClass = (priority: TodoPriority) => {
  switch (priority) {
    case 'high':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'low':
      return 'text-blue-500'
    default:
      return 'text-telegram-hint'
  }
}

</script>

