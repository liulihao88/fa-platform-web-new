<template>
  <div class="easy-cron-input">
    <a-input v-model:value="editCronValue" :placeholder="placeholder" :disabled="disabled">
      <template #addonAfter>
        <a class="open-btn" :disabled="disabled ? 'disabled' : null" @click="showConfigModal">
          <span>选择</span>
        </a>
      </template>
    </a-input>
    <EasyCronModal
      v-model:visible="modalVisible"
      v-model:value="editCronValue"
      :exeStartTime="exeStartTime"
      :hideYear="hideYear"
      :remote="remote"
      :hideSecond="hideSecond"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { propTypes } from '@/utils/propTypes'
import EasyCronModal from './EasyCronModal.vue'
import { cronEmits, cronProps } from './easy.cron.data'
const emit = defineEmits([...cronEmits])
const props = defineProps({
  ...cronProps,
  placeholder: propTypes.string.def('请输入cron表达式'),
  exeStartTime: propTypes.oneOfType([propTypes.number, propTypes.string, propTypes.object]).def(0),
})
const modalVisible = ref(false)
// 将第33行修改为：
const editCronValue = ref(props.value || '* * * * * ? *')

// 并修改watch，添加空值检查：
watch(
  () => props.value,
  (newVal) => {
    if (newVal !== undefined && newVal !== null) {
      editCronValue.value = newVal
    }
  },
)

watch(
  () => props.value,
  (newVal) => {
    editCronValue.value = newVal
  },
)
watch(editCronValue, (newVal) => {
  emit('change', newVal)
  emit('update:value', newVal)
  emit('update:modelValue', newVal)
})

function showConfigModal() {
  if (!props.disabled) {
    modalVisible.value = true
  }
}
</script>

<style lang="scss" scoped>
.easy-cron-input {
  a.open-btn {
    cursor: pointer;

    .app-iconify {
      position: relative;
      top: 1px;
      right: 2px;
    }
  }
}
</style>
