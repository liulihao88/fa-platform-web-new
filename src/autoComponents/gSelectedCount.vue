<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number
    crossPage?: boolean
  }>(),
  {
    count: 0,
    crossPage: true,
  },
)

defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="g-selected-count">
    <span class="g-selected-count__icon">i</span>
    <template v-if="count">
      <span>
        已选中
        <span class="cl-blue">
          {{ count }}
        </span>
        条记录
        <span v-if="crossPage">(可跨页)</span>
      </span>
      <span class="g-selected-count__split">|</span>
      <span class="g-selected-count__clear" @click="$emit('clear')">清空</span>
    </template>
    <span v-else>未选中任何数据</span>
  </div>
</template>

<style scoped lang="scss">
.g-selected-count {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 350px;
  height: 100%;
  padding: 4px 20px;
  color: #303133;
  background: #dff3ff;
  border: 1px solid #4bb8ff;
  border-radius: 8px;

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    background: #1890ff;
    border-radius: 50%;
  }

  &__split {
    color: #96a3b5;
  }

  &__clear {
    color: #1890ff;
    cursor: pointer;
  }
}
</style>
