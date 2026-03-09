<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const isShow = ref()
const isShowInfo = ref()
const uploadFileHandle = () => {
  isShow.value = true
}
const showUploadInfo = () => {
  isShowInfo.value = true
}
</script>

<template>
  <div>
    <o-button @click="uploadFileHandle">上传文件</o-button>
    <o-dialog ref="dialogRef" v-model="isShow" title="上传文件">
      <template #title>
        <div>上传文件</div>
        <el-button type="primary" @click="showUploadInfo">上传文件格式说明</el-button>
      </template>
    </o-dialog>
  </div>
</template>
