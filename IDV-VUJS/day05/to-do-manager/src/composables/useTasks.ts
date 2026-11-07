import { computed, ref, watch } from 'vue'
import {
	Priority,
	Status,
       	type Task,
	type TaskFilter,
	type TaskList,
} from '../types/task'

const STORAGE_KEY = 'code2work-tasks'
const TASK_LISTS_STORAGE_KEY = 'code2work-tasklists'

function isStatus(value: unknown): value is Status {
  return Object.values(Status).includes(value as Status)
}

function isPriority(value: unknown): value is Priority {
  return Object.values(Priority).includes(value as Priority)
}

function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) =>
        typeof item?.id === 'number' &&
        typeof item?.title === 'string' &&
        isStatus(item?.status),
      )
      .map((item, index) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: isPriority(item.priority) ? item.priority : Priority.Medium,
        taskListId: typeof item.taskListId === 'number' ? item.taskListId : null,
        order: typeof item.order === 'number' ? item.order : index,
      }))
  } catch {
    return []
  }
}

function loadTaskLists(): TaskList[] {
  try {
    const saved = localStorage.getItem(TASK_LISTS_STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) =>
        typeof item?.id === 'number' &&
        typeof item?.name === 'string',
      )
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        order: typeof item.order === 'number' ? item.order : index,
      }))
  } catch {
    return []
  }
}

export function useTasks() {
  const tasks = ref<Task[]>(loadTasks())
  const taskLists = ref<TaskList[]>(loadTaskLists())
  const filter = ref<TaskFilter>('all')

  watch(
    tasks,
    (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
    { deep: true },
  )

  watch(
    taskLists,
    (value) => localStorage.setItem(TASK_LISTS_STORAGE_KEY, JSON.stringify(value)),
    { deep: true },
  )

  const filteredTasks = computed(() =>
    filter.value === 'all'
      ? tasks.value
      : tasks.value.filter((task) => task.status === filter.value),
  )

  function addTask(
    title: string,
    priority: Priority = Priority.Medium,
    taskListId: number | null = null,
  ) {
    const cleanedTitle = title.trim()
    if (!cleanedTitle) return

    const id = tasks.value.length
      ? Math.max(...tasks.value.map((task) => task.id)) + 1
      : 1

    tasks.value.push({
      id,
      title: cleanedTitle,
      status: Status.Todo,
      priority,
      taskListId,
      order: tasks.value.length,
    })
  }

  function deleteTask(id: number) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  function updateTask(
    id: number,
    changes: Partial<Pick<Task, 'title' | 'status' | 'priority' | 'taskListId'>>
  ) {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return

    if (changes.title !== undefined && changes.title.trim()) {
      task.title = changes.title.trim()
    }
    if (changes.status !== undefined) task.status = changes.status
    if (changes.priority !== undefined) task.priority = changes.priority
    if (changes.taskListId !== undefined) task.taskListId = changes.taskListId
  }

  function reorderTasks(draggedId: number, targetId: number) {
    if (draggedId === targetId) return

    const ordered = [...tasks.value].sort((a, b) => a.order - b.order)
    const fromIndex = ordered.findIndex((task) => task.id === draggedId)
    const toIndex = ordered.findIndex((task) => task.id === targetId)
    if (fromIndex < 0 || toIndex < 0) return

    const [moved] = ordered.splice(fromIndex, 1)
    ordered.splice(toIndex, 0, moved)
    ordered.forEach((task, index) => {
      task.order = index
    })
  }

  function addTaskList(name: string) {
    const cleanedName = name.trim()
    if (!cleanedName) return

    const id = taskLists.value.length
      ? Math.max(...taskLists.value.map((list) => list.id)) + 1
      : 1

    taskLists.value.push({
      id,
      name: cleanedName,
      order: taskLists.value.length,
    })
  }

  function renameTaskList(id: number) {
    const list = taskLists.value.find((item) => item.id === id)
    if (!list) return

    const name = window.prompt('Modifier le nom du projet', list.name)?.trim()
    if (name) list.name = name
  }

  function deleteTaskList(id: number) {
    const list = taskLists.value.find((item) => item.id === id)
    if (!list) return

    const confirmed = window.confirm(
      `Supprimer le projet « ${list.name} » ? Les tâches resteront disponibles sans projet.`)
    if (!confirmed) return

    taskLists.value = taskLists.value.filter((item) => item.id !== id)
    tasks.value.forEach((task) => {
      if (task.taskListId === id) task.taskListId = null
    })
  }

  function reorderTaskLists(draggedId: number, targetId: number) {
    if (draggedId === targetId) return

    const ordered = [...taskLists.value].sort((a, b) => a.order - b.order)
    const fromIndex = ordered.findIndex((list) => list.id === draggedId)
    const toIndex = ordered.findIndex((list) => list.id === targetId)
    if (fromIndex < 0 || toIndex < 0) return

    const [moved] = ordered.splice(fromIndex, 1)
    ordered.splice(toIndex, 0, moved)
    ordered.forEach((list, index) => {
      list.order = index
    })
  }

  return {
    tasks,
    taskLists,
    filter,
    filteredTasks,
    addTask,
    deleteTask,
    updateTask,
    reorderTasks,
    addTaskList,
    renameTaskList,
    deleteTaskList,
    reorderTaskLists,
  }
}
