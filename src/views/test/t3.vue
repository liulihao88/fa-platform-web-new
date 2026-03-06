<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
import { useCommonHook } from "@/store/common.ts";

const { setCommonItems, sysAllDictItems, userInfo } = useCommonHook();
console.log(`81 setCommonItems`, setCommonItems);
</script>

<template>
  <div>
    <el-button
      type="primary"
      @click="setCommonItems('sysAllDictItems', { age: 18 })"
      >测试89</el-button
    >
    <div>test/t3.vue</div>
    {{ sysAllDictItems }} ?? {{ userInfo }}
  </div>
</template>
