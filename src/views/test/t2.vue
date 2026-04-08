<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { caseInvolvedList } from '@/api/analysis.ts'
const init = async () => {
  let data = {
    pageNo: 1,
    pageSize: 10,
  }
  let res = await caseInvolvedList(data)
  console.log(`61 res`, res)
}
</script>

<template>
  <div>
    <div>test/t2.vue</div>
    <el-button type="primary" @click="init">测试12</el-button>
  </div>
</template>
