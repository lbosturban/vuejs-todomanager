export enum Status {
  Todo = 'to do',
  InProgress = 'in progress',
  Done = 'done',
}

export enum Priority {
  None = 'none',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface TaskList {
  id: number
  name: string
  order: number
}

export interface Task {
  id: number
  title: string
  status: Status
  priority: Priority
  taskListId: number | null
  order: number
}

export type TaskFilter = Status | 'all'
export type TaskSort = 'manual' | 'priority' | 'alphabetical'
