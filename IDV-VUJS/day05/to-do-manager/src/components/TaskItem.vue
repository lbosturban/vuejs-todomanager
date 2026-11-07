<script setup lang="ts">
    import { Priority, Status, type Task, type TaskList } from '../types/task'

    defineProps<{
      task: Task
      taskLists: TaskList[]
    }>()

    const emit = defineEmits<{
      update: [
        id: number,
        changes: Partial<Pick<Task, 'title' | 'status' | 'priority' | 'taskListId'>>,
      ]
      delete: [id: number]
      reorder: [draggedId: number, targetId: number]
    }>()

    let draggedTaskId: number | null = null

    function editTitle(task: Task) {
      const title = window.prompt('Modifier le titre de la tâche', task.title)
      if (title === null) return

      if (!title.trim()) {
        window.alert('Le titre ne peut pas être vide.')
        return
      }

      emit('update', task.id, { title })
    }

    function handleStatusChange(id: number, event: Event) {
      const select = event.target as HTMLSelectElement
      emit('update', id, { status: select.value as Status })
    }

    function handlePriorityChange(id: number, event: Event) {
      const select = event.target as HTMLSelectElement
      emit('update', id, { priority: select.value as Priority })
    }

    function handleTaskListChange(id: number, event: Event) {
      const select = event.target as HTMLSelectElement
      emit('update', id, {
        taskListId: select.value ? Number(select.value) : null,
      })
    }

    function handleDragStart(event: DragEvent, id: number) {
        event.dataTransfer?.setData('text/plain', String(id))
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    }

    function handleDrop(event: DragEvent, targetId: number) {
        const draggedId = Number(event.dataTransfer?.getData('text/plain'))
        if (Number.isInteger(draggedId)) {
            emit('reorder', draggedId, targetId)
        }
    }
</script>

<template>
  <li
    class="task-item"
    draggable="true"
    @dragstart="handleDragStart($event, task.id)"
    @dragover.prevent
    @drop.prevent="handleDrop($event, task.id)"
    @dragend="draggedTaskId = null"
  >
    <div class="task-main">
      <span class="drag-handle" aria-hidden="true" title="Glisser pour réordonner">⠿</span>
      <span
        class="task-indicator"
        :class="`indicator-${task.status.replace(' ', '-')}`"
        aria-hidden="true"
      />
      <div>
        <span class="task-title" :class="{ completed: task.status === Status.Done }">
          {{ task.title }}
        </span>
        <span class="task-meta">
          {{ taskLists.find((list) => list.id === task.taskListId)?.name ?? 'Sans projet' }}
          · Priorité {{ task.priority === Priority.High ? 'haute' : task.priority === Priority.Medium ? 'moyenne' : task.priority === Priority.Low ? 'basse' : 'aucune' }}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <label class="sr-only" :for="`status-${task.id}`">Statut de {{ task.title }}</label>
      <select
        :id="`status-${task.id}`"
        :value="task.status"
        @change="handleStatusChange(task.id, $event)"
      >
        <option :value="Status.Todo">À faire</option>
        <option :value="Status.InProgress">En cours</option>
        <option :value="Status.Done">Terminée</option>
      </select>

      <label class="sr-only" :for="`priority-${task.id}`">Priorité de {{ task.title }}</label>
      <select
        :id="`priority-${task.id}`"
        :value="task.priority"
        @change="handlePriorityChange(task.id, $event)"
      >
        <option :value="Priority.None">Aucune</option>
        <option :value="Priority.Low">Basse</option>
        <option :value="Priority.Medium">Moyenne</option>
        <option :value="Priority.High">Haute</option>
      </select>

      <label class="sr-only" :for="`project-${task.id}`">Projet de {{ task.title }}</label>
      <select
        :id="`project-${task.id}`"
        :value="task.taskListId ?? ''"
        @change="handleTaskListChange(task.id, $event)"
      >
        <option value="">Sans projet associé</option>
        <option v-for="list in taskLists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>

      <button
        class="icon-button"
        type="button"
        :aria-label="`Modifier ${task.title}`"
        @click="editTitle(task)"
      >
        Modifier
      </button>
      <button
        class="icon-button delete-button"
        type="button"
        :aria-label="`Supprimer ${task.title}`"
        @click="emit('delete', task.id)"
      >
        Supprimer
      </button>
    </div>
  </li>
</template>
