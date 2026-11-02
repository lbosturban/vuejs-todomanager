<script setup lang="ts">
    import { ref, computed, watch, onMounted } from 'vue';
    import { type Task, Status } from './types/task';
    import AppHeader from './components/AppHeader.vue';
    import AppFooter from './components/AppFooter.vue';
    import TaskForm from './components/TaskForm.vue';
    import TaskFilter from './components/TaskFilter.vue';
    import TaskItem from './components/TaskItem.vue';

    const tasks = ref<Task[]>([]);
    const currentFilter = ref<string>('all');
    // Lifecycle: client-side offline persistence mapping
    //(localStorage validation context)
    onMounted(() => {
        const storedTasks = localStorage.getItem('code2work_tasks');
        if (storedTasks) {
            try {
                tasks.value = JSON.parse(storedTasks);
            } catch (e) {
                console.error("Failed parsing tasks from localStorage, initializing empty registry.");
                tasks.value = [];
            }
        }
    });

    // Watch reactive structural tree mutations for structural alignment
    watch(tasks, (newTasks) => {
        localStorage.setItem('code2work_tasks', JSON.stringify(newTasks));
    }, { deep: true });

    // Actions
    const addTask = (title: string) => {
        const newTask: Task = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            title,
            status: Status.TODO
        };
        tasks.value.push(newTask);
    };

    const updateStatus = (id: string, status: Status) => {
        const task = tasks.value.find(t => t.id === id);
	if (task) {
	    task.status = status;
	}
    };

    const updateTitle = (id: string, title: string) => {
        const task = tasks.value.find(t => t.id === id);
        if (task) {
	    task.title = title;
	}
    };

    const deleteTask = (id: string) => {
        tasks.value = tasks.value.filter(t => t.id !== id);
    };

    const updateFilter = (filter: string) => {
        currentFilter.value = filter;
    };

    // Computed state pipeline transformation
    const filteredTasks = computed(() => {
        if (currentFilter.value === 'all') {
            return tasks.value;
        }
        return tasks.value.filter(t => t.status === currentFilter.value);
    });
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="main-content" role="main">
      <TaskForm @add-task="addTask" />
      
      <TaskFilter :current-filter="currentFilter"
          @update-filter="updateFilter" />

      <section aria-labelledby="list-title">
        <h2 id="list-title" class="section-readonly">Task tracking board</h2>
        <div v-if="filteredTasks.length === 0"
	    class="empty-state" role="status">No tasks found matching your filter criteria. Add a task to start tracking!</div>
        <ul v-else class="task-list" role="list">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @update-status="updateStatus"
            @update-title="updateTitle"
            @delete-task="deleteTask"
          />
        </ul>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
  box-sizing: border-box;
}
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--card-bg);
  border-radius: 8px;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
}
.section-readonly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
