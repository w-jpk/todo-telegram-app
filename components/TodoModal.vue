<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {{ todo ? $t('tasks.editTask') : $t('tasks.newTask') }}
            </h2>
            <button
              @click="handleClose"
              class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X :size="24" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
            <!-- Title Input -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('tasks.taskTitle') }} *
              </label>
              <input
                v-model="formData.text"
                type="text"
                :placeholder="$t('tasks.taskTitlePlaceholder')"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                ref="titleInput"
              />
            </div>

            <!-- Description Input -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('tasks.description') }}
              </label>
              <textarea
                v-model="formData.description"
                :placeholder="$t('tasks.descriptionPlaceholder')"
                rows="3"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base resize-none"
              />
            </div>

            <!-- Priority Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('tasks.priority') }}
              </label>
              <PrioritySelector
                v-model="formData.priority"
                class="w-full"
              />
            </div>

            <!-- Project Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('tasks.project') }}
              </label>
              <ProjectSelector
                v-model="formData.projectId"
                :projects="projects"
                class="w-full"
                @project-created="handleProjectCreated"
              />
            </div>

            <!-- Due Date Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('tasks.dueDate') }}
              </label>
              <DateSelector
                v-model="formData.dueDate"
                class="w-full"
              />
            </div>

            <!-- Recurrence Selector -->
            <div>
              <RecurrenceSelector
                v-model="formData.recurrenceRule"
                class="w-full"
              />
            </div>

            <!-- Tags Section -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {{ $t('common.tags') }}
              </label>
              <div class="space-y-2">
                <!-- Selected Tags -->
                <div v-if="selectedTagIds.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="tagId in selectedTagIds"
                    :key="tagId"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                    :style="{ backgroundColor: getTagById(tagId)?.color || '#6366f1' }"
                  >
                    {{ getTagById(tagId)?.name }}
                    <button
                      @click="removeTag(tagId)"
                      class="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X :size="12" />
                    </button>
                  </span>
                </div>

                <!-- Tag Selector -->
                <select
                  v-model="newTagId"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  @change="addTag"
                >
                  <option value="">{{ $t('common.selectTag') }}</option>
                  <option
                    v-for="tag in availableTags"
                    :key="tag.id"
                    :value="tag.id"
                    :disabled="selectedTagIds.includes(tag.id)"
                  >
                    {{ tag.name }}
                  </option>
                </select>

                <!-- Create New Tag -->
                <div class="flex gap-2">
                  <input
                    v-model="newTagName"
                    type="text"
                    :placeholder="$t('common.tagNamePlaceholder')"
                    class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    @keydown.enter="createAndAddTag"
                  />
                  <button
                    @click="createAndAddTag"
                    :disabled="!newTagName.trim()"
                    class="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Subtasks Section -->
            <div v-if="todo">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-900 dark:text-white">
                  {{ $t('tasks.subtasks') }}
                </label>
                <button
                  @click="addSubtask"
                  class="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  + {{ $t('tasks.addSubtask') }}
                </button>
              </div>

              <div v-if="subtasks.length > 0" class="space-y-2">
                <div
                  v-for="(subtask, index) in subtasks"
                  :key="index"
                  class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <input
                    v-model="subtask.text"
                    type="text"
                    :placeholder="$t('tasks.subtaskPlaceholder')"
                    class="flex-1 px-2 py-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    @click="removeSubtask(index)"
                    class="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="handleClose"
              class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium active:opacity-80 transition-opacity touch-manipulation hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="handleSave"
              :disabled="!formData.text.trim() || saving"
              class="flex-1 px-4 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-xl font-medium active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              {{ saving ? $t('common.loading') : todo ? $t('common.save') : $t('common.create') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import type { Todo, CreateTodoDto, UpdateTodoDto, Project, TodoPriority, Tag } from '~/types/todo'
import PrioritySelector from './PrioritySelector.vue'
import ProjectSelector from './ProjectSelector.vue'
import DateSelector from './DateSelector.vue'
import RecurrenceSelector from './RecurrenceSelector.vue'
import type { RecurrenceRule } from '~/types/todo'

interface Props {
  isOpen: boolean
  todo?: Todo | null
  projects: readonly Project[]
  initialDueDate?: Date
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: CreateTodoDto | UpdateTodoDto]
  'project-created': [project: Project]
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const subtasks = ref<Array<{ text: string }>>([])

// Tags
const availableTags = ref<Tag[]>([])
const selectedTagIds = ref<string[]>([])
const newTagId = ref('')
const newTagName = ref('')

