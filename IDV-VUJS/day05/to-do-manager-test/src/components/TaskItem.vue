<script setup lang="ts">
    import { ref, nextTick } from 'vue';
    import { type Task, Status } from '../types/task';

    const props = defineProps<{
        task: Task;
    }>();

    const emit = defineEmits<{
        (e: 'updateStatus', id: string, status: Status): void
        (e: 'updateTitle', id: string, title: string): void
        (e: 'deleteTask', id: string): void
    }>();

    const isEditing = ref(false);
    const editedTitle = ref(props.task.title);
    const editInput = ref<HTMLInputElement | null>(null);

    const startEdit = async () => {
        isEditing.value = true;
        await nextTick();
        editInput.value?.focus();
    };

    const saveEdit = () => {
        if (editedTitle.value.trim() && 
	    editedTitle.value.trim() !== props.task.title) {
            emit('updateTitle', props.task.id, editedTitle.value.trim());
        } else {
            editedTitle.value = props.task.title;
        }
        isEditing.value = false;
    };

    const cancelEdit = () => {
        editedTitle.value = props.task.title;
        isEditing.value = false;
    };

    const handleStatusChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        emit('updateStatus', props.task.id, target.value as Status);
    };

</script>

<template>
  <li class="task-item" :class="task.status.replace(' ', '-')" role="listitem">
    <div class="task-content">
      <!-- Bonus Title Editing Inline Layout -->
      <div v-if="isEditing" class="edit-wrapper">
        <input
          ref="editInput"
          v-model="editedTitle"
          type="text"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          aria-label="Edit task title"
        />
      </div>
      <span 
        v-else 
        class="task-title" 
        @dblclick="startEdit" 
        title="Double click to edit title"
        tabindex="0"
        @keyup.enter="startEdit"
      >
        {{ task.title }}
      </span>
    </div>

    <div class="task-actions">
      <!-- Status cycle / selector mapping requirement -->
      <label :for="'status-' + task.id" 
	      class="section-readonly">Change Status</label>
      <select
        :id="'status-' + task.id"
        :value="task.status"
        @change="handleStatusChange"
        aria-label="Status selection dropdown"
      >
        <option :value="Status.TODO">To Do:</option>
        <option :value="Status.IN_PROGRESS">In Progress...</option>
        <option :value="Status.DONE">Done!</option>
      </select>

      <button 
        @click="emit('deleteTask', task.id)" 
        class="delete-btn" 
        :aria-label="'Delete task: ' + task.title"
      >
        🗑️
      </button>
    </div>
  </li>
</template>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  border-left: 5px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.task-item.to-do {
  border-left-color: var(--warning-color);
}
.task-item.in-progress {
  border-left-color: var(--primary-color);
}
.task-item.done {
  border-left-color: var(--success-color); opacity: 0.7;
}
.task-item.done .task-title {
  text-decoration: line-through;
}
.task-content {
  flex: 1;
  margin-right: 1rem;
}
.task-title {
  cursor: pointer;
  display: block;
  font-weight: 500;
}
.edit-wrapper input {
  width: 100%;
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
select {
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background: white;
}
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.2rem;
}
.section-readonly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
</style>

