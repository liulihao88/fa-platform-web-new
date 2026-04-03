<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { $toast } from '@oeos-components/utils'
import { confirmFaErrorProcess, getCaseNameFileById, getFaErrorMessageList } from '@/api/analysis'

type ErrorHandlerParams = {
  caseId?: string
  caseFileId?: string
}

type FileInfo = {
  caseName?: string
  fileName?: string
}

type ErrorRecord = {
  id: string
  errorType?: string
  errorContent?: string
  ifProcessed?: number
  procDate?: string
  createTime?: string
}

const emits = defineEmits(['success'])
const router = useRouter()

const isShow = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const currentParams = ref<ErrorHandlerParams>({})
const fileInfo = ref<FileInfo>({})
const data = ref<ErrorRecord[]>([])
const total = ref(0)
const pagination = ref({
  pageNo: 1,
  pageSize: 10,
})

const columns = [
  {
    label: '序号',
    prop: 'index',
    width: 80,
    align: 'center',
    useSlot: true,
  },
  {
    label: '错误种类',
    prop: 'errorType',
    minWidth: 140,
    useSlot: true,
  },
  {
    label: '错误内容',
    prop: 'errorContent',
    minWidth: 260,
    showOverflowTooltip: true,
  },
  {
    label: '处理状态',
    prop: 'ifProcessed',
    width: 120,
    align: 'center',
    useSlot: true,
  },
  {
    label: '处理时间',
    prop: 'procDate',
    width: 180,
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 180,
  },
  {
    key: 'operation',
    label: '操作',
    width: 80,
    fixed: 'right',
    btns: [
      {
        content: '匹配',
        handler: handleProcess,
      },
    ],
  },
]

const dialogTitle = computed(() => {
  const caseName = fileInfo.value.caseName || '--'
  const fileName = fileInfo.value.fileName || '--'
  return `错误处理 · ${caseName} / ${fileName}`
})

function getErrorTypeText(errorType?: string) {
  const textMap: Record<string, string> = {
    '01': '数据错误',
    '02': '格式错误',
    '03': '系统错误',
  }
  return textMap[errorType || ''] || errorType || '--'
}

function handleUpdate(pageNo: number, pageSize: number) {
  pagination.value.pageNo = pageNo
  pagination.value.pageSize = pageSize
  fetchErrorList()
}

function handleClose() {
  isShow.value = false
}

function handleProcess(row: ErrorRecord) {
  router.push({
    path: '/operation/configfile',
    query: {
      errorId: row.id,
      caseId: currentParams.value.caseId,
      caseFileId: currentParams.value.caseFileId,
    },
  })
}

async function fetchFileInfo() {
  if (!currentParams.value.caseFileId) {
    fileInfo.value = {}
    return
  }
  try {
    const res = await getCaseNameFileById({
      fileId: currentParams.value.caseFileId,
    })
    fileInfo.value = res || {}
  } catch (error) {
    fileInfo.value = {}
  }
}

async function fetchErrorList() {
  if (!currentParams.value.caseId || !currentParams.value.caseFileId) {
    data.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    const res = await getFaErrorMessageList({
      caseId: currentParams.value.caseId,
      caseFileId: currentParams.value.caseFileId,
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize,
    })
    data.value = res?.records || []
    total.value = res?.total || 0
  } catch (error) {
    data.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function handleBatchProcess() {
  if (!currentParams.value.caseId || !currentParams.value.caseFileId) return

  await ElMessageBox.confirm('确定要标记当前文件的错误记录为已处理吗？', '确认处理完成', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })

  submitLoading.value = true
  try {
    await confirmFaErrorProcess({
      caseId: currentParams.value.caseId,
      fileId: currentParams.value.caseFileId,
    })
    $toast('处理完成')
    await fetchErrorList()
    emits('success')
  } finally {
    submitLoading.value = false
  }
}

async function open(params: ErrorHandlerParams) {
  currentParams.value = {
    caseId: params.caseId,
    caseFileId: params.caseFileId,
  }
  pagination.value.pageNo = 1
  isShow.value = true
  await Promise.all([fetchFileInfo(), fetchErrorList()])
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="dialogTitle" width="1100px" :showConfirm="false">
    <div class="error-handler">
      <div class="error-handler__meta">
        <span>案件名称：{{ fileInfo.caseName || '--' }}</span>
        <span>文件名称：{{ fileInfo.fileName || '--' }}</span>
      </div>

      <div class="error-handler__actions">
        <el-button type="primary" :loading="submitLoading" @click="handleBatchProcess">处理完成</el-button>
        <el-button @click="handleClose">暂时返回</el-button>
      </div>

      <o-table
        :height="420"
        :columns="columns"
        :data="data"
        :loading="loading"
        :total="total"
        :page-size="pagination.pageSize"
        row-key="id"
        @update="handleUpdate"
      >
        <template #index="{ index }">
          {{ (pagination.pageNo - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template #errorType="{ value }">
          <o-tag type="danger">{{ getErrorTypeText(value) }}</o-tag>
        </template>
        <template #ifProcessed="{ value }">
          <o-tag :type="value === 1 ? 'success' : 'danger'">
            {{ value === 1 ? '已处理' : '未处理' }}
          </o-tag>
        </template>
      </o-table>
    </div>
  </o-dialog>
</template>

<style scoped lang="scss">
.error-handler {
  &__meta {
    display: flex;
    gap: 32px;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 22px;
    color: #606266;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
