import { computed, ref, watch } from 'vue'
import { Status, type Task, type TaskFilter } from '../types/task'

const STORAGE_KEY = 'code2work-tasks'

function loadTasks(): Task[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) {
	    return [];
	}

        const parsed: unknown = JSON.parse(saved)
        if (!Array.isArray(parsed)) {
	    return [];
	}

        return parsed.filter((item): item is Task =>
            typeof item?.id === 'number' &&
            typeof item?.title === 'string' &&
            Object.values(Status).includes(item?.status))
    } catch {
        return [];
    }
}

export function useTasks() {
    const tasks = ref<Task[]>(loadTasks())
    const filter = ref<TaskFilter>('all')

    watch(tasks,
        (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
        { deep: true },
    )

    const filteredTasks = computed(() => filter.value === 'all'
        ? tasks.value
        : tasks.value.filter((task) => task.status === filter.value))

    function addTask(title: string) {
        const cleanedTitle = title.trim();
        if (!cleanedTitle) {
	    return;
	}

        const id = tasks.value.length > 0
        ? Math.max(...tasks.value.map((task) => task.id)) + 1
        : 1;

        tasks.value.push({ id, title: cleanedTitle, status: Status.Todo })
    }

    function deleteTask(id: number) {
        tasks.value = tasks.value.filter((task) => task.id !== id)
    }

    function updateTask(id: number,
		       	changes: Partial<Pick<Task, 'title' | 'status'>>) {
        const task = tasks.value.find((item) => item.id === id)
        if (!task) {
	    return;
	}

        if (changes.title !== undefined && changes.title.trim()) {
            task.title = changes.title.trim()
        }
        if (changes.status !== undefined) {
          task.status = changes.status
        }
    }

    return { tasks, filter, filteredTasks, addTask, deleteTask, updateTask }
}

