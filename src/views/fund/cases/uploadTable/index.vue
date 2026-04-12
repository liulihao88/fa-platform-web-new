<script setup lang="ts">
import { ref, getCurrentInstance, useTemplateRef, computed } from 'vue'
import CaseUploadFile from '@/views/fund/cases/uploadTable/caseUploadFile.vue'
import TextMapping from '@/views/fund/cases/uploadTable/textMapping.vue'
import { getCasefileList, deleteCasefile } from '@/api/analysis.ts'
import { getStorage, $toast, clone } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()
const caseUploadFileRef = useTemplateRef('caseUploadFileRef')

import { useDetail, useGlobalTablePageSize, usePolling } from '@/hooks'
const { toDetail } = useDetail()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const baseSearch = ref({
  fileStatus: '',
  pageNo: 1,
  pageSize: 10,
  caseId: getStorage('caseId'),
  fileName: '',
  folder: '',
})
syncPageSize(baseSearch.value)

// 进度条显示规则
const progressMap = {
  '000': 0,
  '002': 0,
  '003': 25,
  '100': 50,
  '101': 75,
  '102': 100,
}

/**
   * 下拉菜单	查询状态
转换失败	900 解压失败
	901 格式不支持
	902 入库异常
	904 转换异常
	9字开头
自动运行中	001	待验证
	002	待入库
	100	配置完成
	101	解析完成
待配置	003	入库完成
已完成	102	合并完成
   */
const statusMap: any = {
  '900': ['900', '901', '902', '904', '999', '201'],
  '001': ['000', '001', '002', '004', '005', '100'],
  '003': ['003'],
  '102': ['101', '102'],
}

const filterStatusOptions = computed(() => {
  let statusOptions = getDictItems('fa_file_process_status')
  if (!statusOptions || statusOptions.length === 0) {
    return []
  }
  let resultOptions: any = []
  statusOptions.forEach((v) => {
    if (statusMap['900'].includes(v.value)) {
      if (!resultOptions.some((option) => option.value === '900')) {
        resultOptions.push({
          label: '转换失败',
          value: '900',
        })
      }
    }
    if (statusMap['001'].includes(v.value)) {
      if (!resultOptions.some((option) => option.value === '001')) {
        resultOptions.push({
          label: '自动运行中',
          value: '001',
        })
      }
    }
    if (['003'].includes(v.value)) {
      resultOptions.push({
        label: '待配置',
        value: '003',
      })
    }
    if (['102'].includes(v.value)) {
      resultOptions.push({
        label: '已完成',
        value: '102',
      })
    }
  })
  return resultOptions
})

const items = [
  // {
  //   label: '文件名称',
  //   prop: 'fileName',
  //   type: 'input',
  // },
  {
    label: '文件名称/文件夹',
    prop: 'folder',
    type: 'input',
  },
  {
    label: '状态',
    prop: 'fileStatus',
    type: 'select',
    options: filterStatusOptions.value,
  },
]

const handleSearch = (form) => {
  baseSearch.value.pageNo = 1
  baseSearch.value.fileStatus = form?.fileStatus
  baseSearch.value.folder = form?.folder
  baseSearch.value.fileName = form?.fileName
  init()
}

const total = ref(0)
const data = ref([])
const autoRefreshStatuses = ['000', '001', '002', '003', '004', '005', '100', '101']

const shouldPolling = computed(() => {
  return data.value.some((item) => autoRefreshStatuses.includes(item.status))
})

const { start: startPolling, stop: stopPolling } = usePolling(async () => {
  await init()
}, 15000)

const init = async (isReset = false) => {
  if (isReset) {
    baseSearch.value.pageNo = 1
  }
  const sendParams = clone(baseSearch.value)
  sendParams.fileStatus = baseSearch.value.fileStatus ? statusMap[baseSearch.value.fileStatus] : []
  let res = await getCasefileList(sendParams)
  data.value = res.records ?? []
  total.value = res.total

  if (shouldPolling.value) {
    startPolling()
  } else {
    stopPolling()
  }
}
init()

const update = (pageNo: number, pageSize: number) => {
  baseSearch.value.pageNo = pageNo
  updatePageSize(baseSearch.value, pageSize)
  init()
}

const checkFilesNames = (record) => {
  const { sourceFile, fileName } = record
  const lowerFile1 = sourceFile.toLowerCase()
  const lowerFile2 = fileName.toLowerCase()

  return !(
    lowerFile1.endsWith('.zip') ||
    lowerFile1.endsWith('.rar') ||
    lowerFile2.endsWith('.zip') ||
    lowerFile2.endsWith('.rar')
  )
}

