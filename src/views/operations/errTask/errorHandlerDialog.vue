<script setup lang="ts">
import { computed, ref, getCurrentInstance } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { $toast, confirm } from '@oeos-components/utils'
import { confirmFaErrorProcess, getCaseNameFileById, getFaErrorMessageList } from '@/api/analysis'
import { useGlobalTablePageSize } from '@/hooks'
const { appContext, proxy } = getCurrentInstance()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

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
syncPageSize(pagination.value)

const columns = [
  {
    label: '错误种类',
    prop: 'errorType',
    minWidth: 100,
    align: 'center',
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
    width: 100,
    align: 'center',
    useSlot: true,
  },
  {
    label: '处理时间',
    prop: 'procDate',
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    label: '创建时间',
    prop: 'createTime',
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '匹配',
        handler: handleProcess,
      },
    ],
  },
]

const dialogTitle = computed(() => {
  // const caseName = fileInfo.value.caseName || '--'
  // const fileName = fileInfo.value.fileName || '--'
  // return `错误处理 · ${caseName} / ${fileName}`
  return '错误处理'
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
  updatePageSize(pagination.value, pageSize)
  fetchErrorList()
}

function handleClose() {
  isShow.value = false
}

function handleProcess(row: ErrorRecord) {
  router.push({
    path: '/operation/configfile',
    // query: {
    //   errorId: row.id,
    //   caseId: currentParams.value.caseId,
    //   caseFileId: currentParams.value.caseFileId,
    // },
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

  await confirm('确定要标记当前文件的错误记录为已处理吗？')

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
  <o-dialog v-model="isShow" :title="dialogTitle" width="1100px" fillSlot :showConfirm="false">
    <o-flex direction="column" class="h-100%">
      <o-flex justify="space-between" align="center" class="w-100% mb2">
        <o-descriptions class="f-1 mr2" label-width="100">
          <el-descriptions-item label="案件名称">{{ fileInfo.caseName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="文件名称">{{ fileInfo.fileName || '--' }}</el-descriptions-item>
        </o-descriptions>
        <el-button type="primary" :loading="submitLoading" icon="el-icon-select" @click="handleBatchProcess">
          处理完成
        </el-button>
      </o-flex>

      <o-table
        class="f-1"
        style="min-height: 0"
        height="100%"
        :columns="columns"
        :data="data"
        :loading="loading"
        :total="total"
        :page-size="pagination.pageSize"
        :pageNumber="pagination.pageNo"
        row-key="id"
        @update="handleUpdate"
      >
        <template #errorType="{ value }">
          <o-tag type="danger">{{ getErrorTypeText(value) }}</o-tag>
        </template>
        <template #ifProcessed="{ value }">
          <o-tag :type="value === 1 ? 'success' : 'danger'">
            {{ value === 1 ? '已处理' : '未处理' }}
          </o-tag>
        </template>
      </o-table>
    </o-flex>
  </o-dialog>
</template>
