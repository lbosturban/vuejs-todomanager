<script setup lang="ts">
    import { Status } from '../types/task';

    defineProps<{
      currentFilter: string
    }>();

    const emit = defineEmits<{
        (e: 'updateFilter', filter: string): void
    }>();

    const filters = ['all', Status.TODO, Status.IN_PROGRESS, Status.DONE];
</script>

<template>
  <div class="filter-container" role="group" aria-label="Filter by status">
    <button
      v-for="filter in filters"
      :key="filter"
      :class="{ active: currentFilter === filter }"
      :aria-pressed="currentFilter === filter"
      @click="emit('updateFilter', filter)"
    >
      {{ filter.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.filter-container {
  display: flex;
  gap: 0.5rem;
  margin: 1.5rem 0;
}
button {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
}
button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
</style>

