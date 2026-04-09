<script setup lang="ts">
import { ref, getCurrentInstance, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import PdfjsDist from '@/views/fund/cases/translateView/pdfjs-dist.vue'
import { getFileInfoItem } from '@/api/analysis.ts'
import VueOfficeExcel from '@vue-office/excel/lib/v3/index.js'
//引入相关样式
import '@vue-office/excel/lib/v3/index.css'
import { $toast, confirm } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()
const MAX_FILE_SIZE = 10 // 10MB
const EXCEL_EXTENSIONS = ['.xls', '.xlsx', '.xlsm']
const currentFileType = ref('')
const responseType = ref('arraybuffer')
const fileInfo = ref({})
const iframeUrl = ref('')
const loading = ref(false)
const previewAreaRef = ref<HTMLElement | null>(null)
const excelRenderKey = ref(0)
let resizeObserver: ResizeObserver | null = null
let lastPreviewWidth = 0
let resizeThrottleTimer: ReturnType<typeof setTimeout> | null = null
const RESIZE_THROTTLE_DELAY = 200

const props = defineProps({
  pFileInfo: {
    type: Object,
    required: true,
    defult: () => ({}),
  },
})

const onExcelError = (error) => {
  loading.value = false
  $toast('Excel文件渲染失败', 'e')
}

const loadFileContent = (type) => {
  // const previewUrl = 'http://192.168.56.228:8080/jeecg-boot' + '/' + fileInfo.value.fileViewUrl
  // const previewUrl = '/image/1.pdf'
  const previewUrl = window.location.origin + '/jeecgboot/' + fileInfo.value.fileViewUrl
  if (['xls', 'xlsx', 'xlsm'].includes(currentFileType.value)) {
    iframeUrl.value = previewUrl
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

    return
  }
}

const previewFile = async (type = 'normal') => {
  let res = await getFileInfoItem({ fileId: props.pFileInfo.id })
  fileInfo.value = res
  const fileSize = fileInfo.value.fileSize || 0
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

const isExcel = computed(() => ['xls', 'xlsx', 'xlsm'].includes(currentFileType.value))
const isExcelFile = computed(() => {
  const fileName = props.pFileInfo?.fileName?.toLowerCase() ?? ''
  return EXCEL_EXTENSIONS.some((extension) => fileName.endsWith(extension))
})

const refreshExcelView = async () => {
  await nextTick()
  if (!isExcel.value || !iframeUrl.value) return
  excelRenderKey.value += 1
}

const handlePreviewResize = async () => {
  const currentWidth = previewAreaRef.value?.clientWidth || 0
  if (!currentWidth || currentWidth === lastPreviewWidth) return
  lastPreviewWidth = currentWidth
  await refreshExcelView()
}

const schedulePreviewResize = () => {
  if (resizeThrottleTimer) return
  resizeThrottleTimer = setTimeout(async () => {
    resizeThrottleTimer = null
    await handlePreviewResize()
  }, RESIZE_THROTTLE_DELAY)
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    schedulePreviewResize()
  })

  if (previewAreaRef.value) {
    lastPreviewWidth = previewAreaRef.value.clientWidth || 0
    resizeObserver.observe(previewAreaRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (resizeThrottleTimer) {
    clearTimeout(resizeThrottleTimer)
    resizeThrottleTimer = null
  }
})

watch(
  () => iframeUrl.value,
  async () => {
    await nextTick()
    lastPreviewWidth = previewAreaRef.value?.clientWidth || 0
  },
)
</script>

<template>
  <div class="origin-translate">
    <div class="toolbar">
      <div class="file-info">
        <span class="label">文件名称:</span>
        <span class="value">{{ pFileInfo.fileName }}</span>
      </div>

      <div class="actions">
        <o-button type="primary" icon="el-icon-view" @click="previewFile('normal')">预览文件</o-button>
        <o-button v-if="!isExcelFile" class="cp" type="primary" icon="el-icon-zoom-in" @click="previewFile('fast')">
          快速预览文件
        </o-button>
        <o-tooltip content="快速预览文件使用懒加载技术, 无法全局搜索" placement="top" class="ml">
          <o-icon name="warning" />
        </o-tooltip>
      </div>
    </div>

    <div ref="previewAreaRef" class="preview-area">
      <template v-if="iframeUrl">
        <VueOfficeExcel
          v-if="isExcel"
          :key="excelRenderKey"
          :src="iframeUrl"
          :options="{
            transformImage: true,
            xls: true,
          }"
          :pagination="true"
          :page-size="20"
          style="width: 100%; height: 100%"
          :min-col-width="100"
          max-col-width="100%"
          @rendered="loading = false"
          @error="onExcelError"
        />
        <template v-else>
          <iframe
            v-if="iframeUrl.startsWith('/static')"
            id="searchshow"
            :src="iframeUrl"
            frameborder="0"
            style="width: 100%; height: 100%; overflow: auto"
          />
          <PdfjsDist v-else :url="iframeUrl" style="width: 100%; height: 100%; overflow: auto" />
        </template>
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
