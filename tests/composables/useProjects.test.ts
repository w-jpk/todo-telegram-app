import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjects } from '~/composables/useProjects'
import { createMockProject } from '../utils/test-helpers'

const mockFetch = vi.fn() as any
mockFetch.raw = vi.fn()
mockFetch.create = vi.fn(() => mockFetch)
global.$fetch = mockFetch

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ data: [] })
  })

  it('should return expected properties', () => {
    const result = useProjects()

    expect(result).toHaveProperty('projects')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('error')
    expect(result).toHaveProperty('fetchProjects')
    expect(result).toHaveProperty('createProject')
  })

  it('should initialize with correct default values', () => {
    const { projects, loading, error } = useProjects()

    expect(projects.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should fetch projects successfully', async () => {
    const mockProjects = [
      createMockProject({ id: '1', name: 'Project 1' }),
      createMockProject({ id: '2', name: 'Project 2' })
    ]
    
    mockFetch.mockResolvedValue({ data: mockProjects })
    
    const { fetchProjects, projects, loading } = useProjects()
    
    await fetchProjects()
    
    expect(mockFetch).toHaveBeenCalledWith('/api/projects', {
      method: 'GET',
      headers: expect.any(Object)
    })
    expect(projects.value).toHaveLength(2)
    expect(loading.value).toBe(false)
  })

  it('should handle fetch projects error', async () => {
    const errorMessage = 'Failed to fetch projects'
    mockFetch.mockRejectedValue(new Error(errorMessage))
    
    const { fetchProjects, error, loading } = useProjects()
    
    await fetchProjects()
    
    expect(error.value).toBe(errorMessage)
    expect(loading.value).toBe(false)
  })
})

