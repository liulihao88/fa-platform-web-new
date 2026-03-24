<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    top?: string
    right?: string
    size?: string
    zIndex?: number
    position?: 'absolute' | 'fixed'
    onClick?: () => void
  }>(),
  {
    top: '16px',
    right: '16px',
    size: '28px',
    zIndex: 1000,
    position: 'absolute',
    onClick: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
  props.onClick?.()
}
</script>

<template>
  <div
    class="g-close"
    :style="{
      position: props.position,
      top: props.top,
      right: props.right,
      width: props.size,
      height: props.size,
      zIndex: props.zIndex,
    }"
    @click="handleClick"
  >
    <slot>
      <span class="g-close__icon">×</span>
    </slot>
  </div>
</template>

<style scoped>
.g-close {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  user-select: none;
  background: rgb(0 0 0 / 65%);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.g-close:hover {
  background: rgb(0 0 0 / 80%);
  transform: scale(1.05);
}

.g-close__icon {
  font-size: 16px;
  line-height: 1;
}
</style>
