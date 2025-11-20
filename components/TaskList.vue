<template>
  <div v-if="tasks.length === 0" class="text-center py-8">
    <p class="text-gray-500 dark:text-gray-400">Нет задач</p>
  </div>
  <div v-else role="list" aria-label="Task list">
    <!-- Use virtualization for large lists (>20 items) when not in bulk mode -->
    <template v-if="tasks.length > 20 && !props.showCheckboxes">
      <div ref="scrollElement" class="max-h-96 overflow-auto">
        <div
          :style="{ height: `${virtualizer.getTotalSize()}px` }"
          class="relative"
        >
          <div
            v-for="virtualItem in virtualizer.getVirtualItems()"
            :key="String(virtualItem.key)"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-900/50 mb-3"
              role="listitem">
              <div class="flex items-start space-x-3">
                <div class="drag-handle cursor-move mr-2 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" role="button" tabindex="0"
                  :aria-label="`Drag to reorder task: ${localTasks[virtualItem.index].text}`">
                  <i class="fas fa-grip-vertical text-sm" aria-hidden="true"></i>
                </div>
                <button
                  :class="{
                    'bg-green-500 border-green-500': localTasks[virtualItem.index].completed,
                    'border-gray-300 dark:border-gray-600': !localTasks[virtualItem.index].completed
                  }"
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  :aria-label="localTasks[virtualItem.index].completed ? `Mark task '${localTasks[virtualItem.index].text}' as incomplete` : `Mark task '${localTasks[virtualItem.index].text}' as complete`"
                  @click="$emit('toggle', localTasks[virtualItem.index].id)"
                  @keydown.enter="$emit('toggle', localTasks[virtualItem.index].id)"
                  @keydown.space.prevent="$emit('toggle', localTasks[virtualItem.index].id)">
                  <i v-if="localTasks[virtualItem.index].completed" class="fas fa-check text-white text-xs" aria-hidden="true"></i>
                </button>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h3 :class="{ 'line-through text-gray-400 dark:text-gray-500': localTasks[virtualItem.index].completed }" class="font-medium text-gray-900 dark:text-white">
                      {{ localTasks[virtualItem.index].text }}
                    </h3>
                    <div class="flex items-center space-x-2">
                      <div v-if="localTasks[virtualItem.index].priority && localTasks[virtualItem.index].priority !== 'none'" :class="getPriorityColor(localTasks[virtualItem.index].priority)"
                        class="w-2 h-2 rounded-full"></div>
                      <button
                        class="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 p-1 rounded"
                        @click="$emit('edit', localTasks[virtualItem.index])"
                        :aria-label="`Edit task: ${localTasks[virtualItem.index].text}`">
                          <i class="fas fa-ellipsis-h text-gray-400 dark:text-gray-500 text-sm" aria-hidden="true"></i>
                        </button>
                    </div>
                  </div>
                    <p v-if="localTasks[virtualItem.index].description" :class="{ 'line-through text-gray-400 dark:text-gray-500': localTasks[virtualItem.index].completed }"
                    class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {{ localTasks[virtualItem.index].description }}
                  </p>
                  
                  <!-- Tags -->
                  <div v-if="localTasks[virtualItem.index].tags && localTasks[virtualItem.index].tags!.length > 0" class="flex flex-wrap gap-1 mb-2">
                    <span
                      v-for="tag in localTasks[virtualItem.index].tags!"
                      :key="tag.id"
                      class="px-2 py-1 rounded-full text-xs font-medium text-white"
                      :style="{ backgroundColor: tag.color }"
                    >
                      {{ tag.name }}
                    </span>
                  </div>

                  <!-- Subtasks -->
                  <div v-if="localTasks[virtualItem.index].subtasks && localTasks[virtualItem.index].subtasks!.length > 0" class="mt-2 mb-2">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Подзадачи ({{ getCompletedSubtasksCount(localTasks[virtualItem.index]) }}/{{ localTasks[virtualItem.index].subtasks!.length }})
                      </span>
                      <button
                        @click.stop="toggleSubtasksExpanded(localTasks[virtualItem.index].id)"
                        class="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {{ isSubtasksExpanded(localTasks[virtualItem.index].id) ? 'Свернуть' : 'Развернуть' }}
                      </button>
                    </div>

                    <div v-if="isSubtasksExpanded(localTasks[virtualItem.index].id)" class="space-y-1.5 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                      <div
                        v-for="subtask in localTasks[virtualItem.index].subtasks"
                        :key="subtask.id"
                        class="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <button
                          @click.stop="toggleSubtaskComplete(subtask.id)"
                          :class="{
                            'bg-green-500 border-green-500': subtask.completed,
                            'border-gray-300 dark:border-gray-600': !subtask.completed
                          }"
                          class="w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors shrink-0 mt-0.5"
                        >
                          <i v-if="subtask.completed" class="fas fa-check text-white text-xs" aria-hidden="true"></i>
                        </button>

                        <div class="flex-1 min-w-0">
                          <p
                            class="text-sm break-words"
                            :class="{
                              'line-through text-gray-500 dark:text-gray-400': subtask.completed,
                              'text-gray-900 dark:text-white': !subtask.completed
                            }"
                          >
                            {{ subtask.text }}
                          </p>
                        </div>

                        <button
                          @click.stop="$emit('edit', subtask)"
                          class="text-blue-500 hover:text-blue-600 transition-colors p-1"
                          title="Редактировать подзадачу"
                        >
                          <i class="fas fa-edit text-xs" aria-hidden="true"></i>
                        </button>

                        <button
                          @click.stop="deleteSubtask(subtask.id)"
                          class="text-red-500 hover:text-red-600 transition-colors p-1"
                          title="Удалить подзадачу"
                        >
                          <i class="fas fa-times text-xs" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div v-if="localTasks[virtualItem.index].dueDate" :class="getDueDateColor(localTasks[virtualItem.index].dueDate as Date, localTasks[virtualItem.index].completed)"
                        class="flex items-center space-x-1 text-xs">
                        <i class="fas fa-calendar-alt"></i>
                        <span>{{ formatDate(localTasks[virtualItem.index].dueDate as Date) }}</span>
                      </div>
                      <span v-if="localTasks[virtualItem.index].project" :class="getCategoryColor(localTasks[virtualItem.index].project?.name || '')"
                        class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ localTasks[virtualItem.index].project?.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Use drag & drop for smaller lists or when in bulk mode -->
    <template v-else>
      <VueDraggableNext
        v-model="localTasks"
        :animation="200"
        :handle="'.drag-handle'"
        @end="onDragEnd"
        class="space-y-3"
      >
        <div
          v-for="task in localTasks"
          :key="task.id"
          class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-900/50"
          role="listitem">
          <div class="flex items-start space-x-3">
            <div v-if="props.showCheckboxes" class="mt-0.5">
              <input
                type="checkbox"
                :id="`task-checkbox-${task.id}`"
                :checked="props.selectedTasks?.includes(task.id)"
                @change="toggleTaskSelection(task.id)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                :aria-label="`Select task: ${task.text}`"
              />
            </div>
            <div v-else class="drag-handle cursor-move mr-2 mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" role="button" tabindex="0"
              :aria-label="`Drag to reorder task: ${task.text}`">
              <i class="fas fa-grip-vertical text-sm" aria-hidden="true"></i>
            </div>
            <button
              :class="{
                'bg-green-500 border-green-500': task.completed,
                'border-gray-300 dark:border-gray-600': !task.completed
              }"
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              :aria-label="task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`"
              @click="$emit('toggle', task.id)"
              @keydown.enter="$emit('toggle', task.id)"
              @keydown.space.prevent="$emit('toggle', task.id)">
              <i v-if="task.completed" class="fas fa-check text-white text-xs" aria-hidden="true"></i>
            </button>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h3 :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }" class="font-medium text-gray-900 dark:text-white">
                  {{ task.text }}
                </h3>
                <div class="flex items-center space-x-2">
                  <div v-if="task.priority && task.priority !== 'none'" :class="getPriorityColor(task.priority)"
                    class="w-2 h-2 rounded-full"></div>
                  <button
                    class="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 p-1 rounded"
                    @click="$emit('edit', task)"
                    :aria-label="`Edit task: ${task.text}`">
                      <i class="fas fa-ellipsis-h text-gray-400 dark:text-gray-500 text-sm" aria-hidden="true"></i>
                    </button>
                </div>
              </div>
                <p v-if="task.description" :class="{ 'line-through text-gray-400 dark:text-gray-500': task.completed }"
                class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {{ task.description }}
              </p>
              
              <!-- Tags -->
              <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="tag in task.tags"
                  :key="tag.id"
                  class="px-2 py-1 rounded-full text-xs font-medium text-white"
                  :style="{ backgroundColor: tag.color }"
                >
                  {{ tag.name }}
                </span>
              </div>

              <!-- Subtasks -->
              <div v-if="task.subtasks && task.subtasks.length > 0" class="mt-2 mb-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Подзадачи ({{ getCompletedSubtasksCount(task) }}/{{ task.subtasks.length }})
                  </span>
                  <button
                    @click.stop="toggleSubtasksExpanded(task.id)"
                    class="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {{ isSubtasksExpanded(task.id) ? 'Свернуть' : 'Развернуть' }}
                  </button>
                </div>

                <div v-if="isSubtasksExpanded(task.id)" class="space-y-1.5 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                  <div
                    v-for="subtask in task.subtasks"
                    :key="subtask.id"
                    class="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <button
                      @click.stop="toggleSubtaskComplete(subtask.id)"
                      :class="{
                        'bg-green-500 border-green-500': subtask.completed,
                        'border-gray-300 dark:border-gray-600': !subtask.completed
                      }"
                      class="w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors shrink-0 mt-0.5"
                    >
                      <i v-if="subtask.completed" class="fas fa-check text-white text-xs" aria-hidden="true"></i>
                    </button>

                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm break-words"
                        :class="{
                          'line-through text-gray-500 dark:text-gray-400': subtask.completed,
                          'text-gray-900 dark:text-white': !subtask.completed
                        }"
                      >
                        {{ subtask.text }}
                      </p>
                    </div>

                    <button
                      @click.stop="$emit('edit', subtask)"
                      class="text-blue-500 hover:text-blue-600 transition-colors p-1"
                      title="Редактировать подзадачу"
                    >
                      <i class="fas fa-edit text-xs" aria-hidden="true"></i>
                    </button>

                    <button
                      @click.stop="deleteSubtask(subtask.id)"
                      class="text-red-500 hover:text-red-600 transition-colors p-1"
                      title="Удалить подзадачу"
                    >
                      <i class="fas fa-times text-xs" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div v-if="task.dueDate" :class="getDueDateColor(task.dueDate, task.completed)"
                    class="flex items-center space-x-1 text-xs">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatDate(task.dueDate) }}</span>
                  </div>
                  <span v-if="task.project" :class="getCategoryColor(task.project.name)"
                    class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ task.project.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VueDraggableNext>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/types/todo'
