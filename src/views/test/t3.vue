<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const str1 = "a/b/c";
const str2 = "hello-world/js";
const str3 = "no_slash_here";
const str4 = "/starts_with_slash";

// 使用 split('/', 2) 最多分成2部分
const result1 = str1.split("/", 2);
const result2 = str2.split("/", 2);
const result3 = str3.split("/", 2);
const result4 = str4.split("/", 2);

console.log(str1, "=>", result1);
// 输出: a/b/c => ["a", "b/c"]

console.log(str2, "=>", result2);
// 输出: hello-world/js => ["hello-world", "js"]

console.log(str3, "=>", result3);
// 输出: no_slash_here => ["no_slash_here"] (因为没有找到分隔符，所以数组长度不到2)

console.log(str4, "=>", result4);
// 输出: /starts_with_slash => ["", "starts_with_slash"] (注意第一个元素是空字符串)

const myString = "a/b/c";

// 'a/b/c'.split('/') 会得到 ['a', 'b', 'c']
// 我们只想要分成两部分，所以加上 limit 参数 2
const result = myString.split("/", 2);

console.log(result);
// 预期输出: ["a", "b/c"]
// 实际输出: ["a", "b/c"]
</script>

<template>
  <div>
    <div>test/t3.vue</div>
  </div>
</template>
