<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import TaskDialog from '@/views/fund/taskDialog.vue'
import { getQuartzJobList, resumeQuartzJob, pauseQuartzJob, deleteQuartzJob, runQuartzJob } from '@/api/analysis'
import { getType, $toast } from '@oeos-components/utils'
import { exportQuartzJob } from '@/api/analysis'
import { uploadFile } from '@/utils/request'

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
const selectIds = ref([])
const { proxy } = getCurrentInstance()
const headerRef = ref()
const handleSearch = (form) => {
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

const columns = [
  {
    type: 'selection',
  },
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
    width: 240,
    maxBtns: 5,
    btns: [
      {
        content: (value, row) => {
          if (value?.status == '-1') {
            return '启动'
          } else {
            return '停止'
          }
        },
        type: 'primary',
        // handler: edit,
        handler: (value, row) => {
          if (value?.status == '-1') {
            proxy.confirm('确定启动吗?').then(() => {
              resumeQuartzJob({ id: value.id }).then((res) => {
                console.log(res)
                if (res?.code == 200) {
                  $toast.success('操作成功')
                  init()
                }
              })
            })
          } else {
            proxy.confirm('确定停止吗?').then(() => {
              pauseQuartzJob({ id: value.id }).then((res) => {
                if (res?.code == 200) {
                  $toast.success('操作成功')
                  init()
                }
              })
            })
          }
        },
      },
      {
        content: '编辑',
        handler: editRow,
      },
      {
        content: '删除',
        type: 'danger',
        handler: (value, row) => {
          proxy.confirm('确定删除吗?').then(() => {
            deleteQuartzJob({ id: value.id }).then((res) => {
              if (res?.code == 200) {
                $toast.success('操作成功')
                init()
              }
            })
          })
        },
      },
      {
        content: '立即执行',
        type: 'primary',
        handler: (value, row) => {
          proxy.confirm('确定立即执行吗?').then(() => {
            runQuartzJob({ id: value.id }).then((res) => {
              if (res?.code == 200) {
                $toast.success('操作成功')
                init()
              }
            })
          })
        },
      },
    ],
  },
]
/**
 * 编辑
 */
function editRow(row) {
  if (getType(row.parameter) === 'object') {
    row.paramterType = 'json'
  } else {
    row.paramterType = 'string'
  }
  taskDialogRef.value.open(row, row.id ? '编辑任务' : '新增任务')
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
    selections: selectIds.value.length > 0 ? selectIds.value.join(',') : '',
    column: 'createTime',
    order: 'desc',
  }
  let res = await exportQuartzJob(params)
}
/**
 * 选中
 */
const handleSelectionChange = (val) => {
  console.log(val)
  selectIds.value = val.map((item) => item.id)
}

const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  handleSearch({})
}
const init = async () => {
  let res = await getQuartzJobList(baseSearch)
  data.value = res?.records
  total.value = res?.total
}
init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">
      <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
      <div class="mb-2">
        <el-button type="primary" icon="el-icon-plus" @click="editRow({})">新增</el-button>
        <el-button icon="el-icon-upload" @click="onImportXls">导入</el-button>
        <el-button icon="el-icon-download" @click="onExportXls">导出</el-button>
      </div>
    </div>
    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :showIndex="false"
      :page-size="30"
      @selection-change="handleSelectionChange"
      @update="handleUpdate"
    >
      <template #status="{ row }">
        <el-tag :type="row.status == '0' ? 'success' : 'danger'">{{ row.status == '0' ? '正常' : '停止' }}</el-tag>
      </template>
    </o-table>
    <TaskDialog ref="taskDialogRef" @success="init" />
  </div>
</template>