const editRow = (row) => {}
const columns = [
  {
    label: '源文件',
    prop: 'sourceFile',
    width: 200,
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
    prop: 'progress',
    width: 100,
    useSlot: true,
  },
  {
    label: '配置进度',
    prop: 'configureProgress',
    width: 100,
    useSlot: true,
  },
  {
    label: '返回信息',
    prop: 'returnInfo',
    width: 150,
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
    btns: [
      {
        content: '字段映射',
        handler: textRow,
        disabled: (row) => !checkFilesNames(row),
      },
      {
        content: '转换查看',
        handler: translateRow,
        disabled: (row) => !checkFilesNames(row),
      },
      {
        handler: deleteRow,
        ...proxy.getDeleteAttrs(),
      },
    ],
  },
]

function handleStatusPromise(record) {
  // 定义可打开模态框的状态
  const validStatuses = ['101', '102']
  // 定义配置中的状态
  const configStatuses = ['003']
  // 定义加载中的状态
  const loadingStatuses = ['000', '100', '001', '002', '004', '005']
  // 定义错误状态
  const errorStatuses = ['900', '901', '902', '904', '999']
  return new Promise((resolve, reject) => {
    if (validStatuses.includes(record.status)) {
      // // 状态允许打开模态框
      return resolve(record)
    } else if (configStatuses.includes(record.status)) {
      // 文件正在配置中
      $toast('请配置完成后操作', 'w')
    } else if (loadingStatuses.includes(record.status)) {
      // 文件正在加载中
      $toast('文件数据正在解析中，请稍后', 'w')
    } else if (errorStatuses.includes(record.status)) {
      // 文件加载错误
      $toast('文件加载错误，请修改后再运行', 'e')
    } else {
      // 其他状态默认提示
      $toast('当前状态不支持转换查看', 'w')
    }
    return reject(record)
  })
}

// 新增：处理标题配置按钮点击事件
const handleTitleConfigClick = (record) => {
  // 定义可打开模态框的状态
  const validStatuses = ['003', '100', '101', '904', '102']
  // 定义加载中的状态
  const loadingStatuses = ['000', '001', '002', '004', '005']
  // 定义错误状态
  const errorStatuses = ['900', '901', '902', '999']
  return new Promise((resolve, reject) => {
    if (validStatuses.includes(record.status)) {
      // 状态允许打开模态框
      return resolve(record)
    } else if (loadingStatuses.includes(record.status)) {
      // 文件正在加载中
      $toast('文件正在加载中，请稍后', 'w')
    } else if (errorStatuses.includes(record.status)) {
      // 文件加载错误
      $toast('文件加载错误，请修改后再配置', 'e')
    } else {
      // 其他状态默认提示
      $toast('当前状态不支持标题配置', 'w')
    }
    return reject(record)
  })
}

async function translateRow(record) {
  await handleStatusPromise(record)
  toDetail('TranslateView', { fileId: record.id })
}
async function textRow(row) {
  await handleTitleConfigClick(row)
  toDetail('TextMapping', { fileId: row.id })
}

async function deleteRow(row) {
  await deleteCasefile({ fileId: row.id })
  init(true)
}
</script>

<template>
  <CaseUploadFile ref="caseUploadFileRef" class="mb" @close="init" />
  <g-search-bar :items="items" class="f-1 mb2" @search="handleSearch" @reset="handleSearch">
    <o-button type="primary" icon="el-icon-upload" width="100" class="ml2" @click="caseUploadFileRef?.open()">
      上传文件
    </o-button>
  </g-search-bar>
  <o-table
    ref="tableRef"
    :columns="columns"
    :data="data"
    :total="total"
    height="460"
    :pageSize="baseSearch.pageSize"
    :pageNumber="baseSearch.pageNo"
    @update="update"
  >
    <template #status="{ row, value }">
      <el-tag v-if="['900', '901', '902', '904', '999'].includes(value)" type="danger">
        {{ getDictItems('fa_file_process_status').find((v) => v.value === value).text }}
      </el-tag>
      <el-tag v-else type="primary">
        {{ getDictItems('fa_file_process_status').find((v) => v.value === value).text }}
      </el-tag>
    </template>
    <template #progress="{ row }">
      <o-progress :percentage="progressMap[row.status] ?? 0" :text-inside="true" />
    </template>
    <template #configureProgress="{ value }">
      <o-progress :percentage="value ?? 0" :text-inside="true" />
    </template>
  </o-table>
</template>
