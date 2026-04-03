<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { getCaseNameFilePageList } from '@/api/analysis'
import { useCommonHook } from '@/store'

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

const router = useRouter()
const { proxy } = getCurrentInstance()
const { getDictItems } = useCommonHook()

const headerRef = ref()
const data = ref<ErrTaskRecord[]>([])
const total = ref(0)
const selectedRows = ref<ErrTaskRecord[]>([])

const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  caseName: '',
}

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

const errorStatusList = ['900', '901', '902', '904', '999', '201']

const columns = [
  {
    type: 'selection',
  },
  {
    label: '案件名称',
    prop: 'caseName',
    width: 180,
  },
  {
    label: '源文件',
    prop: 'sourceFile',
    width: 220,
  },
  {
    label: '文件夹',
    prop: 'folder',
    width: 180,
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
    prop: 'progress',
    useSlot: true,
    width: 180,
  },
  {
    label: '所属机构',
    prop: 'organization',
    useSlot: true,
    width: 120,
  },
  {
    label: '返回信息',
    prop: 'returnInfo',
    useSlot: true,
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
    useSlot: true,
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    key: 'operation',
    label: '操作',
    width: 140,
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
  return target?.text || target?.label || status || '--'
}

function handleSelectionChange(rows: ErrTaskRecord[]) {
  selectedRows.value = rows
}

function handleSearch(form) {
  baseSearch.pageNo = 1
  baseSearch.caseName = form?.caseName || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  init()
}

function handleErrorProcess(row: ErrTaskRecord) {
  router.push({
    path: '/operation/configfile',
    query: {
      errorId: row.id,
      caseId: row.caseId,
      caseFileId: row.id,
    },
  })
}

async function init() {
  const res = await getCaseNameFilePageList(baseSearch)
  data.value = res?.records ?? []
  total.value = res?.total ?? 0
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">
      <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
      <el-alert
        class="mb-3"
        type="info"
        :closable="false"
        :title="selectedRows.length ? `已选中 ${selectedRows.length} 条数据` : '未选中任何数据'"
      />
    </div>
    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :page-size="baseSearch.pageSize"
      @selection-change="handleSelectionChange"
      @update="handleUpdate"
    >
      <template #status="{ value }">
        <el-tag v-if="errorStatusList.includes(value)" type="danger">
          {{ getStatusText(value) }}
        </el-tag>
        <el-tag v-else type="primary">
          {{ getStatusText(value) }}
        </el-tag>
      </template>
      <template #progress="{ row }">
        <o-progress :percentage="progressMap[row.status] ?? 0" :text-inside="true" />
      </template>
      <template #organization="{ value }">
        {{ value || '--' }}
      </template>
      <template #returnInfo="{ value }">
        {{ value || '--' }}
      </template>
      <template #successTime="{ value }">
        {{ value || '--' }}
      </template>
    </o-table>
  </div>
</template>
