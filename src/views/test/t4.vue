<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const str = 'path/to/my/folder/file.html' // 包含 4 个 '/'
const str2 = 'a/b' // 包含 1 个 '/'
const str3 = 'abc'
const regex = /\//g

const results = str2.match(regex)
console.log(results)
// 输出: ['/', '/', '/', '/']
// 这是一个数组，包含了所有找到的 '/'
// 判断数组是否存在，并且长度 >= 2
if (results && results.length >= 2) {
  console.log(`字符串 "${str}" 包含两个或更多的 '/'。`)
  // 输出: 字符串 "path/to/my/folder/file.html" 包含两个或更多的 '/'。
} else {
  console.log(`字符串 "${str}" 不包含两个或更多的 '/'。`)
}
</script>

<template>
  <div>
    <div>test/t4.vue</div>
  </div>
</template>
