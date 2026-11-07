<script setup lang="ts">
    import { Status, type Task } from '../types/task'

    defineProps<{ task: Task }>()

    const emit = defineEmits<{
        update: [id: number, changes: Partial<Pick<Task, 'title' | 'status'>>]
        delete: [id: number]
    }>()

    function editTitle(task: Task) {
        const title = window.prompt('Modifier le titre de la tâche', task.title)
        if (title === null) {
            return;
        }

        if (!title.trim()) {
            window.alert('Le titre ne peut pas être vide.');
            return;
        }

        emit('update', task.id, { title })
    }

    function handleStatusChange(id: number, event: Event) {
        const select = event.target as HTMLSelectElement
        emit('update', id, { status: select.value as Status })
    }

</script>

<template>
  <li class="task-item">
    <div class="task-main">
      <span class="task-indicator" :class="`indicator-${task.status.replace(' ', '-')}`" aria-hidden="true"></span>
      <span class="task-title" :class="{ completed: task.status === Status.Done }">
        {{ task.title }}
      </span>
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
      <button class="icon-button" type="button" :aria-label="`Modifier ${task.title}`" @click="editTitle(task)">
        Modifier
      </button>
      <button class="icon-button delete-button" type="button" :aria-label="`Supprimer ${task.title}`" @click="emit('delete', task.id)">
        Supprimer
      </button>
    </div>
  </li>
</template>
