<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <el-image :src="props.src" :preview-src-list="[props.src]" show-progress v-bind="$attrs" />
  </div>
</template>
