<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import PdfJs from '@/views/pdf-js/index.vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <PdfJs />
  </div>
</template>
