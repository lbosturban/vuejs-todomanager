<script setup lang="ts">
    import { computed, ref } from 'vue'
    import { Priority, type TaskList } from '../types/task'

    const props = defineProps<{
        taskLists: TaskList[]
    }>()

    const emit = defineEmits<{
        add: [title: string, priority: Priority, taskListName: string]
    }>()

    const title = ref('');
    const priority = ref<Priority>(Priority.None);
    const taskListName = ref('')
    const error = ref('');

    const projectMenuOpen = ref(false)
    const selectedProjectId = ref<number | null>(null)

    function normalizeName(name: string): string {
      return name.trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('fr')
        .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('fr'));
    }

    const matchingProjects = computed(() => {
        const query = taskListName.value.trim().toLocaleLowerCase('fr')
        return props.taskLists.filter((list) =>
            list.name.toLocaleLowerCase('fr').includes(query))
    })

    function handleProjectInput() {
        selectedProjectId.value = null
        projectMenuOpen.value = true
    }

    function selectProject(list: TaskList) {
        taskListName.value = list.name
        selectedProjectId.value = list.id
        projectMenuOpen.value = false
    }

    function submit() {
        const trimTitle = title.value.trim();

        if (!trimTitle) {
            error.value = 'Veuillez saisir un titre de tâche.';
            return;
        }
	const cleanedTitle = normalizeName(trimTitle)

        const cleanedListName = taskListName.value
	                                    .trim()
					    .replace(/\s+/g, ' ')
					    .toLocaleLowerCase('fr')
					    .replace(/^\p{L}/u,
                    (letter) => letter.toLocaleUpperCase('fr'));
	if (cleanedListName) {
	    const existingList =
	        props.taskLists.find(
	            (list) => normalizeName(list.name) === normalizeName(cleanedListName));
            if (existingList
	        && selectedProjectId.value !== existingList.id
		&& !window.confirm(
        `Le projet « ${existingList.name} » existe déjà. Voulez-vous ajouter cette tâche à ce projet ?`)
                ) {
                return
            }
        }

        emit('add', cleanedTitle, priority.value, cleanedListName);
        title.value = '';
	taskListName.value = '';
	selectedProjectId.value = null;
	priority.value = Priority.None;
        error.value = '';
    }
</script>

<template>
  <form class="task-form" @submit.prevent="submit" novalidate>
    <label for="task-title">Ajouter une tâche</label>

    <div class="form-row">
      <input
        id="task-title"
        v-model="title"
        type="text"
        placeholder="Saisissez une tâche."
        :aria-describedby="error ? 'title-error' : undefined"
        :aria-invalid="Boolean(error)"
        @input="error = ''"
      />
      <button class="primary-button" type="submit">
        Ajouter <span aria-hidden="true">＋</span>
      </button>
    </div>

    <div class="task-form-options">
      <label>
        Priorité
        <select v-model="priority">
	  <option :value="Priority.None">Aucune</option>
          <option :value="Priority.Low">Basse</option>
          <option :value="Priority.Medium">Moyenne</option>
          <option :value="Priority.High">Haute</option>
        </select>
      </label>

      <label for="task-project">
        Projet
	<div class="project-picker">
          <input
            id="task-project"
            v-model="taskListName"
            type="text"
            autocomplete="off"
            placeholder="Aucun projet"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="projectMenuOpen && matchingProjects.length > 0"
            @focus="projectMenuOpen = true"
            @input="handleProjectInput"
            @blur="projectMenuOpen = false"
          />

          <ul
            v-if="projectMenuOpen && matchingProjects.length"
            class="project-options"
            role="listbox"
          >
            <li v-for="list in matchingProjects" :key="list.id" role="option">
              <button
                type="button"
                @mousedown.prevent="selectProject(list)"
              >
                {{ list.name }}
              </button>
            </li>
          </ul>
        </div>
        <datalist id="task-project-suggestions">
          <option v-for="list in taskLists" :key="list.id" :value="list.name" />
        </datalist>
      </label>
    </div>

    <p v-if="error" id="title-error" class="error" role="alert">{{ error }}</p>
  </form>
</template>
