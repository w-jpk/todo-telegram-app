<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="w-full px-4 py-3 bg-telegram-secondary-bg border border-telegram-secondary-bg/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-button text-telegram-text text-left flex items-center justify-between touch-manipulation min-h-[44px]"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div
          v-if="selectedProject"
          class="w-4 h-4 rounded-full shrink-0"
          :style="{ backgroundColor: selectedProject.color }"
        />
        <span class="truncate">
          {{ selectedProject?.name || 'Выберите проект' }}
        </span>
      </div>
      <ChevronDown :size="20" class="shrink-0 ml-2" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-10 w-full mt-2 bg-telegram-bg border border-telegram-secondary-bg/50 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        @click.stop
      >
        <button
          @click="selectProject(undefined)"
          class="w-full px-4 py-3 text-left hover:bg-telegram-secondary-bg transition-colors touch-manipulation flex items-center gap-2"
          :class="{ 'bg-telegram-secondary-bg': !modelValue }"
        >
          <span class="text-telegram-text">Без проекта</span>
        </button>
        <button
          v-for="project in projects"
          :key="project.id"
          @click="selectProject(project.id)"
          class="w-full px-4 py-3 text-left hover:bg-telegram-secondary-bg transition-colors touch-manipulation flex items-center gap-2"
          :class="{ 'bg-telegram-secondary-bg': modelValue === project.id }"
        >
          <div
            class="w-4 h-4 rounded-full shrink-0"
            :style="{ backgroundColor: project.color }"
          />
          <span class="text-telegram-text">{{ project.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { Project } from '~/types/todo'

interface Props {
  modelValue?: string
  projects: readonly Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value?: string]
}>()

const isOpen = ref(false)

const selectedProject = computed(() => {
  if (!props.modelValue) return null
  return props.projects.find(p => p.id === props.modelValue) || null
})

const selectProject = (projectId?: string) => {
  emit('update:modelValue', projectId)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

