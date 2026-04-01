<script setup lang="ts">
import { ref, getCurrentInstance, useTemplateRef } from 'vue'
import CaseUploadFile from '@/views/fund/cases/uploadTable/caseUploadFile.vue'
import TextMapping from '@/views/fund/cases/uploadTable/textMapping.vue'
import { getCasefileList, deleteCasefile } from '@/api/analysis.ts'
import { getStorage, $toast } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()
const caseUploadFileRef = useTemplateRef('caseUploadFileRef')

import { useDetail } from '@/hooks'
const { toDetail } = useDetail()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const baseSearch = {
  status: '',
  pageNo: 1,
  pageSize: 10,
  caseId: getStorage('caseId'),
  fileName: '',
  folder: '',
}

// 进度条显示规则
const progressMap = {
  '000': 0,
  '002': 0,
  '003': 25,
  '100': 50,
  '101': 75,
  '102': 100,
}

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
    prop: 'status',
    type: 'select',
    dict: 'fa_file_process_status',
  },
]

const handleSearch = (form) => {
  console.log(`07 form`, form)
  baseSearch.status = form?.status
  baseSearch.folder = form?.folder
  baseSearch.fileName = form?.fileName
  init()
}

const total = ref(0)
const data = ref([])
const init = async () => {
  let res = await getCasefileList(baseSearch)
  data.value = res.records ?? []
  total.value = res.total
}
init()

const update = (pageNo: number, pageSize: number) => {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
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
    width: 150,
  },
  {
    label: '文件夹',
    prop: 'folder',
  },
  {
    label: '状态',
    prop: 'status',
    useSlot: true,
    width: 100,
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
    width: 200,
    btns: [
      {
        content: '字段映射',
        handler: textRow,
        isShow: checkFilesNames,
      },
      {
        content: '转换查看',
        handler: translateRow,
        isShow: checkFilesNames,
      },
      {
        content: '删除',
        handler: deleteRow,
        reConfirm: !proxy.$dev,
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          type: 'svg',
          content: '删除',
        },
      },
    ],
  },
]

function handleStatusPromise(record) {
  return new Promise((resolve, reject) => {
    // 定义可打开模态框的状态
    const validStatuses = ['101', '102']
    // 定义配置中的状态
    const configStatuses = ['003']
    // 定义加载中的状态
    const loadingStatuses = ['000', '100', '001', '002', '004', '005']
    // 定义错误状态
    const errorStatuses = ['900', '901', '902', '904', '999']
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

async function translateRow(record) {
  await handleStatusPromise(record)
  toDetail('TranslateView', { fileId: record.id })
}
async function textRow(row) {
  await handleStatusPromise(row)
  toDetail('TextMapping', { fileId: row.id })
}

async function deleteRow(row) {
  await deleteCasefile({ fileId: row.id })
  init()
}
</script>

<template>
  <CaseUploadFile ref="caseUploadFileRef" class="mb" @close="init" />
  <o-flex class="w-100%">
    <g-search-bar :items="items" :itemsPerRow="4" class="f-1" @search="handleSearch" @reset="handleSearch" />
    <o-button type="primary" icon="el-icon-upload" width="100" class="ml2" @click="caseUploadFileRef?.open()">
      上传文件
    </o-button>
  </o-flex>
  <o-table
    ref="tableRef"
    :columns="columns"
    :data="data"
    :total="total"
    height="460"
    :pageSize="baseSearch.pageSize"
    @update="update"
  >
    <template #status="{ row, value }">
      <el-tag v-if="['900', '901', '902', '904', '999'].includes(value)" type="danger">
        {{ getDictItems('fa_file_process_status').find((v) => v.value === value).text }}
      </el-tag>
      <el-tag type="primary">{{ getDictItems('fa_file_process_status').find((v) => v.value === value).text }}</el-tag>
    </template>
    <template #progress="{ row }">
      <o-progress :percentage="progressMap[row.status] ?? 0" :text-inside="true" />
    </template>
    <template #configureProgress="{ value }">
      <o-progress :percentage="value ?? 0" :text-inside="true" />
    </template>
  </o-table>
</template>
