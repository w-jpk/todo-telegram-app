<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="w-full px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-left flex items-center justify-between touch-manipulation min-h-[44px]"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div
          v-if="selectedProject"
          class="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
          :style="{ backgroundColor: selectedProject.color || '#2481cc' }"
        />
        <span class="truncate text-sm sm:text-base">
          {{ selectedProject?.name || $t('tasks.project') }}
        </span>
      </div>
      <ChevronDown :size="18" class="sm:w-5 sm:h-5 shrink-0 ml-2" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-[150] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-y-auto scrollbar-hide"
        @click.stop
      >
        <button
          @click="selectProject(undefined)"
          class="w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation flex items-center gap-2"
          :class="{ 'bg-gray-100 dark:bg-gray-700': !modelValue }"
        >
          <span class="text-gray-900 dark:text-white text-sm sm:text-base">{{ $t('tasks.noProject') }}</span>
        </button>
        <button
          v-for="project in projects"
          :key="project.id"
          @click="selectProject(project.id)"
          class="w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation flex items-center gap-2"
          :class="{ 'bg-gray-100 dark:bg-gray-700': modelValue === project.id }"
        >
          <div
            class="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0"
            :style="{ backgroundColor: project.color || '#2481cc' }"
          />
          <span class="text-gray-900 dark:text-white text-sm sm:text-base">{{ project.name }}</span>
        </button>
        <div class="border-t border-gray-200 dark:border-gray-700 my-1" />
        <button
          @click.stop="openCreateModal"
          class="w-full px-3 sm:px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation flex items-center gap-2 text-blue-500 dark:text-blue-400"
        >
          <Plus :size="16" class="sm:w-[18px] sm:h-[18px]" />
          <span class="text-sm sm:text-base">{{ $t('projects.createProject') }}</span>
        </button>
      </div>
    </Transition>

    <!-- Project Modal -->
    <ProjectModal
      :is-open="isProjectModalOpen"
      :project="null"
      @close="closeProjectModal"
      @save="handleCreateProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'
import type { Project, CreateProjectDto, UpdateProjectDto } from '~/types/todo'
import ProjectModal from './ProjectModal.vue'

interface Props {
  modelValue?: string
  projects: readonly Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value?: string]
  'project-created': [project: Project]
}>()

const isOpen = ref(false)
const isProjectModalOpen = ref(false)

const { createProject } = useProjects()

const selectedProject = computed(() => {
  if (!props.modelValue) return null
  return props.projects.find(p => p.id === props.modelValue) || null
})

const selectProject = (projectId?: string) => {
  emit('update:modelValue', projectId)
  isOpen.value = false
}

const openCreateModal = () => {
  isOpen.value = false
  isProjectModalOpen.value = true
  
  // Haptic feedback
  if (process.client && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
  }
}

const closeProjectModal = () => {
  isProjectModalOpen.value = false
}

const handleCreateProject = async (data: CreateProjectDto | UpdateProjectDto) => {
  // Since we're always creating a new project (project is always null),
  // we can safely cast to CreateProjectDto
  if (!data.name) {
    console.error('Project name is required')
    return
  }
  
  const newProject = await createProject(data as CreateProjectDto)
  
  if (newProject) {
    // Select the newly created project
    selectProject(newProject.id)
    
    // Emit event to parent to refresh projects list
    emit('project-created', newProject)
    
    // Haptic feedback
    if (process.client && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  }
  
  closeProjectModal()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown) {
    isOpen.value = false
    isProjectModalOpen.value = false
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

