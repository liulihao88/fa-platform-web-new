<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const iframeUrl = ref('')

const file = ref('/image/1.pdf')
file.value = 'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.pdf'
// disableRange:禁用范围; disableStream:禁用流;  disableAutoFetch: 禁用自动获取;
iframeUrl.value =
  window.location.origin +
  '/pdf/web/viewer.html?file=' +
  file.value +
  '&disableRange=true&disableAutoFetch=false&disableStream=true'
console.log(`77 iframeUrl.value`, iframeUrl.value)
</script>

<template>
  <div>
    211321
    <iframe
      id="searchshow"
      :src="iframeUrl"
      frameborder="0"
      style="width: 100%; height: 100vh; overflow: auto"
      loading="lazy"
    />
  </div>
</template>
