import { computed, onUnmounted, ref } from 'vue'

type PollingCallback = () => void | Promise<void>

export function usePolling(callback: PollingCallback, interval = 15000) {
  const timer = ref<number | null>(null)
  const isRunning = computed(() => timer.value !== null)
  const isExecuting = ref(false)

  const clear = () => {
    if (timer.value !== null) {
      window.clearInterval(timer.value)
      timer.value = null
    }
  }

  const execute = async () => {
    if (isExecuting.value) return

    isExecuting.value = true
    try {
      await callback()
    } finally {
      isExecuting.value = false
    }
  }

  const start = () => {
    if (timer.value !== null) return

    timer.value = window.setInterval(() => {
      execute()
    }, interval)
  }

  const stop = () => {
    clear()
  }

  const restart = () => {
    clear()
    start()
  }

  onUnmounted(() => {
    clear()
  })

  return {
    isRunning,
    isExecuting,
    start,
    stop,
    restart,
    execute,
  }
}
