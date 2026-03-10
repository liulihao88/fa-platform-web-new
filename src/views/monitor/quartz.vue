<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
import TaskDialog from '@/views/fund/taskDialog.vue'
import { getQuartzJobList } from '@/api/analysis'
import { $toast, getType } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()
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

const handleSearch = (form) => {
  baseSearch.jobClassName = form?.jobClassName
  baseSearch.status = form?.status
  init()
}
const taskDialogRef = ref()
const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  jobClassName: '',
  status: '',
}
const data = ref([])
const total = ref(0)

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
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
        // comp: "o-icon",
        handler: editRow,
        // attrs: {
        //   name: "edit",
        //   type: "svg",
        //   content: "数据处理"
        // }
      },
      // {
      //   content: "删除",
      //   comp: "o-icon",
      //   attrs: {
      //     name: "delete",
      //     type: "svg",
      //     content: "智能筛查"
      //   }
      // }
    ],
  },
]

function editRow(row) {
  if (getType(row.parameter) === 'object') {
    row.paramterType = 'json'
  } else {
    row.paramterType = 'string'
  }
  taskDialogRef.value.open(row)
}

const init = async () => {
  let res = await getQuartzJobList(baseSearch)
  console.log(res)

  data.value = res?.records
  total.value = res?.total
}
onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <g-search-bar :items="items" :items-per-row="3" @search="handleSearch" @reset="handleSearch" />
    <div class="mb-2">
      <el-button type="primary" @click="editRow({})">新增</el-button>
      <el-button>导入</el-button>
      <el-button>导出</el-button>
    </div>
    <o-table ref="tableRef" :columns="columns" :data="data" :total="total" />
    <TaskDialog ref="taskDialogRef" @success="init" />
  </div>
</template>
