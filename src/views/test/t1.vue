<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <o-basic-layout class="h-100%">
      <template #header>你好呀</template>
    </o-basic-layout>
  </div>
</template>