import { formatDateForDisplay, isOverdue, isToday } from '~/utils/date'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { VueDraggableNext } from 'vue-draggable-next'

interface Props {
  tasks: Todo[]
  selectedTasks?: string[]
  showCheckboxes?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: string]
  edit: [task: Todo]
  reorder: [tasks: Todo[]]
  'update:selectedTasks': [selectedTasks: string[]]
  'toggle-subtask': [id: string]
  'delete-subtask': [id: string]
}>()

const localTasks = ref<Todo[]>([...props.tasks])
const scrollElement = ref<HTMLElement>()
const expandedSubtasks = ref<Set<string>>(new Set())
const virtualItemsCount = computed(() => localTasks.value.length)

// Watch for changes in props.tasks and update localTasks
watch(() => props.tasks, (newTasks) => {
  localTasks.value = [...newTasks]
}, { immediate: true })

// Virtualizer for large lists
const virtualizer = useVirtualizer({
  count: virtualItemsCount,
  getScrollElement: () => scrollElement.value || null,
  estimateSize: () => 120, // Estimated height of each item
  overscan: 5
})

watch(virtualItemsCount, () => {
  // Ensure virtualization recalculates positions when dataset changes
  virtualizer.value?.measure?.()
})

const onDragEnd = () => {
  // Emit reorder event with new order
  emit('reorder', [...localTasks.value])
}

