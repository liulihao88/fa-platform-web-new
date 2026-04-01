<template>
    <div class="flex w-full h-full relative bg-white" :class="{ 'flex-col': splitSet.split === 'horizontal' }">
        <div class="overflow-hidden transition-all duration-100 ease-out" ref="paneLeftRef"
            :style="{ flexBasis: `${currentPercent}%` }" :class="{
                'min-w-[5%] max-w-[95%]': splitSet.split === 'vertical',
                'min-h-[5%] max-h-[95%]': splitSet.split === 'horizontal',
            }">
            <slot name="paneL"></slot>
        </div>
        <div ref="resizerRef" @mousedown="startResize" @touchstart="startResize" :class="{
            'w-1.5 bg-gray-200 cursor-col-resize': splitSet.split === 'vertical',
            'h-1.5 w-full bg-gray-200 cursor-row-resize': splitSet.split === 'horizontal',
        }" class="user-select-none transition-colors duration-200"></div>
        <div class="flex-1 overflow-hidden transition-all duration-100 ease-out" :class="{
            'min-w-[5%] max-w-[95%]': splitSet.split === 'vertical',
            'min-h-[5%] max-h-[95%]': splitSet.split === 'horizontal',
        }">
            <slot name="paneR"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface ContextProps {
    minPercent: number
    defaultPercent: number
    split: 'vertical' | 'horizontal'
}

const props = defineProps<{
    splitSet: ContextProps
}>()

const currentPercent = ref(props.splitSet.defaultPercent)
const paneLeftRef = ref<HTMLElement | null>(null)
const resizerRef = ref<HTMLElement | null>(null)
const isResizing = ref(false)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

function startResize(e: MouseEvent | TouchEvent) {
    isResizing.value = true

    if (e instanceof MouseEvent) {
        startX.value = e.clientX
        startY.value = e.clientY
    } else if (e instanceof TouchEvent) {
        startX.value = e.touches[0].clientX
        startY.value = e.touches[0].clientY
    }

    if (paneLeftRef.value) {
        const rect = paneLeftRef.value.getBoundingClientRect()
        startWidth.value = rect.width
        startHeight.value = rect.height
    }

    document.addEventListener('mousemove', resize)
    document.addEventListener('touchmove', resize)
    document.addEventListener('mouseup', stopResize)
    document.addEventListener('touchend', stopResize)

    e.preventDefault()
}

function resize(e: MouseEvent | TouchEvent) {
    if (!isResizing.value || !paneLeftRef.value || !resizerRef.value) return

    let clientX = 0
    let clientY = 0

    if (e instanceof MouseEvent) {
        clientX = e.clientX
        clientY = e.clientY
    } else if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
    }

    // 使用 requestAnimationFrame 优化重绘
    requestAnimationFrame(() => {
        const container = paneLeftRef.value?.parentElement
        if (!container) return

        const containerRect = container.getBoundingClientRect()

        if (props.splitSet.split === 'vertical') {
            const deltaX = clientX - startX.value
            const newWidth = startWidth.value + deltaX
            const newPercent = (newWidth / containerRect.width) * 100

            if (newPercent >= props.splitSet.minPercent && newPercent <= 100 - props.splitSet.minPercent) {
                currentPercent.value = newPercent
            }
        } else {
            const deltaY = clientY - startY.value
            const newHeight = startHeight.value + deltaY
            const newPercent = (newHeight / containerRect.height) * 100

            if (newPercent >= props.splitSet.minPercent && newPercent <= 100 - props.splitSet.minPercent) {
                currentPercent.value = newPercent
            }
        }
    })
}

function stopResize() {
    isResizing.value = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('touchmove', resize)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('touchend', stopResize)
}

watch(
    () => props.splitSet.defaultPercent,
    (newPercent) => {
        currentPercent.value = newPercent
    },
)

onMounted(() => {
    currentPercent.value = props.splitSet.defaultPercent
})

onUnmounted(() => {
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('touchmove', resize)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('touchend', stopResize)
})
</script>

<style scoped></style>
