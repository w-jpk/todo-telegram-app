<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {{ project ? 'Редактировать проект' : 'Новый проект' }}
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
            <!-- Premium Limit Warning -->
            <PremiumLimitWarning
              v-if="!project && isProjectsLimitReached"
              :show="!project && isProjectsLimitReached"
              :title="$t('premium.limitReached') || 'Достигнут лимит проектов'"
              :message="`${$t('premium.projectsLimitMessage') || 'Вы достигли лимита бесплатного аккаунта'} (${limits.maxProjects}). ${$t('premium.upgradeMessage') || 'Получите Premium для неограниченного использования.'}`"
            />
            
            <!-- Name Input -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Название проекта *
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Введите название проекта..."
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                ref="nameInput"
                @keyup.enter="handleSave"
              />
            </div>

            <!-- Color Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Цвет проекта
              </label>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="color in projectColors"
                  :key="color"
                  @click="formData.color = color"
                  class="w-full aspect-square rounded-lg border-2 transition-all touch-manipulation"
                  :class="formData.color === color ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
                  :style="{ backgroundColor: color }"
                  :aria-label="`Выбрать цвет ${color}`"
                />
              </div>
              <div class="mt-2 flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                  :style="{ backgroundColor: formData.color }"
                />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ formData.color }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="handleClose"
              class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium active:opacity-80 transition-opacity touch-manipulation hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Отмена
            </button>
            <button
              @click="handleSave"
              :disabled="!formData.name.trim() || saving"
              class="flex-1 px-4 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-xl font-medium active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation hover:bg-blue-600 dark:hover:bg-blue-700"
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
import PremiumLimitWarning from './PremiumLimitWarning.vue'
import { usePremium } from '~/composables/usePremium'

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

// Premium
const {
  isProjectsLimitReached,
  limits,
  fetchPremiumStatus
} = usePremium()

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

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    // Fetch premium status to check limits
    fetchPremiumStatus().catch(err => {
      console.warn('Failed to fetch premium status:', err)
    })
    
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

