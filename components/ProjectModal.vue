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
              {{ project ? 'Редактировать проект' : 'Новый проект' }}
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
            <!-- Name Input -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Название проекта *
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Введите название проекта..."
                class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent text-telegram-text placeholder-telegram-hint text-base"
                ref="nameInput"
                @keyup.enter="handleSave"
              />
            </div>

            <!-- Color Selector -->
            <div>
              <label class="block text-sm font-medium text-telegram-text mb-2">
                Цвет проекта
              </label>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="color in projectColors"
                  :key="color"
                  @click="formData.color = color"
                  class="w-full aspect-square rounded-lg border-2 transition-all touch-manipulation"
                  :class="formData.color === color ? 'border-telegram-text scale-110' : 'border-telegram-secondary-bg/50 hover:border-telegram-hint'"
                  :style="{ backgroundColor: color }"
                  :aria-label="`Выбрать цвет ${color}`"
                />
              </div>
              <div class="mt-2 flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full border border-telegram-secondary-bg/50"
                  :style="{ backgroundColor: formData.color }"
                />
                <span class="text-sm text-telegram-hint">{{ formData.color }}</span>
              </div>
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
              :disabled="!formData.name.trim() || saving"
              class="flex-1 px-4 py-3 bg-telegram-button text-telegram-button-text rounded-xl font-medium active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {{ saving ? 'Сохранение...' : project ? 'Сохранить' : 'Создать' }}
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
import type { Project, CreateProjectDto, UpdateProjectDto } from '~/types/todo'

interface Props {
  isOpen: boolean
  project?: Project | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: CreateProjectDto | UpdateProjectDto]
}>()

const nameInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)

const projectColors = [
  '#2481cc', // Blue
  '#7c3aed', // Purple
  '#059669', // Green
  '#dc2626', // Red
  '#ea580c', // Orange
  '#ca8a04', // Yellow
  '#db2777', // Pink
  '#0891b2', // Cyan
]

const formData = ref<{
  name: string
  color: string
}>({
  name: '',
  color: projectColors[0]
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.project) {
      formData.value = {
        name: props.project.name,
        color: props.project.color || projectColors[0]
      }
    } else {
      formData.value = {
        name: '',
        color: projectColors[0]
      }
    }
    
    nextTick(() => {
      nameInput.value?.focus()
    })
  }
})

const handleClose = () => {
  if (!saving.value) {
    emit('close')
  }
}

const handleSave = () => {
  if (!formData.value.name.trim() || saving.value) return
  
  saving.value = true
  
  const data: CreateProjectDto | UpdateProjectDto = {
    name: formData.value.name.trim(),
    color: formData.value.color
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

