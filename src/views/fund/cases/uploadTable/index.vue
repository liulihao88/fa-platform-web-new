<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import CaseUploadFile from '@/views/fund/cases/uploadTable/caseUploadFile.vue'
import TextMapping from '@/views/fund/cases/uploadTable/textMapping.vue'
import { getCasefileList, deleteCasefile } from '@/api/analysis.ts'
import { getStorage } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()

import { useDetail } from '@/hooks'
const { toDetail } = useDetail()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 进度条显示规则
const progressMap = {
  '000': 0,
  '002': 0,
  '003': 25,
  '100': 50,
  '101': 75,
  '102': 100,
}

const total = ref(0)
const data = ref([])
const init = async () => {
  let params = {
    pageNo: 1,
    pageSize: 10,
    caseId: getStorage('caseId'),
    folder: '',
    fileName: '',
  }
  let res = await getCasefileList(params)
  data.value = res.records ?? []
  total.value = res.total
}
init()

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

function translateRow(row) {
  console.log(`37 row`, row)
}
function textRow(row) {
  toDetail('TextMapping', { fileId: row.id })
}

async function deleteRow(row) {
  await deleteCasefile({ fileId: row.id })
  init()
}
</script>

<template>
  <CaseUploadFile class="mb" @close="init" />
  <o-table ref="tableRef" :columns="columns" :data="data" :total="total">
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
