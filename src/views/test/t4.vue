<script setup lang="ts">
const currentPath = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`
const publicUrl = new URL(currentPath, window.location.origin)
const viewerUrl = new URL('/static/pdf/web/viewer.html', publicUrl)
// const file = new URL('/static/helloworld.pdf', publicUrl)
// const file = new URL('/image/2.pdf', publicUrl)
const file = new URL('https://501351981.github.io/vue-office/examples/dist/static/test-files/test.pdf', publicUrl)
// disableRange:禁用范围; disableStream:禁用流;  disableAutoFetch: 禁用自动获取;
viewerUrl.searchParams.set('file', file.toString())
viewerUrl.searchParams.set('disableRange', 'true')
viewerUrl.searchParams.set('disableAutoFetch', 'false')
viewerUrl.searchParams.set('disableStream', 'true')
const iframeUrl = viewerUrl.toString()
console.log(`28 viewerUrl`, viewerUrl)
console.log(`77 iframeUrl.value`, iframeUrl)
</script>

<template>
  <div>
    <iframe
      id="searchshow"
      :src="iframeUrl"
      frameborder="0"
      style="width: 100%; height: 100vh; overflow: auto"
      loading="lazy"
    />
  </div>
</template>
