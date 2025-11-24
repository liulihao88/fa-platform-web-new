<template>
  <div class="content-container" @mouseenter="checkOverflow" @mouseleave="hideTooltip">
    <div ref="textRef" class="text-content">
      {{ content }}
    </div>
    <div v-if="showTooltip" class="custom-tooltip">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
}>()

const textRef = ref<HTMLElement | null>(null)
const showTooltip = ref(false)

const checkOverflow = () => {
  if (textRef.value) {
    // 使用 offsetWidth 获取当前容器的实际宽度
    showTooltip.value = textRef.value.scrollWidth > textRef.value.offsetWidth
  }
}

const hideTooltip = () => {
  showTooltip.value = false
}
</script>

<style scoped>
.content-container {
  /* position: relative;  */
  flex: 1;
  overflow: hidden;
}

.text-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.custom-tooltip {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0; /* 添加右侧对齐 */
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: normal;
  word-wrap: break-word;
  max-width: calc(100vw - 20px);
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateX(-20px);
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
</style>
