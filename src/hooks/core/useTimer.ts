/**
 * @example
import { useTimer } from '@/hooks/core/useTimer'
const {stop, start} = useTimer(init)
stop()
 */
import { ref, onUnmounted } from 'vue'

export function useTimer(callback: () => void, intervalTime: number = 3000) {
  const timer = ref<NodeJS.Timeout | null>(null)

  const start = () => {
    timer.value = setInterval(callback, intervalTime)
  }

  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  const restart = () => {
    stop()
    start()
  }

  // Start the timer when the hook is used
  start()

  // Stop the timer when the component is unmounted
  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
    restart,
  }
}
