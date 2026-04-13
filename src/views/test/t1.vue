<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const selectValue = ref('z3')
const options = ref([
  {
    label:
      '张三11111111111111111张三11111111111111111张三11111111111111111张三11111111111111111张三11111111111111111张三11111111111111111张三11111111111111111',
    value: 'z3',
  },
  { label: '李四', value: 'l4' },
  { label: '王五', value: 'w5' },
])
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    <o-select v-model="selectValue" :options="options" />
  </div>
</template>
