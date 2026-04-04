<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
import { $toast, confirm } from '@oeos-components/utils'
const isShow = ref(false)
const cc = () => {
  confirm('22')
}
const isTest74 = () => {
  ElMessageBox.confirm('33')
}
console.log(`42 document`, document)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    {{ proxy.test() }}

    <o-choose-area />
    <el-button type="primary" @click="isShow = true">测试46</el-button>
    <o-dialog ref="dialogRef" v-model="isShow" title="t1">
      <el-button type="primary" @click="cc">测试64</el-button>

      <el-button type="primary" @click="isTest74">原生ElMessageBox</el-button>
    </o-dialog>
  </div>
</template>