const toggleTaskSelection = (taskId: string) => {
  const currentSelected = props.selectedTasks || []
  const isSelected = currentSelected.includes(taskId)

  let newSelected: string[]
  if (isSelected) {
    newSelected = currentSelected.filter(id => id !== taskId)
  } else {
    newSelected = [...currentSelected, taskId]
  }

  emit('update:selectedTasks', newSelected)
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

const getDueDateColor = (dueDate: Date, completed: boolean) => {
  if (completed) return 'text-gray-500 dark:text-gray-400'
  if (isOverdue(dueDate)) return 'text-red-500 dark:text-red-400'
  if (isToday(dueDate)) return 'text-orange-500 dark:text-orange-400'
  return 'text-gray-500 dark:text-gray-400'
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Work': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    case 'Personal': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'Shopping': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    case 'Health': return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const formatDate = (dateString: Date) => {
  return formatDateForDisplay(dateString)
}

// Subtasks functionality
const getCompletedSubtasksCount = (task: Todo) => {
  return task.subtasks?.filter(subtask => subtask.completed).length || 0
}

const isSubtasksExpanded = (taskId: string) => {
  return expandedSubtasks.value.has(taskId)
}

const toggleSubtasksExpanded = (taskId: string) => {
  if (expandedSubtasks.value.has(taskId)) {
    expandedSubtasks.value.delete(taskId)
  } else {
    expandedSubtasks.value.add(taskId)
  }
}

const toggleSubtaskComplete = async (subtaskId: string) => {
  emit('toggle-subtask', subtaskId)
}

const deleteSubtask = async (subtaskId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту подзадачу?')) {
    emit('delete-subtask', subtaskId)
  }
}
</script>