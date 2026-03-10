<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import CaseUploadImage from '@/views/fund/cases/uploadTable/caseUploadImage.vue'
</script>

<template>
  <div><CaseUploadImage /></div>
</template>
