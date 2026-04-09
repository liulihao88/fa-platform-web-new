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
    <o-title title="1." />
    <el-button type="primary" @click="isTest67">暂存草稿</el-button>
    <el-button type="primary" @click="isTest67">保存配置</el-button>
    <o-title title="2." />
    <el-button type="primary" @click="isTest67">重新配置</el-button>
    <el-button type="primary" disabled @click="isTest67">保存配置</el-button>
    <o-title title="3." />
    <el-button type="primary" @click="isTest67">暂存草稿</el-button>
    <el-button type="primary" @click="isTest67">保存配置</el-button>
  </div>
</template>
