<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const isShow = ref(false)
</script>

<template>
  <div>
    <div>test/t1.vue</div>
    {{ proxy.test() }}

    <o-choose-area />
    <el-button type="primary" @click="isShow = true">测试46</el-button>
    <o-dialog ref="dialogRef" v-model="isShow" title="t1">
      <el-button type="primary" @click="proxy.confirm('22')">测试64</el-button>
    </o-dialog>
  </div>
</template>
