<script setup lang="ts">
    import { ref } from 'vue'

    const emit = defineEmits<{
        add: [title: string]
    }>()

    const title = ref('')
    const error = ref('')

    function submit() {
        const cleaned = title.value.trim();

        if (!cleaned) {
            error.value = 'Veuillez saisir un titre de tâche.';
            return;
        }

        emit('add', cleaned)
        title.value = ''
        error.value = ''
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
      <button class="primary-button" type="submit">Ajouter <span aria-hidden="true">＋</span></button>
    </div>
    <p v-if="error" id="title-error" class="error" role="alert">{{ error }}</p>
  </form>
</template>
