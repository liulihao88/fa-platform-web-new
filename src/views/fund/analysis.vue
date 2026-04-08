<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import addCaseDoc from './addCaseDoc.vue'
import { deleteFaCase, getFaCaseInfoList } from '@/api/analysis'
import { useRouter, useRoute } from 'vue-router'
import { $toast, getStorage, setStorage } from '@oeos-components/utils'
const router = useRouter()
const { proxy } = getCurrentInstance()
const route = useRoute()
import { useCommonHook } from '@/store'
const { setCommonItems, sysAllDictItems, getDictItems } = useCommonHook()
import { useDetail, useGlobalTablePageSize } from '@/hooks'
const { toDetail } = useDetail()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  caseCode: '',
  caseReason: '',
  sysOrgCode: '',
  processStatus: '',
  processDate: '',
}
syncPageSize(baseSearch)
const data = ref([])
const total = ref(0)
const headerRef = ref()
const addCaseDocRef = ref()
const editRow = (row) => {
  addCaseDocRef.value.open(row, row.id ? '编辑' : '新增')
}
const deleteRow = async (row) => {
  await deleteFaCase(row.id)
  init()
}
const items = [
  {
    label: '案件名称',
    prop: 'caseCode',
    type: 'input',
  },
  {
    label: '案由',
    prop: 'caseReason',
    type: 'input',
  },
  {
    label: '部门受案号',
    prop: 'sysOrgCode',
    type: 'input',
  },
  {
    label: '案件处理状态',
    prop: 'processStatus',
    type: 'select',
    dict: 'fa_case_process_status',
  },
  {
    label: '受理时间',
    prop: 'processDate',
    type: 'date',
    valueFormat: 'YYYY-MM-DD',
  },
]
const moreBtns = [
  {
    content: '新增',
    type: 'primary',
    icon: 'el-icon-plus',
    handler: () => {
      editRow({})
    },
  },
]
const columns = [
  {
    label: '案件名称',
    prop: 'caseCode',
    width: 150,
  },
  {
    label: '案由',
    prop: 'caseReason',
  },
  {
    label: '部门受案号',
    prop: 'sysOrgCode',
  },
  {
    label: '受理时间',
    prop: 'createTime',
    ...proxy.TIME_WIDTH_ATTRS,
  },
  {
    label: '文件处理状态',
    prop: 'processStatus',
    filter: (value) => {
      return getDictItems('fa_case_process_status').find((v) => v.value === value).label
    },
  },
  {
    label: '处理进度',
    prop: 'processStatus',
    width: 150,
    useSlot: true,
  },
  {
    label: '文件数量',
    prop: 'fileNum',
    width: 100,
  },
  {
    label: '成功数量',
    prop: 'succFileNum',
    width: 100,
  },
  {
    label: '失败数量',
    prop: 'errorFileNum',
    width: 100,
  },
  {
    label: '导入行数',
    prop: 'importDataNum',
    width: 100,
  },
  {
    label: '去重行数',
    prop: 'repeatDataNum',
    width: 100,
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 4,
    btns: [
      {
        content: '数据处理',
        handler: handleRow,
      },
      {
        content: '智能筛查',
        handler: filterRow,
      },
      {
        handler: editRow,
        ...proxy.EDIT_ATTRS,
      },
      {
        ...proxy.getDeleteAttrs(),
        handler: deleteRow,
      },
    ],
  },
]

const parseProcess = (text) => {
  const progressMap = {
    '000': 0,
    '001': 20,
    '010': 40,
    '002': 60,
    '003': 80,
    '004': 100,
  }

  const percent = progressMap[text] || 0
  return percent
}
async function handleRow(row) {
  toDetail('Cases', { caseId: row.id })
  setStorage('caseId', row.id)
}
async function filterRow(row) {
  toDetail('FundsAnalysis', { caseId: row.id })
}
const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  handleSearch({})
}
const handleSearch = (form) => {
  baseSearch.caseCode = form?.caseCode
  baseSearch.caseReason = form?.caseReason
  baseSearch.sysOrgCode = form?.sysOrgCode
  baseSearch.processStatus = form?.processStatus
  baseSearch.processDate = form?.processDate
  init()
}
const init = async () => {
  let res = await getFaCaseInfoList(baseSearch)
  data.value = res.records
  total.value = res.total
}
init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" :itemsPerRow="5" @search="handleSearch" @reset="handleSearch">
        <g-more-button :btns="moreBtns" mode="opt" trigger="hover" />
      </g-search-bar>
    </div>
    <o-table
      ref="tableRef"
      :columns="columns"
      :data="data"
      :total="total"
      :page-size="baseSearch.pageSize"
      :height="$tableHeight.value"
      @update="handleUpdate"
    >
      <template #processStatus="{ value }">
        <o-progress :percentage="parseProcess(value)" text-inside="true" />
      </template>
    </o-table>
    <addCaseDoc ref="addCaseDocRef" @success="init" />
  </div>
</template>
