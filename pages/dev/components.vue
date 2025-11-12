<template>
  <div class="min-h-screen-safe bg-telegram-bg text-telegram-text pb-safe-bottom">
    <div class="container py-8 space-y-10">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Component Playground</h1>
          <p class="text-sm text-telegram-hint mt-1">
            Страница для ручного тестирования ключевых компонентов во время разработки.
            Доступна только в режиме <code>npm run dev</code>.
          </p>
        </div>
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-lg bg-telegram-secondary-bg text-telegram-text hover:bg-telegram-section-bg transition-colors touch-manipulation"
        >
          Вернуться в приложение
        </NuxtLink>
      </header>

      <section class="space-y-4">
        <h2 class="text-xl font-medium">TodoItem состояния</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TodoItem
            v-for="todo in previewTodos"
            :key="todo.id"
            :todo="todo"
            @update="handleTodoToggle"
            @delete="handleTodoDelete"
            @edit="handleTodoEdit"
          />
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <h2 class="text-xl font-medium">Фильтры и список</h2>
          <div class="flex items-center gap-3">
            <button
              @click="openCreateTodoModal"
              class="px-4 py-2 rounded-lg bg-telegram-button text-telegram-button-text hover:opacity-90 transition-colors touch-manipulation"
            >
              Создать задачу
            </button>
            <label class="flex items-center gap-2 text-sm text-telegram-hint">
              <input type="checkbox" v-model="showCompleted" class="accent-blue-500">
              Показывать выполненные
            </label>
          </div>
        </div>
        <TodoFilters
          :current-filter="currentFilter"
          :date-from="dateFilter.from"
          :date-to="dateFilter.to"
          @filter="handleFilterChange"
          @date-change="handleDateFilterChange"
        />
        <div class="space-y-3">
          <TodoItem
            v-for="todo in filteredPreviewTodos"
            :key="`list-${todo.id}`"
            :todo="todo"
            @update="handleTodoToggle"
            @delete="handleTodoDelete"
            @edit="handleTodoEdit"
          />
          <p v-if="filteredPreviewTodos.length === 0" class="text-sm text-telegram-hint">
            Нет задач, удовлетворяющих текущим фильтрам.
          </p>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-medium">Быстрые контролы</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-2 p-4 rounded-xl bg-telegram-section-bg border border-white/10">
            <h3 class="text-sm font-semibold text-telegram-text/80 uppercase tracking-wide">PrioritySelector</h3>
            <PrioritySelector v-model="prioritySelection" />
            <p class="text-xs text-telegram-hint">Текущий приоритет: <span class="text-telegram-text">{{ prioritySelection }}</span></p>
          </div>
          <div class="space-y-2 p-4 rounded-xl bg-telegram-section-bg border border-white/10">
            <h3 class="text-sm font-semibold text-telegram-text/80 uppercase tracking-wide">DateSelector</h3>
            <DateSelector v-model="dateSelection" />
            <p class="text-xs text-telegram-hint">
              Дата: <span class="text-telegram-text">{{ dateSelection ? dateSelection.toLocaleDateString('ru-RU') : 'не выбрана' }}</span>
            </p>
          </div>
          <div class="space-y-2 p-4 rounded-xl bg-telegram-section-bg border border-white/10">
            <h3 class="text-sm font-semibold text-telegram-text/80 uppercase tracking-wide">ProjectSelector</h3>
            <ProjectSelector
              v-model="projectSelection"
              :projects="sampleProjects"
              @project-created="handleProjectCreated"
            />
            <p class="text-xs text-telegram-hint flex items-center gap-1">
              Выбранный проект:
              <span class="text-telegram-text">
                {{ projectSelection ? sampleProjects.find(project => project.id === projectSelection)?.name || 'не найден' : 'не выбран' }}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>

    <TodoModal
      :is-open="isTodoModalOpen"
      :todo="modalTodo"
      :projects="sampleProjects"
      @close="closeTodoModal"
      @save="handleTodoSave"
      @project-created="handleProjectCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  CreateTodoDto,
  Project,
  Todo,
  TodoFilter,
  TodoPriority,
  UpdateTodoDto
} from '~/types/todo'

definePageMeta({
  middleware: 'dev-only'
})

const now = new Date()

const sampleProjectsState = ref<Project[]>([
  {
    id: 'project-inbox',
    name: 'Inbox',
    color: '#3b82f6',
    userId: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'project-work',
    name: 'Work',
    color: '#f59e0b',
    userId: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'project-personal',
    name: 'Personal',
    color: '#22c55e',
    userId: 1,
    createdAt: now,
    updatedAt: now
  }
])

const sampleProjects = computed(() => sampleProjectsState.value as readonly Project[])

