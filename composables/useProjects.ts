import type { Project, CreateProjectDto, UpdateProjectDto } from '~/types/todo'

export const useProjects = () => {
  const projects = useState<Project[]>('projects:list', () => [])
  const loading = useState<boolean>('projects:loading', () => false)
  const error = useState<string | null>('projects:error', () => null)

  const { $telegram } = useNuxtApp()
  const userId = computed(() => $telegram?.user?.id || null)

  // Get headers for API requests
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'x-telegram-user-id': userId.value?.toString() || ''
    }

    if ($telegram?.user) {
      headers['x-telegram-user-data'] = encodeURIComponent(JSON.stringify($telegram.user))
    }

    return headers
  }

  // Fetch projects
  const fetchProjects = async () => {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: Project[] }>('/api/projects', {
        method: 'GET',
        headers: getHeaders()
      })
      projects.value = data.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      }))
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Create project
  const createProject = async (projectData: CreateProjectDto) => {
    if (!userId.value) return null

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: Project }>('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: projectData
      })

      const newProject = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }

      projects.value.push(newProject)
      return newProject
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      console.error('Error creating project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update project
  const updateProject = async (id: string, projectData: UpdateProjectDto) => {
    if (!userId.value) return null

    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: Project }>(`/api/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: projectData
      })

      const updatedProject = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      }

      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        const next = [...projects.value]
        next[index] = updatedProject
        projects.value = next
      }

      return updatedProject
    } catch (err: any) {
      error.value = err.message || 'Failed to update project'
      console.error('Error updating project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete project
  const deleteProject = async (id: string) => {
    if (!userId.value) return false

    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      projects.value = projects.value.filter(p => p.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    projects: readonly(projects),
    loading: readonly(loading),
    error: readonly(error),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

