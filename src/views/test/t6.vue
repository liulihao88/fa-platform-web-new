<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
import { ElMessage, ElMessageBox, MessageOptions } from 'element-plus'
import { confirm2 } from '@/utils/gFunc.ts'
import { confirm } from '@oeos-components/utils'
console.log(`08 confirm`, confirm)
console.log(`28 confirm2`, confirm2)
const isShow = ref(false)

const cc = () => {
  ElMessageBox.confirm('cccccc', {
    title: '提示',
    draggable: true,
    showCancelButton: false,
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true, // 允许 HTML
    // appContext: elContext, // 强制
  })
}
</script>

<template>
  <div>
    <o-dialog id="cc" ref="dialogRef" v-model="isShow" title="t1">
      <el-button type="primary" @click="confirm2(123321456, { appendTo: 'cc' })">测试15</el-button>
      <el-button type="primary" @click="confirm('oeos-confirm', { appContext: '' })">oeos-confirm</el-button>
      <el-button type="primary" @click="cc">原生</el-button>
    </o-dialog>

    <el-button type="primary" @click="isShow = true">测试89</el-button>

    <!-- <el-dialog v-model="isShow"> -->
    <!-- <el-button type="primary" @click="cc">测试15</el-button> -->
    <!-- </el-dialog> -->
  </div>
</template>

<style lang="scss" scoped>
.dddd {
  z-index: 99999 !important;
}
</style>
