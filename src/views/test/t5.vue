<script setup lang="ts">
import { ref } from 'vue'

const iframeUrl = ref('')
const baseUrl = import.meta.env.BASE_URL
const fileUrl = new URL(`${baseUrl}image/1.pdf`, window.location.origin).href

iframeUrl.value = `${baseUrl}pdf/web/viewer.html?file=${encodeURIComponent(fileUrl)}&disableRange=true&disableAutoFetch=false&disableStream=true`
</script>

<template>
  <iframe :src="iframeUrl" frameborder="0" style="width: 100%; height: 100vh; overflow: auto" loading="lazy" />
</template>
