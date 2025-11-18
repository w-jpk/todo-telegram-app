import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoItem from '~/components/TodoItem.vue'
import { createMockTodo, createMockProject } from '../utils/test-helpers'

// Mock composables
vi.mock('~/composables/useTodos', () => ({
  useTodos: () => ({
    updateTodo: vi.fn(),
    deleteTodo: vi.fn()
  })
}))

describe('TodoItem', () => {
  let mockTodo: any

  beforeEach(() => {
    mockTodo = createMockTodo({
      text: 'Test Todo',
      completed: false,
      project: createMockProject({ name: 'Test Project' })
    })
  })

  it('renders todo text correctly', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo }
    })

    expect(wrapper.text()).toContain('Test Todo')
  })

  it('shows project name when todo has project', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo }
    })

    expect(wrapper.text()).toContain('Test Project')
  })

  it('emits update event when checkbox is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo }
    })

    const checkbox = wrapper.find('button')
    await checkbox.trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')![0]).toEqual([mockTodo.id, true])
  })

  it('emits edit event when card is clicked', async () => {
    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo }
    })

    const card = wrapper.find('.group')
    await card.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([mockTodo])
  })

  it('shows completed styling when todo is completed', () => {
    const completedTodo = createMockTodo({ completed: true })
    const wrapper = mount(TodoItem, {
      props: { todo: completedTodo }
    })

    const title = wrapper.find('p')
    expect(title.classes()).toContain('line-through')
  })

  it('shows recurring indicator for recurring todos', () => {
    const recurringTodo = createMockTodo({ isRecurring: true })
    const wrapper = mount(TodoItem, {
      props: { todo: recurringTodo }
    })

    expect(wrapper.text()).toContain('🔄')
  })

  it('formats due date correctly', () => {
    const dueDate = new Date('2023-12-25')
    const todoWithDueDate = createMockTodo({ dueDate })
    const wrapper = mount(TodoItem, {
      props: { todo: todoWithDueDate }
    })

    expect(wrapper.text()).toContain('25 дек.')
  })

  it('shows overdue styling for overdue todos', () => {
    const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    const overdueTodo = createMockTodo({
      dueDate: overdueDate,
      completed: false
    })
    const wrapper = mount(TodoItem, {
      props: { todo: overdueTodo }
    })

    const dateElement = wrapper.find('.text-red-500')
    expect(dateElement.exists()).toBe(true)
  })
})