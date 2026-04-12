import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type MaybeElementRef = {
  value?: any
}

type UseRelativeHeightOptions = {
  minHeight?: number
  offset?: number
}

const resolveElement = (target?: MaybeElementRef | any) => {
  const el = target?.value ?? target
  if (!el) return null
  if (el instanceof HTMLElement) return el
  if (el.$el instanceof HTMLElement) return el.$el
  return null
}

export function useRelativeHeight(
  anchorRef: MaybeElementRef,
  boundaryRef?: MaybeElementRef,
  options: UseRelativeHeightOptions = {},
) {
  const { minHeight = 240, offset = 0 } = options
  const height = ref(minHeight)
  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  const updateHeight = async () => {
    await nextTick()

    const anchorEl = resolveElement(anchorRef)
    const boundaryEl = resolveElement(boundaryRef)

    if (!anchorEl) return

    const anchorRect = anchorEl.getBoundingClientRect()
    const boundaryBottom = boundaryEl
      ? boundaryEl.getBoundingClientRect().bottom - (parseFloat(window.getComputedStyle(boundaryEl).paddingBottom) || 0)
      : window.innerHeight

    height.value = Math.max(boundaryBottom - anchorRect.top - offset, minHeight)
  }

  const scheduleUpdate = () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null
      updateHeight()
    })
  }

  const observe = () => {
    resizeObserver?.disconnect()

    if (typeof ResizeObserver === 'undefined') return

    const boundaryEl = resolveElement(boundaryRef)
    if (!boundaryEl) return

    resizeObserver = new ResizeObserver(() => {
      scheduleUpdate()
    })
    resizeObserver.observe(boundaryEl)
  }

  onMounted(() => {
    scheduleUpdate()
    observe()
    window.addEventListener('resize', scheduleUpdate)
  })

  watch(
    () => [anchorRef?.value, boundaryRef?.value],
    () => {
      scheduleUpdate()
      observe()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
    }
    resizeObserver?.disconnect()
    window.removeEventListener('resize', scheduleUpdate)
  })

  return {
    height,
    updateHeight: scheduleUpdate,
  }
}
