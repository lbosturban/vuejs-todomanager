<script setup lang="ts">
    import { ref } from 'vue';

    const emit = defineEmits<{
        (e: 'addTask', title: string): void
    }>();

    const taskTitle = ref('');
    const errorMessage = ref('');

    const handleSubmit = () => {
      // Client-side user input validation
        if (!taskTitle.value.trim()) {
            errorMessage.value = 'Task title cannot be empty.';
            return;
        }
  
        if (taskTitle.value.trim().length < 3) {
            errorMessage.value = 'Title must be more than 2 characters long.';
            return;
        }

	if (taskTitle.value.trim().length > 120) {
	    errorMessage.value = 'Title cannot exeed 128 characters long.';
	}

        emit('addTask', taskTitle.value.trim());
        taskTitle.value = '';
        errorMessage.value = '';
    };
</script>

<template>
  <section class="form-section" aria-labelledby="form-title">
    <h2 id="form-title" class="section-readonly">Create a new task</h2>
    <form @submit.prevent="handleSubmit" class="task-form" novalidate>
      <div class="input-group">
        <label for="task-input">New Task Title</label>
        <input
	  maxlength="128"
	  minlength="3"
          id="task-input"
          v-model="taskTitle"
          type="text"
          placeholder="Task Title Name"
          :aria-invalid="errorMessage ? 'true' : 'false'"
          aria-describedby="task-error"
        />
        <p v-if="errorMessage" id="task-error" class="error-message" role="alert">
          {{ errorMessage }}
        </p>
      </div>
      <button type="submit" aria-label="Add this task to the manager">Add Task</button>
    </form>
  </section>
</template>

<style scoped>
.task-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.input-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.input-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}
button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  height: 46px;
}
button:hover {
  background-color: var(--primary-hover);
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

