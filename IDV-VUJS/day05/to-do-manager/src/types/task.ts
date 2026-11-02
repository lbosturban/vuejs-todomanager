export enum Status {
  Todo = 'to do',
  InProgress = 'in progress',
  Done = 'done',
}

export interface Task {
  id: number
  title: string
  status: Status
}

export type TaskFilter = Status | 'all'
