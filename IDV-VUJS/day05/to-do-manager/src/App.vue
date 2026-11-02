<script setup lang="ts">
    import { ref } from 'vue'
    import AppFooter from './components/AppFooter.vue'
    import AppHeader from './components/AppHeader.vue'
    import TaskForm from './components/TaskForm.vue'
    import TaskItem from './components/TaskItem.vue'
    import { useTasks } from './composables/useTasks'
    import { Status } from './types/task'

    const { tasks, filter, filteredTasks,
            addTask, deleteTask, updateTask } = useTasks()

    const filters = [
        { value: 'all', label: 'Toutes' },
        { value: Status.Todo, label: 'À faire' },
        { value: Status.InProgress, label: 'En cours' },
        { value: Status.Done, label: 'Terminées' },
    ] as const

    const no_task_in_filter: string = ref("Aucune tâche dans ce filtre.")
    const no_task_at_all: string = ref("Pas de tâches: Ajoutez une tâche!")

</script>

<template>
  <div class="page-shell">
    <AppHeader />

    <main class="main-content">
      <section class="intro" aria-labelledby="page-title">
        <p class="eyebrow">VOTRE ESPACE DE TRAVAIL</p>
        <h1 id="page-title">Les petites étapes font<br />
		les grandes avancées<span>.</span></h1>
        <p class="intro-copy">Organisez vos idées et gardez le cap sur ce qui compte.</p>
      </section>

      <section class="board" aria-label="Gestion des tâches">
        <TaskForm @add="addTask" />

        <div class="list-heading">
          <div>
            <h2>Vos tâches</h2>
            <span class="task-count">{{ tasks.length }} au total</span>
          </div>
          <label class="sr-only" for="task-filter">Filtrer les tâches</label>
          <select id="task-filter" v-model="filter" class="filter-select">
            <option v-for="item in filters" :key="item.value"
	            :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>

        <ul v-if="filteredTasks.length" class="task-list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @update="updateTask"
            @delete="deleteTask"
          />
        </ul>
        <p v-else class="empty-state">
          {{ tasks.length ? no_task_in_filter : no_task_at_all }}
        </p>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped></style>
