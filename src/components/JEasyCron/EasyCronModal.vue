<template>
  <o-dialog v-model="isShow" title="Cron表达式" width="1000px">
    <EasyCron v-bind="$attrs" />
  </o-dialog>
</template>

<script lang="ts" setup>
import EasyCron from './EasyCronInner.vue'
import { defineComponent, ref } from 'vue'
const isShow = ref(false)

const open = () => {
  isShow.value = true
}

defineExpose({
  open,
})
</script>
