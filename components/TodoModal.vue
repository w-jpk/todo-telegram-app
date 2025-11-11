<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="w-full max-w-lg max-h-[90vh] bg-telegram-bg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 sm:p-6 border-b border-telegram-secondary-bg/50">
            <h2 class="text-xl sm:text-2xl font-bold text-telegram-text">
              {{ todo ? 'Редактировать задачу' : 'Новая задача' }}
            </h2>
            <button
              @click="handleClose"
              class="p-2 text-telegram-hint hover:text-telegram-text transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X :size="24" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <!-- Title Input -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Название задачи *
              </label>
              <input
                v-model="formData.text"
                type="text"
                placeholder="Введите название задачи..."
                class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text placeholder-telegram-hint text-base"
                ref="titleInput"
              />
            </div>

            <!-- Description Input -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Описание
              </label>
              <textarea
                v-model="formData.description"
                placeholder="Добавьте описание..."
                rows="3"
                class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text placeholder-telegram-hint text-base resize-none"
              />
            </div>

            <!-- Priority Selector -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Приоритет
              </label>
              <PrioritySelector
                v-model="formData.priority"
                class="w-full"
              />
            </div>

            <!-- Project Selector -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Проект
              </label>
              <ProjectSelector
                v-model="formData.projectId"
                :projects="projects"
                class="w-full"
              />
            </div>

            <!-- Due Date Selector -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Срок выполнения
              </label>
              <DateSelector
                v-model="formData.dueDate"
                class="w-full"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-4 sm:p-6 border-t border-telegram-secondary-bg/50">
            <button
              @click="handleClose"
              class="flex-1 px-4 py-3 bg-telegram-secondary-bg text-telegram-text rounded-xl font-medium active:opacity-80 transition-opacity touch-manipulation"
            >
              Отмена
            </button>
            <button
              @click="handleSave"
              :disabled="!formData.text.trim() || saving"
              class="flex-1 px-4 py-3 bg-telegram-button text-telegram-button-text rounded-xl font-medium active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {{ saving ? 'Сохранение...' : todo ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import type { Todo, CreateTodoDto, UpdateTodoDto, Project, TodoPriority } from '~/types/todo'
import PrioritySelector from './PrioritySelector.vue'
import ProjectSelector from './ProjectSelector.vue'
import DateSelector from './DateSelector.vue'

interface Props {
  isOpen: boolean
  todo?: Todo | null
  projects: readonly Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: CreateTodoDto | UpdateTodoDto]
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)

const formData = ref<{
  text: string
  description: string
  priority: TodoPriority
  projectId?: string
  dueDate?: Date | null
}>({
  text: '',
  description: '',
  priority: 'none',
  projectId: undefined,
  dueDate: undefined
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.todo) {
      formData.value = {
        text: props.todo.text,
        description: props.todo.description || '',
        priority: props.todo.priority || 'none',
        projectId: props.todo.projectId,
        dueDate: props.todo.dueDate ? new Date(props.todo.dueDate) : undefined
      }
    } else {
      formData.value = {
        text: '',
        description: '',
        priority: 'none',
        projectId: undefined,
        dueDate: undefined
      }
    }
    
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

const handleClose = () => {
  if (!saving.value) {
    emit('close')
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
    dueDate: formData.value.dueDate || undefined
  }
  
  emit('save', data)
  
  setTimeout(() => {
    saving.value = false
  }, 500)
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

