<template>
  <o-dialog v-model="isShow" title="Cron表达式" width="1000px" @ok="handleOk" @cancel="handleCancel">
    <EasyCron v-bind="$attrs" ref="easyCronRef" :value="value" @update:value="handleValueChange" />
  </o-dialog>
</template>

<script lang="ts" setup>
import EasyCron from './EasyCronInner.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  value: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:visible', 'update:value'])
const isShow = ref(props.visible)
const easyCronRef = ref()

watch(
  () => props.visible,
  (newVal) => {
    isShow.value = newVal
  },
)
watch(isShow, (newVal) => {
  emit('update:visible', newVal)
})

const handleOk = () => {
  if (easyCronRef.value && easyCronRef.value.cronValueInner) {
    const newValue = easyCronRef.value.cronValueInner.value
    emit('update:value', newValue)
  }
  isShow.value = false
}

const handleCancel = () => {
  isShow.value = false
}

const handleValueChange = (newValue) => {
  emit('update:value', newValue)
}
</script>
