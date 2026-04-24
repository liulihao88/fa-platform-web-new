import { onBeforeUnmount, ref, unref, type Ref } from 'vue'

export function useWatermark(appendEl: Ref<HTMLElement | null> = ref(document.body) as Ref<HTMLElement | null>) {
  const watermarkEl = ref<HTMLElement | null>(null)

  function createBase64(text: string) {
    const canvas = document.createElement('canvas')
    const width = 300
    const height = 240

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return ''

    context.rotate((-20 * Math.PI) / 180)
    context.font = '15px Verdana'
    context.fillStyle = 'rgba(0, 0, 0, 0.15)'
    context.textAlign = 'left'
    context.textBaseline = 'middle'
    context.fillText(text, width / 10, height / 2)

    return canvas.toDataURL('image/png')
  }

  function ensureWatermarkEl() {
    if (watermarkEl.value) return watermarkEl.value

    const container = unref(appendEl)
    if (!container) return null

    const div = document.createElement('div')
    div.setAttribute('data-global-watermark', 'true')
    div.style.pointerEvents = 'none'
    div.style.position = 'fixed'
    div.style.inset = '0'
    div.style.zIndex = '100000'
    div.style.backgroundRepeat = 'repeat'
    div.style.backgroundPosition = 'left top'

    container.appendChild(div)
    watermarkEl.value = div
    return div
  }

  function setWatermark(text: string) {
    const el = ensureWatermarkEl()
    if (!el) return

    el.style.backgroundImage = `url(${createBase64(text)})`
  }

  function clear() {
    const container = unref(appendEl)
    if (!container || !watermarkEl.value) return

    container.removeChild(watermarkEl.value)
    watermarkEl.value = null
  }

  onBeforeUnmount(() => {
    clear()
  })

  return {
    setWatermark,
    clear,
  }
}
