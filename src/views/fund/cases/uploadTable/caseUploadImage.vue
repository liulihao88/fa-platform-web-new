<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { $toast, getStorage, tryCatch } from '@oeos-components/utils'
import request from '@/utils/request'
const { proxy } = getCurrentInstance()
const fileList = ref([])
const percentTextArr = ref([])
const uploadTimer = ref()
const uploadTasks = ref([]) // 存储上传任务

const cancelToken = (c, idx) => {
  uploadTasks.value[idx] = c
}

// 添加上传方法
const handleUpload = async (file, files) => {
  // 清除之前的定时器
  if (uploadTimer.value) {
    clearTimeout(uploadTimer.value)
  }

  // 过滤出不在当前列表中的新文件
  const newFiles = files.filter((newFile) => !fileList.value.some((existingFile) => existingFile.uid === newFile.uid))

  // 更新文件列表
  fileList.value = [...fileList.value, ...newFiles]

  // 设置新的定时器，延迟执行上传
  uploadTimer.value = setTimeout(() => {
    handleFileUpload()
  }, 300) // 300ms 延迟，可根据需要调整
}

// 添加上传方法
const handleFileUpload = async () => {
  if (fileList.value.length === 0) {
    proxy.$message.warning('请选择要上传的文件')
    return
  }

  // 自动开始上传所有文件
  fileList.value.forEach(async (sFile: any, sIdx) => {
    // 为每个文件创建取消token
    console.log(`73 getStorage('caseId')`, getStorage('caseId'))

    const formData = new FormData()
    formData.append('caseId', getStorage('caseId'))
    formData.append('file', sFile.raw || sFile)
    try {
      let data = await request('fa/casefile/upload', 'post', {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        cancel: (c) => cancelToken(c, sIdx),
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          percentTextArr.value[sIdx] = `${percentCompleted}%`
        },
      })

      // 完成后清理任务
      proxy.$message.success(`${sFile.name} 上传成功`)
    } catch (e) {
      // proxy.$message.error(`${sFile.name} 上传失败`)
    } finally {
      // 从文件列表中移除已上传的文件
      // fileList.value = fileList.value.filter((item) => item.uid !== sFile.uid)
      percentTextArr.value[sIdx] = '上传完成'
      delete uploadTasks.value[sIdx]
    }
  })
}

// 取消特定文件的上传
const cancelUploadByIndex = (index) => {
  const task = uploadTasks.value[index]
  if (task) {
    task()
    proxy.$message.info(`已取消 ${fileList.value[index].name} 的上传`)
    // 从文件列表中移除该文件
    fileList.value.splice(index, 1)
    // 更新进度信息
    percentTextArr.value.splice(index, 1)
  }
}

// 取消所有上传
const cancelAllUpload = () => {
  uploadTasks.value.forEach((c) => {
    c()
  })
  fileList.value = []
  proxy.$message.info('已取消所有上传')
}

const hasUploadComp = computed(() => {
  return percentTextArr.value.some((v) => {
    return v !== '上传完成'
  })
})
</script>

<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      :auto-upload="false"
      multiple
      accept=".xls,.xlsx,.xlsm,.csv,.pdf,.zip"
      :file-list="fileList"
      :on-change="handleUpload"
      :show-file-list="false"
      :on-remove="
        (file, fileList) => {
          const index = fileList.findIndex((f) => f.uid === file.uid)
          if (index !== -1) cancelUploadByIndex(index)
        }
      "
    >
      <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
      <div class="el-upload__text">点击或拖拽文件到此处上传</div>
      <template #tip>
        <o-flex class="w-100%" justify="space-between">
          <div class="el-upload__tip">支持扩展名 .xls .xlsx .xlsm .csv .pdf .zip</div>
          <el-button
            v-if="hasUploadComp"
            type="danger"
            icon="el-icon-close-bold"
            style="margin-top: 10px"
            size="small"
            @click="cancelAllUpload"
          >
            全部取消上传
          </el-button>
        </o-flex>
      </template>
    </el-upload>

    <!-- 手动上传和取消按钮 -->
    <div v-if="fileList.length > 0" class="upload-actions" style="margin-top: 20px; text-align: center">
      <div
        v-for="(v, i) in fileList"
        :key="v.uid"
        class="p-tb-4 m-tb-4"
        style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee"
      >
        <o-tooltip :content="v.name" class="1" />
        <div class="w-140 tr">
          <el-tag v-if="percentTextArr[i] === '上传完成'" size="small" @click="cancelUploadByIndex(i)">上传完成</el-tag>
          <el-button v-else size="small" icon="el-icon-close" @click="cancelUploadByIndex(i)">
            取消上传 {{ percentTextArr[i] }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
