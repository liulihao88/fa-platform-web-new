<script setup lang="ts">
import { computed, nextTick, ref, getCurrentInstance } from 'vue'
import { getCaseNameFilePageList } from '@/api/analysis'
import { useCommonHook } from '@/store'
import ErrorHandlerDialog from './errorHandlerDialog.vue'
import { useGlobalTablePageSize } from '@/hooks'

type ErrTaskRecord = {
  id: string
  caseId?: string
  caseName?: string
  sourceFile?: string
  folder?: string
  status?: string
  organization?: string
  returnInfo?: string
  uploadTime?: string
  successTime?: string
}

const { proxy } = getCurrentInstance()
const { getDictItems } = useCommonHook()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const headerRef = ref()
const tableRef = ref()
const errorHandlerDialogRef = ref()
const data = ref<ErrTaskRecord[]>([])
const total = ref(0)
const syncingSelection = ref(false)
const selectedMap = ref(new Map<string, ErrTaskRecord>())

const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  caseName: '',
}
syncPageSize(baseSearch)

const items = [
  {
    label: '案件名称',
    prop: 'caseName',
    type: 'input',
    placeholder: '请输入案件名称',
  },
]

const progressMap = {
  '000': 0,
  '002': 0,
  '003': 25,
  '100': 50,
  '101': 75,
  '102': 100,
}

const errorStatusList = ['900', '901', '902', '904', '999']
const selectedCount = computed(() => selectedMap.value.size)
const tableStats = computed(() => {
  const records = data.value || []
  return {
    total: total.value || 0,
    current: records.length,
    error: records.filter((item) => errorStatusList.includes(item.status || '')).length,
    running: records.filter((item) => ['000', '002', '100'].includes(item.status || '')).length,
    waiting: records.filter((item) => ['003'].includes(item.status || '')).length,
    done: records.filter((item) => ['101', '102', '201'].includes(item.status || '')).length,
  }
})
const statCards = computed(() => [
  {
    label: '任务总数',
    value: tableStats.value.total,
    tone: 'neutral',
    desc: `当前页 ${tableStats.value.current} 条`,
  },
  {
    label: '异常任务',
    value: tableStats.value.error,
    tone: 'danger',
    desc: '建议优先处理',
  },
  {
    label: '运行中',
    value: tableStats.value.running,
    tone: 'info',
    desc: '自动解析进行中',
  },
  {
    label: '待配置',
    value: tableStats.value.waiting,
    tone: 'warning',
    desc: '等待人工确认',
  },
  {
    label: '已完成',
    value: tableStats.value.done,
    tone: 'success',
    desc: '可继续后续处理',
  },
])

const columns = [
  {
    label: '案件名称',
    prop: 'caseName',
    width: 180,
  },
  {
    label: '源文件',
    prop: 'sourceFile',
  },
  {
    label: '文件夹',
    prop: 'folder',
  },
  {
    label: '状态',
    prop: 'status',
    useSlot: true,
    width: 120,
    align: 'center',
  },
  {
    label: '处理进度',
    ...proxy.renderProgressColumn({
      prop: 'status',
      progressMap,
    }),
  },
  {
    label: '所属机构',
    prop: 'organization',
    width: 120,
  },
  {
    label: '返回信息',
    prop: 'returnInfo',
    width: 160,
  },
  {
    label: '上传时间',
    prop: 'uploadTime',
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    label: '成功时间',
    prop: 'successTime',
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '错误处理',
        handler: handleErrorProcess,
      },
    ],
  },
]

function getStatusText(status: string) {
  const target = getDictItems('fa_file_process_status')?.find((item) => item.value === status)
  return target?.text || target?.label || status || '-'
}

async function syncSelection() {
  await nextTick()
  if (!tableRef.value?.$refs?.tableRef) return

  syncingSelection.value = true
  try {
    tableRef.value.$refs.tableRef.clearSelection()
    data.value.forEach((row) => {
      if (selectedMap.value.has(row.id)) {
        tableRef.value.$refs.tableRef.toggleRowSelection(row, true)
      }
    })
  } finally {
    await nextTick()
    syncingSelection.value = false
  }
}

function handleSelectionChange(rows: ErrTaskRecord[]) {
  if (syncingSelection.value) return

  const currentPageIds = new Set(data.value.map((item) => item.id))
  currentPageIds.forEach((id) => {
    selectedMap.value.delete(id)
  })

  rows.forEach((row) => {
    selectedMap.value.set(row.id, row)
  })
}

function clearSelected() {
  selectedMap.value.clear()
  tableRef.value?.$refs?.tableRef?.clearSelection()
}

function handleRefresh() {
  init()
}

function handleSearch(form) {
  baseSearch.pageNo = 1
  baseSearch.caseName = form?.caseName || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}

function handleErrorProcess(row: ErrTaskRecord) {
  errorHandlerDialogRef.value?.open({
    caseId: row.caseId,
    caseFileId: row.id,
  })
}

async function init() {
  const res = await getCaseNameFilePageList(baseSearch)
  data.value = res?.records ?? []
  total.value = res?.total ?? 0
  await syncSelection()
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">
      <o-flex class="w-100% mb2">
        <g-search-bar :items="items" :itemsPerRow="2" class="f-1" @search="handleSearch" @reset="handleSearch">
          <gSelectedCount :count="selectedCount" @clear="clearSelected" />
        </g-search-bar>
      </o-flex>
    </div>
    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :page-size="baseSearch.pageSize"
      :pageNumber="baseSearch.pageNo"
      row-key="id"
      @selection-change="handleSelectionChange"
      @update="handleUpdate"
    >
      <el-table-column type="selection" width="58" align="center" :reserve-selection="true" />
      <template #status="{ value }">
        <o-tag :type="errorStatusList.includes(value) ? 'danger' : 'primary'">
          {{ getStatusText(value) }}
        </o-tag>
      </template>
    </o-table>
    <error-handler-dialog ref="errorHandlerDialogRef" @success="init" />
  </div>
</template>

<style scoped lang="scss"></style>
