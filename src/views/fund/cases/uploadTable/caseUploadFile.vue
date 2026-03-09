<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import FileInfo from '@/views/fund/cases/uploadTable/fileInfo.vue'
const { proxy } = getCurrentInstance()
const fileInfoRef = ref()
const isShow = ref()
const isShowInfo = ref()
const uploadFileHandle = () => {
  isShow.value = true
}
const showUploadInfo = () => {
  // isShowInfo.value = true
  fileInfoRef.value.open()
}
</script>

<template>
  <div>
    <o-button type="primary" @click="uploadFileHandle">上传文件</o-button>
    <o-dialog ref="dialogRef" v-model="isShow" title="上传文件">
      <o-flex align="top">
        <div>
          <o-flex justify="space-between">
            <div class="ml" style="color: red">注:</div>
            <el-link class="" @click="showUploadInfo">上传文件格式说明</el-link>
          </o-flex>
          <div class="ml" style="color: red">1、如果压缩文件或者数据文件有密码，需要用密码打开后去掉密码再上传</div>
          <div class="ml" style="color: red">
            2、多个文件或者文件夹可以压缩成一个文件上传，支持ZIP压缩包,当文件20M时，建议压缩成多个文件上传
          </div>
          <div class="ml" style="color: red">3、同一个银行的文件放同一个文件夹，文件夹以银行名称命名</div>
        </div>
      </o-flex>

      <FileInfo ref="fileInfoRef" />
    </o-dialog>
  </div>
</template>
