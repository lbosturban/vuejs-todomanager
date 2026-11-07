<script setup lang="ts">
    import { computed, ref } from 'vue'
    import AppFooter from './components/AppFooter.vue'
    import AppHeader from './components/AppHeader.vue'
    import TaskForm from './components/TaskForm.vue'
    import TaskItem from './components/TaskItem.vue'
    import { useTasks } from './composables/useTasks'
    import { Priority,  Status, type Task, type TaskSort } from './types/task'

    const {
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
    } = useTasks()

    const activeTab = ref<'tasks' | 'projects'>('tasks')
    const taskSort = ref<TaskSort>('manual')
    const newTaskListName = ref('')
    const taskListError = ref('')

    const filters = [
        { value: 'all', label: 'Toutes' },
        { value: Status.Todo, label: 'À faire' },
        { value: Status.InProgress, label: 'En cours' },
        { value: Status.Done, label: 'Terminées' },
    ] as const

    const sortedTasks = computed(() => {
      const result = [...filteredTasks.value]

      if (taskSort.value === 'alphabetical') {
        return result.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
      }

      if (taskSort.value === 'priority') {
        const priorityOrder: Record<Priority, number> = {
          [Priority.None]: 0,
          [Priority.High]: 1,
          [Priority.Medium]: 2,
          [Priority.Low]: 3,
        }
        return result.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.order - b.order
	)
      }

      return result.sort((a, b) => a.order - b.order)
    })

    const sortedTaskLists = computed(() =>
      [...taskLists.value].sort((a, b) => a.order - b.order)
    )

    function normalizeName(name: string): string {
      return name.trim()
                 .replace(/\s+/g, ' ')
                 .toLocaleLowerCase('fr')
                 .replace(/\b\p{L}/gu,
		     (letter) => letter.toLocaleUpperCase('fr'));
    }

    function handleAddTask(title: string,
                           priority: Priority,
			   taskListName: string) {
        let taskListId: number | null = null

        if (taskListName) {
	    const normalizedName = normalizeName(taskListName);
            let taskList = taskLists.value.find(
	        (list) => normalizeName(list.name) === normalizedName);

            if (!taskList) {
                addTaskList(normalizedName);
                taskList = taskLists.value[taskLists.value.length - 1];
            }

            taskListId = taskList.id;
        }

        addTask(title, priority, taskListId);
    }

    function createTaskList() {
      if (!newTaskListName.value.trim()) {
        taskListError.value = 'Veuillez saisir un nom de projet.'
        return
      }

      addTaskList(newTaskListName.value)
      newTaskListName.value = ''
      taskListError.value = ''
    }

    let draggedTaskListId: number | null = null
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

      <section class="board" aria-label="Gestion des tâches et projets">
        <div class="tabs" role="tablist" aria-label="Espace de travail">
          <button
            id="tasks-tab"
            class="tab-button"
            :class="{ active: activeTab === 'tasks' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'tasks'"
            aria-controls="tasks-panel"
            @click="activeTab = 'tasks'"
          >
            Tâches
          </button>
          <button
            id="projects-tab"
            class="tab-button"
            :class="{ active: activeTab === 'projects' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'projects'"
            aria-controls="projects-panel"
            @click="activeTab = 'projects'"
          >
            Projets
          </button>
        </div>

        <div v-if="activeTab === 'tasks'" id="tasks-panel" role="tabpanel" aria-labelledby="tasks-tab">
          <TaskForm :task-lists="taskLists" @add="handleAddTask" />

          <div class="list-heading">
            <div>
              <h2>Vos tâches</h2>
              <span class="task-count">{{ tasks.length }} au total</span>
            </div>
            <div class="list-controls">
	      <label class="control-label" for="task-filter">
		Filtrer les tâches: voir
	        <select id="task-filter" v-model="filter" class="filter-select">
                  <option v-for="item in filters" :key="item.value" :value="item.value">
		  {{ item.label }}
		  </option>
		</select>
	      </label>

	      <label class="control-label" for="task-sort">
                Trier les tâches par
		<select id="task-sort" v-model="taskSort" class="filter-select">
		  <option value="manual">Ordre manuel</option>
		  <option value="priority">Ordre de Priorité</option>
		  <option value="alphabetical">Ordre alphabétique</option>
		</select>
	      </label>
            </div>
          </div>
          <div class="task-count">Glissez pour réordonner</div>

          <ul v-if="sortedTasks.length" class="task-list">
            <TaskItem
              v-for="task in sortedTasks"
              :key="task.id"
              :task="task"
              :task-lists="taskLists"
              @update="updateTask"
              @delete="deleteTask"
              @reorder="reorderTasks"
            />
          </ul>
          <p v-else class="empty-state">
            {{ tasks.length ? 'Aucune tâche dans ce filtre.' : 'Pas de tâches : ajoutez une tâche !' }}
          </p>
        </div>

        <div
          v-else
          id="projects-panel"
          role="tabpanel"
          aria-labelledby="projects-tab"
        >
          <form class="project-form" @submit.prevent="createTaskList" novalidate>
            <label for="project-name">Créer un projet</label>
            <div class="form-row">
              <input
                id="project-name"
                v-model="newTaskListName"
                type="text"
                placeholder="Nom du projet"
                :aria-invalid="Boolean(taskListError)"
                @input="taskListError = ''"
              />
              <button class="primary-button" type="submit">Ajouter le projet</button>
            </div>
            <p v-if="taskListError" class="error" role="alert">{{ taskListError }}</p>
          </form>

          <div class="list-heading">
            <div>
              <h2>Vos projets</h2>
              <span class="task-count">{{ taskLists.length }} au total</span>
            </div>
          </div>
          <div class="task-count">Glissez pour réordonner</div>

          <ul v-if="sortedTaskLists.length" class="project-list">
            <li
              v-for="list in sortedTaskLists"
              :key="list.id"
              class="project-item"
              draggable="true"
              @dragstart="draggedTaskListId = list.id"
              @dragover.prevent
              @drop.prevent="draggedTaskListId !== null && reorderTaskLists(draggedTaskListId, list.id)"
              @dragend="draggedTaskListId = null"
            >
              <span class="drag-handle" aria-hidden="true">⠿</span>
              <div class="project-details">
                <strong>{{ list.name }}</strong>
                <span class="task-count">
                  {{ tasks.filter((task: Task) => task.taskListId === list.id).length }} tâches
                </span>
              </div>
              <button class="icon-button" type="button" @click="renameTaskList(list.id)">
                Renommer
              </button>
              <button
                class="icon-button delete-button"
                type="button"
                @click="deleteTaskList(list.id)"
              >
                Supprimer
              </button>
            </li>
          </ul>
          <p v-else class="empty-state">Aucun projet pour le moment.</p>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped></style>
