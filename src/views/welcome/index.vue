<script setup lang="ts">
import { getCurrentInstance, ref } from "vue";
import { $toast, isEmpty, test } from "@oeos-components/utils";
console.log(`95 test`, test);
// console.log(`29 $toast`, $toast);
console.log(`06 getCurrentInstance`, getCurrentInstance);
const { proxy } = getCurrentInstance();
console.log(`51 proxy`, proxy);
defineOptions({
  name: "Welcome"
});
console.log(proxy);
// proxy.$toast("保存成功");
console.log(`14行 welcome/index.vue isEmpty(123) `, isEmpty(123));
console.log(`14行 welcome/index.vue proxy.isEmpty(123) `, proxy.isEmpty(123));
$toast("保存成功2");
proxy.$toast("报错");
</script>

<template>
  <h1>Pure-Admin-Thin（非国际化版本11）</h1>
  <o-button type="primary">按钮</o-button>
  <el-button>安保部</el-button>
</template>