const formData = ref<{
  text: string
  description: string
  priority: TodoPriority
  projectId?: string
  dueDate?: Date | null
  tagIds?: string[]
  recurrenceRule?: RecurrenceRule
}>({
  text: '',
  description: '',
  priority: 'none',
  projectId: undefined,
  dueDate: undefined,
  tagIds: [],
  recurrenceRule: undefined
})

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    try {
      // Load available tags (non-blocking, don't fail if tags can't load)
      loadTags().catch(err => {
        console.warn('Failed to load tags, continuing without them:', err)
      })

      if (props.todo) {
        formData.value = {
          text: props.todo.text,
          description: props.todo.description || '',
          priority: props.todo.priority || 'none',
          projectId: props.todo.projectId,
          dueDate: props.todo.dueDate ? new Date(props.todo.dueDate) : undefined,
          tagIds: props.todo.tags?.map(tag => tag.id) || [],
          recurrenceRule: props.todo.recurrenceRule
        }
        selectedTagIds.value = props.todo.tags?.map(tag => tag.id) || []
      } else {
        formData.value = {
          text: '',
          description: '',
          priority: 'none',
          projectId: undefined,
          dueDate: props.initialDueDate || undefined,
          tagIds: []
        }
        selectedTagIds.value = []
      }

      // Reset tag inputs
      newTagId.value = ''
      newTagName.value = ''

      nextTick(() => {
        titleInput.value?.focus()
      })
    } catch (error) {
      console.error('Error initializing modal:', error)
      // Still allow modal to open even if initialization fails
    }
  }
})

const handleClose = () => {
  if (!saving.value) {
    emit('close')
  }
}

const handleProjectCreated = (project: Project) => {
  emit('project-created', project)
}

const addSubtask = () => {
  subtasks.value.push({ text: '' })
}

const removeSubtask = (index: number) => {
  subtasks.value.splice(index, 1)
}

// Tag management functions
const loadTags = async () => {
  try {
    const response = await $fetch<{ data: Tag[] }>('/api/tags', {
      headers: getHeaders()
    })
    availableTags.value = response.data
  } catch (error) {
    console.error('Error loading tags:', error)
    // Don't prevent modal from opening if tags fail to load
    availableTags.value = []
  }
}

const getTagById = (id: string) => {
  return availableTags.value.find(tag => tag.id === id)
}

const addTag = () => {
  if (newTagId.value && !selectedTagIds.value.includes(newTagId.value)) {
    selectedTagIds.value.push(newTagId.value)
    formData.value.tagIds = [...selectedTagIds.value]
    newTagId.value = ''
  }
}

const removeTag = (tagId: string) => {
  selectedTagIds.value = selectedTagIds.value.filter(id => id !== tagId)
  formData.value.tagIds = [...selectedTagIds.value]
}

const createAndAddTag = async () => {
  if (!newTagName.value.trim()) return

  try {
    const response = await $fetch<{ data: Tag }>('/api/tags', {
      method: 'POST',
      headers: getHeaders(),
      body: {
        name: newTagName.value.trim(),
        color: '#6366f1' // Default color
      }
    })

    availableTags.value.push(response.data)
    selectedTagIds.value.push(response.data.id)
    formData.value.tagIds = [...selectedTagIds.value]
    newTagName.value = ''
  } catch (error) {
    console.error('Error creating tag:', error)
  }
}

const handleSave = () => {
  if (!formData.value.text.trim() || saving.value) return

  saving.value = true

  const data: CreateTodoDto | UpdateTodoDto = {
    text: formData.value.text.trim(),
    description: formData.value.description.trim() || undefined,
    priority: formData.value.priority,
    projectId: formData.value.projectId,
    dueDate: formData.value.dueDate || undefined,
    tagIds: formData.value.tagIds,
    recurrenceRule: formData.value.recurrenceRule
  }

  // If editing and there are subtasks to create, handle them separately
  if (props.todo && subtasks.value.length > 0) {
    // Create subtasks via API calls
    const subtaskPromises = subtasks.value
      .filter(subtask => subtask.text.trim())
      .map(subtask =>
        $fetch('/api/todos', {
          method: 'POST',
          headers: getHeaders(),
          body: {
            text: subtask.text.trim(),
            parentId: props.todo!.id,
            priority: 'none'
          }
        })
      )

    Promise.all(subtaskPromises).catch(err => {
      console.error('Error creating subtasks:', err)
    })
  }

  emit('save', data)

  setTimeout(() => {
    saving.value = false
    subtasks.value = [] // Reset subtasks
  }, 500)
}

const getHeaders = () => {
  const { $telegram } = useNuxtApp()
  // In dev mode, use default test user ID if not available
  const userId = $telegram?.user?.id || (process.dev ? 123456789 : null)
  
  if (!userId) {
    if (process.dev) {
      // In dev mode, still allow with default test user
      return {
        'x-telegram-user-id': '123456789'
      }
    }
    console.error('User ID is not available')
    throw new Error('User ID is required')
  }

  const headers: Record<string, string> = {
    'x-telegram-user-id': userId.toString()
  }
  return headers
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: scale(0.9);
  }
}
</style>

