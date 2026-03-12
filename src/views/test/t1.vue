<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { useDetail, useGlobalLoading } from '@/hooks'
console.log(`44 useGlobalLoading`, useGlobalLoading)
console.log(`58 useDetail`, useDetail)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
  </div>
</template>
