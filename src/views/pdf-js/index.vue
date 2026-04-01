<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import LocalPdf from '@/views/pdf-js/localPdf.vue'
import PdfjsDist from '@/views/pdf-js/pdfjs-dist.vue'
const { proxy } = getCurrentInstance()
const navValue = ref('LocalPdf')
const url = '/image/2.pdf'
const options = [
  {
    label: 'LocalPdf',
    value: 'LocalPdf',
  },
  {
    label: 'PdfjsDist',
    value: 'PdfjsDist',
  },
]

const compValue = computed(() => {
  if (navValue.value === 'LocalPdf') {
    return LocalPdf
  }
  return PdfjsDist
})
</script>

<template>
  <div>
    <o-title title="本地pdf" />
    <o-tabs v-model="navValue" :options="options" />
    <component :is="compValue" :url="url" />
  </div>
</template>
