<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import PdfjsDist from '@/views/fund/cases/translateView/pdfjs-dist.vue'
import { getFileInfoItem } from '@/api/analysis.ts'
import { $toast, confirm } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()
const fileName = '2/光大银行 - 脱敏.xlsx'
const MAX_FILE_SIZE = 10 // 10MB
const currentFileType = ref('')
const responseType = ref('arraybuffer')
const fileInfo = ref({})
const iframeUrl = ref('')
const fileStreamInfo = ref()

const props = defineProps({
  pFileInfo: {
    type: String,
    required: true,
  },
})

const loadFileContent = (type) => {
  console.log('loadFileContent')
  // const previewUrl = 'http://192.168.56.228:8080/jeecg-boot' + '/' + fileInfo.value.fileViewUrl
  // const previewUrl = '/image/1.pdf'
  const previewUrl = window.location.origin + '/jeecgboot/' + fileInfo.value.fileViewUrl
  console.log(`16 fileInfo.value.fileViewUrl`, fileInfo.value.fileViewUrl)
  // console.log(`53 previewUrl`, previewUrl)
  if (['xls', 'xlsx', 'xlsm'].includes(currentFileType.value)) {
    fileStreamInfo.value = previewUrl
    return
  } else if (['pdf'].includes(currentFileType.value)) {
    if (type === 'fast') {
      iframeUrl.value = previewUrl
    } else {
      const pdfPreviewUrl =
        '/static/pdf/web/viewer.html?file=' +
        encodeURIComponent(previewUrl) +
        '&disableRange=true&disableAutoFetch=false&disableStream=true'
      iframeUrl.value = pdfPreviewUrl
    }
    console.log(`18 iframeUrl.value`, iframeUrl.value)

    return
  }
}

const previewFile = async (type = 'normal') => {
  let res = await getFileInfoItem({ fileId: props.pFileInfo.id })
  fileInfo.value = res
  const fileSize = fileInfo.value.fileSize || 0
  console.log(`86 fileSize`, fileSize)
  currentFileType.value = (fileInfo.value.fileType || '').toLowerCase()
  responseType.value = currentFileType.value === 'csv' ? 'arraybuffer' : 'arraybuffer'

  if (fileSize > MAX_FILE_SIZE * 1024 * 1024) {
    confirm('文件过大提示', {
      message: `当前文件大小为 ${(fileSize / (1024 * 1024)).toFixed(2)}MB，超过系统可负载的 ${MAX_FILE_SIZE}MB 限制，建议线下用 WPS 打开查看。如果继续预览，会影响浏览器性能，是否继续预览?`,
      confirmButtonText: '继续预览',
      cancelButtonText: '取消',
    })
      .then(() => {
        loadFileContent(type)
      })
      .catch(() => {})
  } else {
    // 文件大小在限制范围内，直接加载
    loadFileContent(type)
  }
}
</script>

<template>
  <div class="origin-translate">
    <div class="toolbar">
      <div class="file-info">
        <span class="label">文件名称:</span>
        <span class="value">{{ fileName }}</span>
      </div>

      <div class="actions">
        <el-button class="cp" type="primary" @click="previewFile('normal')">预览文件</el-button>
        <el-button class="cp" type="primary" @click="previewFile('fast')">快速预览文件</el-button>
      </div>
    </div>

    <div class="preview-area">
      <template v-if="iframeUrl">
        <iframe
          v-if="iframeUrl.startsWith('/static')"
          id="searchshow"
          :src="iframeUrl"
          frameborder="0"
          style="width: 100%; height: 100%; overflow: auto"
        />
        <PdfjsDist v-else :url="iframeUrl" style="width: 100%; height: 100%; overflow: auto" />
      </template>
      <div v-if="!iframeUrl" class="preview-placeholder">点击"预览文件"按钮加载文件内容</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.origin-translate {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid #e5e6eb;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.file-info {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  color: #303133;
}

.label {
  flex-shrink: 0;
  font-weight: 500;
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: center;
}

.preview-area {
  width: 100%;
  height: 100%;
  color: #909399;
  background: linear-gradient(0deg, rgb(0 0 0 / 1%), rgb(0 0 0 / 1%)), #fff;
}

.preview-placeholder {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
}
</style>