const sampleTodos = ref<Todo[]>([
  {
    id: 'todo-1',
    text: 'Собрать отчёт по проекту',
    description: 'Проверить метрики за прошлую неделю, подготовить графики и выводы.',
    completed: false,
    priority: 'high',
    userId: 1,
    projectId: 'project-work',
    project: sampleProjectsState.value.find(p => p.id === 'project-work'),
    createdAt: now,
    updatedAt: now,
    dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'todo-2',
    text: 'Купить продукты',
    description: 'Хлеб, молоко, сыр, овощи',
    completed: false,
    priority: 'medium',
    userId: 1,
    projectId: 'project-personal',
    project: sampleProjectsState.value.find(p => p.id === 'project-personal'),
    createdAt: now,
    updatedAt: now,
    dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'todo-3',
    text: 'Позвонить стоматологу',
    description: 'Записаться на профилактический приём на следующую неделю.',
    completed: true,
    priority: 'low',
    userId: 1,
    projectId: 'project-personal',
    project: sampleProjectsState.value.find(p => p.id === 'project-personal'),
    createdAt: now,
    updatedAt: now,
    dueDate: new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
])

const previewTodos = computed(() => sampleTodos.value.slice(0, 3))

const currentFilter = ref<TodoFilter>('all')
const dateFilter = ref<{ from: Date | null; to: Date | null }>({
  from: null,
  to: null
})
const showCompleted = ref(true)

const filteredPreviewTodos = computed(() => {
  let list = [...sampleTodos.value]

  if (!showCompleted.value) {
    list = list.filter(todo => !todo.completed)
  }

  switch (currentFilter.value) {
    case 'active':
      list = list.filter(todo => !todo.completed)
      break
    case 'completed':
      list = list.filter(todo => todo.completed)
      break
    default:
      break
  }

  const { from, to } = dateFilter.value
  if (from || to) {
    list = list.filter(todo => {
      if (!todo.dueDate) return false

      const todoDate = new Date(todo.dueDate)
      todoDate.setHours(0, 0, 0, 0)

      if (from) {
        const fromDate = new Date(from)
        fromDate.setHours(0, 0, 0, 0)
        if (todoDate < fromDate) return false
      }

      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        if (todoDate > toDate) return false
      }

      return true
    })
  }

  return list
})

const prioritySelection = ref<TodoPriority>('medium')
const dateSelection = ref<Date | null>(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000))
const projectSelection = ref<string | undefined>(sampleProjectsState.value[0]?.id)

const isTodoModalOpen = ref(false)
const modalTodo = ref<Todo | null>(null)

const openCreateTodoModal = () => {
  modalTodo.value = null
  isTodoModalOpen.value = true
}

const handleTodoEdit = (todo: Todo) => {
  modalTodo.value = { ...todo }
  isTodoModalOpen.value = true
}

const closeTodoModal = () => {
  isTodoModalOpen.value = false
  modalTodo.value = null
}

const findProjectById = (projectId?: string) => {
  if (!projectId) return undefined
  return sampleProjectsState.value.find(project => project.id === projectId)
}

const normalizeDueDate = (value?: Date | null) => {
  if (!value) return undefined
  return new Date(value)
}

const handleTodoSave = (payload: CreateTodoDto | UpdateTodoDto) => {
  if (modalTodo.value) {
    const targetId = modalTodo.value.id
    sampleTodos.value = sampleTodos.value.map(todo => {
      if (todo.id !== targetId) return todo

      const nextProject = findProjectById(payload.projectId ?? todo.projectId)
      const nextDueDate = normalizeDueDate(payload.dueDate ?? todo.dueDate)

      return {
        ...todo,
        text: payload.text ?? todo.text,
        description: payload.description !== undefined ? payload.description : todo.description,
        priority: payload.priority ?? todo.priority,
        projectId: payload.projectId ?? todo.projectId,
        project: nextProject ?? undefined,
        dueDate: nextDueDate,
        updatedAt: new Date()
      }
    })
  } else {
    const nextId = `dev-${Date.now()}`
    const nextProject = findProjectById(payload.projectId)
    const dueDate = normalizeDueDate(payload.dueDate)
    const createdAt = new Date()

    const newTodo: Todo = {
      id: nextId,
      text: payload.text ?? 'Новая задача',
      description: payload.description,
      completed: false,
      priority: payload.priority ?? 'none',
      userId: 1,
      projectId: payload.projectId,
      project: nextProject ?? undefined,
      createdAt,
      updatedAt: createdAt,
      dueDate
    }

    sampleTodos.value = [newTodo, ...sampleTodos.value]
  }

  closeTodoModal()
}

const handleTodoToggle = (id: string, completed: boolean) => {
  sampleTodos.value = sampleTodos.value.map(todo =>
    todo.id === id
      ? {
          ...todo,
          completed,
          updatedAt: new Date()
        }
      : todo
  )
}

const handleTodoDelete = (id: string) => {
  sampleTodos.value = sampleTodos.value.filter(todo => todo.id !== id)
}

const handleFilterChange = (filter: TodoFilter) => {
  currentFilter.value = filter
}

const handleDateFilterChange = (from: Date | null, to: Date | null) => {
  dateFilter.value = { from, to }
}

const handleProjectCreated = (project: Project) => {
  const normalized: Project = {
    ...project,
    createdAt: project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt),
    updatedAt: project.updatedAt instanceof Date ? project.updatedAt : new Date(project.updatedAt)
  }

  sampleProjectsState.value = [...sampleProjectsState.value, normalized]
}
</script>


