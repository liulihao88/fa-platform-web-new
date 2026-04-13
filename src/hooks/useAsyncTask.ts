import { ref } from 'vue'

export function useAsyncTask(initialLoading = false) {
  const loading = ref(initialLoading)
  const error = ref<unknown>(null)

  const run = async <T>(task: () => Promise<T>) => {
    loading.value = true
    error.value = null
    try {
      return await task()
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    run,
  }
}
