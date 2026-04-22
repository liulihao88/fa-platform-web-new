<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import TaskDialog from '@/views/fund/taskDialog.vue'
import {
  getQuartzJobList,
  resumeQuartzJob,
  pauseQuartzJob,
  deleteQuartzJob,
  runQuartzJob,
  deleteBatchQuartzJob,
} from '@/api/analysis'
import { getType, $toast } from '@oeos-components/utils'
import { exportQuartzJob } from '@/api/analysis'
import { uploadFile } from '@/utils/request'
import { useProvideOTablePageSize, useTablePagination } from '@/hooks'
useProvideOTablePageSize()

const items = [
  {
    label: '任务类名',
    prop: 'jobClassName',
    type: 'input',
    placeholder: '请输入任务类名',
  },
  {
    label: '任务状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择任务状态',
    dict: 'quartz_status',
  },
]
const { proxy } = getCurrentInstance()
const headerRef = ref()
const selectedRows = ref<any[]>([])
const handleSearch = (form) => {
  baseSearch.pageNo = 1
  baseSearch.jobClassName = form?.jobClassName
  baseSearch.status = form?.status
  init()
}
const taskDialogRef = ref()
const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 30,
  column: 'createTime',
  jobClassName: '',
  status: '',
}
const data = ref([])
const total = ref(0)
const selectedCount = computed(() => selectedRows.value.length)

async function toggleJobStatus({ row }) {
  if (row?.status == '-1') {
    await resumeQuartzJob({ id: row.id })
  } else {
    await pauseQuartzJob({ id: row.id })
  }
  init()
}

async function runJob({ row }) {
  await runQuartzJob({ id: row.id })
  init()
}

async function deleteRow({ row }) {
  await deleteQuartzJob({ id: row.id })
  init()
}

const columns = [
  {
    label: '任务类名',
    prop: 'jobClassName',
  },
  {
    label: 'Cron表达式',
    prop: 'cronExpression',
  },
  {
    label: '参数',
    prop: 'parameter',
  },
  {
    label: '描述',
    prop: 'description',
  },
  {
    label: '状态',
    prop: 'status',
    useSlot: true,
    width: 100,
    align: 'center',
  },
  {
    key: 'operation',
    label: '操作',
    maxBtns: 5,
    btns: [
      {
        content: ({ row }) => {
          if (row?.status == '-1') {
            return '启动'
          } else {
            return '停止'
          }
        },
        type: 'primary',
        reConfirm: !proxy.$dev,
        title: ({ row }) => {
          if (row?.status == '-1') {
            return '确认启动吗？'
          } else {
            return '确认停止吗？'
          }
        },
        handler: toggleJobStatus,
      },
      {
        content: '立即执行',
        type: 'primary',
        reConfirm: !proxy.$dev,
        title: '确认立即执行吗？',
        handler: runJob,
      },
      {
        handler: editRow,
        ...proxy.setEditAttrs(),
      },
      {
        handler: deleteRow,
        ...proxy.setDeleteAttrs(),
      },
    ],
  },
]
/**
 * 编辑
 */
function editRow({ row }: { row?: Record<string, any> } = {}) {
  const currentRow = row || {}
  if (getType(currentRow.parameter) === 'object') {
    currentRow.paramterType = 'json'
  } else {
    currentRow.paramterType = 'string'
  }
  taskDialogRef.value.open(currentRow, currentRow.id ? '编辑任务' : '新增任务')
}

function addRow() {
  editRow({})
}
/**
 * 导入
 */
const onImportXls = async () => {
  uploadFile({
    url: '/sys/quartzJob/importExcel',
    multiple: false,
    callback: {
      isReturnResponse: true,
      success: (res) => {
        console.log(res)
        init()
      },
    },
  })
}
/**
 * 导出
 */
const onExportXls = async () => {
  const params = {
    selections: selectedCount.value > 0 ? selectedRows.value.map((item) => item.id).join(',') : '',
    column: 'createTime',
    order: 'desc',
  }
  let res = await exportQuartzJob(params)
}

function clearSelected() {
  selectedRows.value = []
}

async function deleteBatchRows() {
  const ids = selectedRows.value.map((item) => item.id).join(',')
  await deleteBatchQuartzJob(ids)
  clearSelected()
  init()
}

const moreBtns = [
  {
    content: '新增',
    type: 'primary',
    icon: 'el-icon-plus',
    handler: addRow,
  },
  {
    content: '导入',
    type: 'primary',
    icon: 'el-icon-upload',
    handler: onImportXls,
  },
  {
    content: '导出',
    type: 'primary',
    icon: 'el-icon-download',
    handler: onExportXls,
  },
  {
    content: '批量删除',
    type: 'primary',
    reConfirm: !proxy.$dev,
    icon: 'el-icon-delete',
    disabled: () => selectedCount.value === 0,
    isShow: () => selectedCount.value !== 0,
    handler: deleteBatchRows,
  },
]

async function init() {
  let res = await getQuartzJobList(baseSearch)
  data.value = res?.records
  total.value = res?.total
}

const { handlePageUpdate: handleUpdate } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.pageNo = pageNo
  return init()
})

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" :itemsPerRow="3" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button :btns="moreBtns" mode="opt" trigger="hover" />
      </g-search-bar>
    </div>
    <o-table
      v-model="selectedRows"
      selection-type="multiple"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :showIndex="false"
      :pageNumber="baseSearch.pageNo"
      row-key="id"
      @update="handleUpdate"
    >
      <template #status="{ row }">
        <el-tag :type="row.status == '0' ? 'success' : 'danger'">{{ row.status == '0' ? '正常' : '停止' }}</el-tag>
      </template>
    </o-table>
    <TaskDialog ref="taskDialogRef" @success="init" />
  </div>
</template>
