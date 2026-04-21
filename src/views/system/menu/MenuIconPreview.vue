<script setup lang="ts">
import { computed } from 'vue'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'

const props = withDefaults(
  defineProps<{
    icon?: string
    size?: number
  }>(),
  {
    icon: '',
    size: 18,
  },
)

const renderIcon = computed(() =>
  props.icon ? useRenderIcon(props.icon, { style: { fontSize: `${props.size}px` } }) : null,
)
</script>

<template>
  <div class="menu-icon-preview" :title="icon || '未设置图标'">
    <component :is="renderIcon" v-if="renderIcon" />
    <span v-else class="menu-icon-preview__empty">-</span>
  </div>
</template>

<style scoped lang="scss">
.menu-icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5em;
  min-height: 1.5em;
}

.menu-icon-preview__empty {
  line-height: 1;
  color: var(--el-text-color-placeholder);
}
</style>
