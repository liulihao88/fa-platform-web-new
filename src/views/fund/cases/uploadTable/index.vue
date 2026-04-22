<script setup lang="tsx">
import { ref, getCurrentInstance, useTemplateRef, computed } from 'vue'
import CaseUploadFile from '@/views/fund/cases/uploadTable/caseUploadFile.vue'
import { getCasefileList, deleteCasefile, deleteBatchCasefile } from '@/api/analysis.ts'
import { getStorage, $toast, clone } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()
const caseUploadFileRef = useTemplateRef('caseUploadFileRef')
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const selectedRows = ref<any[]>([])

import { useAsyncTask, useDetail, useTablePagination, usePolling, useRelativeHeight } from '@/hooks'
const { toDetail } = useDetail()
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 320, offset: 62 })
const { loading, run } = useAsyncTask()

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

const validStatuses = ['101', '102']
const configStatuses = ['003']
const loadingStatuses = ['000', '100', '001', '002', '004', '005']
const errorStatuses = ['900', '901', '902', '904', '999']

const textMappingValidStatuses = ['003', '100', '101', '904', '102']
const textMappingLoadingStatuses = ['000', '001', '002', '004', '005']
const textMappingErrorStatuses = ['900', '901', '902', '999']

/**
   fa_file_process_status
   [
  {
    value: '102',
    text: '合并完成',
    color: null,
    jsonObject: null,
    title: '合并完成',
    label: '合并完成',
  },
  {
    value: '100',
    text: '配置完成',
    color: null,
    jsonObject: null,
    title: '配置完成',
    label: '配置完成',
  },
  {
    value: '904',
    text: '转换异常',
    color: null,
    jsonObject: null,
    title: '转换异常',
    label: '转换异常',
  },
  {
    value: '201',
    text: '处理完成',
    color: null,
    jsonObject: null,
    title: '处理完成',
    label: '处理完成',
  },
  {
    value: '101',
    text: '解析完成',
    color: null,
    jsonObject: null,
    title: '解析完成',
    label: '解析完成',
  },
  {
    value: '900',
    text: '解压失败',
    color: null,
    jsonObject: null,
    title: '解压失败',
    label: '解压失败',
  },
  {
    value: '005',
    text: '待覆盖',
    color: null,
    jsonObject: null,
    title: '待覆盖',
    label: '待覆盖',
  },
  {
    value: '004',
    text: '待删除',
    color: null,
    jsonObject: null,
    title: '待删除',
    label: '待删除',
  },
  {
    value: '003',
    text: '入库完成',
    color: null,
    jsonObject: null,
    title: '入库完成',
    label: '入库完成',
  },
  {
    value: '002',
    text: '待入库',
    color: null,
    jsonObject: null,
    title: '待入库',
    label: '待入库',
  },
  {
    value: '001',
    text: '待验证',
    color: null,
    jsonObject: null,
    title: '待验证',
    label: '待验证',
  },
  {
    value: '000',
    text: '待解压',
    color: null,
    jsonObject: null,
    title: '待解压',
    label: '待解压',
  },
  {
    value: '999',
    text: '忽略处理',
    color: null,
    jsonObject: null,
    title: '忽略处理',
    label: '忽略处理',
  },
  {
    value: '902',
    text: '入库异常',
    color: null,
    jsonObject: null,
    title: '入库异常',
    label: '入库异常',
  },
  {
    value: '901',
    text: '格式不支持',
    color: null,
    jsonObject: null,
    title: '格式不支持',
    label: '格式不支持',
  },
]
   */
const statusMap: any = {
  '900': ['900', '901', '902', '904', '999'], // 转换失败
  '003': ['003'], // 待配置
  '001': ['000', '001', '002', '004', '005', '100', '101'], // 自动进行中
  '102': ['102', '201'], // 已完成
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
const selectedCount = computed(() => selectedRows.value.length)
const autoRefreshStatuses = ['000', '001', '002', '003', '004', '005', '100', '101']

const shouldPolling = computed(() => {
  return data.value.some((item) => autoRefreshStatuses.includes(item.status))
})

const { start: startPolling, stop: stopPolling } = usePolling(async () => {
  await init()
}, 5000)

async function init(isReset = false) {
  if (isReset) {
    baseSearch.value.pageNo = 1
  }
  await run(async () => {
    const sendParams = clone(baseSearch.value)
    sendParams.fileStatus = baseSearch.value.fileStatus ? statusMap[baseSearch.value.fileStatus] : []
    const res = await getCasefileList(sendParams)
    data.value = res.records ?? []
    total.value = res.total ?? 0
  })

  if (shouldPolling.value) {
    startPolling()
  } else {
    stopPolling()
  }
}

const { handlePageUpdate: update } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.value.pageNo = pageNo
  return init()
})

init()
const clearSelected = () => {
  selectedRows.value = []
}
const deleteBatchRows = async () => {
  const ids = selectedRows.value.map((item) => item.id)
  await deleteBatchCasefile({
    caseId: baseSearch.value.caseId,
    ids,
  })
  clearSelected()
  init(true)
}
const openUploadDialog = () => {
  caseUploadFileRef?.value?.open()
}
const moreBtns = [
  {
    content: '上传文件',
    type: 'primary',
    icon: 'el-icon-upload',
    handler: openUploadDialog,
  },
  {
    content: '批量删除',
    type: 'primary',
    reConfirm: !proxy.$dev,
    icon: 'el-icon-delete',
    handler: deleteBatchRows,
    disabled: () => selectedCount.value === 0,
    isShow: () => selectedCount.value !== 0,
  },
]

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
    minWidth: 150,
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
    ...proxy.renderProgressColumn({
      prop: 'status',
      progressMap: {
        '000': 0,
        '900': 0,
        '901': 0,
        '902': 0,
        '904': 0,
        '999': 0,
        '003': 25,
        '100': 50,
        '001': 50,
        '002': 50,
        '004': 50,
        '005': 50,
        '101': 75,
        '102': 100,
      },
    }),
  },
  {
    ...proxy.renderProgressColumn({
      label: '配置进度',
      prop: 'configureProgress',
      progressMap: null,
    }),
  },
  {
    label: '返回信息',
    prop: 'returnInfo',
    minWidth: 120,
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
  },
  {
    label: '去重行数',
    prop: 'repeatDataNum',
    width: 100,
    render: proxy.renderWarnNumber,
  },

  {
    key: 'operation',
    label: '操作',
    width: 180,
    btns: [
      {
        content: '字段映射',
        render: ({ row }) => {
          const disabled = !checkFilesNames(row)
          const type = getTextMappingStatusType(row)

          return (
            <span
              style={{
                color: type === 'primary' ? 'var(--blue)' : 'red',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
              onClick={() => {
                if (disabled) return
                textRow(row)
              }}
            >
              字段映射
            </span>
          )
        },
      },
      {
        content: '转换查看',
        render: ({ row }) => {
          const disabled = !checkFilesNames(row)
          const type = getTranslateStatusType(row)

          return (
            <span
              style={{
                color: type === 'primary' ? 'var(--blue)' : 'red',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
              onClick={() => {
                if (disabled) return
                translateRow(row)
              }}
            >
              转换查看
            </span>
          )
        },
      },
      {
        handler: deleteRow,
        ...proxy.setDeleteAttrs(),
      },
    ],
  },
]

function getTranslateStatusType(record) {
  return validStatuses.includes(record.status) ? 'primary' : 'danger'
}

function getTextMappingStatusType(record) {
  return textMappingValidStatuses.includes(record.status) ? 'primary' : 'danger'
}

function handleStatusPromise(record) {
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
  return new Promise((resolve, reject) => {
    if (textMappingValidStatuses.includes(record.status)) {
      // 状态允许打开模态框
      return resolve(record)
    } else if (textMappingLoadingStatuses.includes(record.status)) {
      // 文件正在加载中
      $toast('文件正在加载中，请稍后', 'w')
    } else if (textMappingErrorStatuses.includes(record.status)) {
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

async function deleteRow({ row }) {
  await deleteCasefile({ fileId: row.id })
  init(true)
}
</script>

<template>
  <div ref="pageRef" class="upload-table-page">
    <CaseUploadFile ref="caseUploadFileRef" class="mb" @close="init" />
    <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
      <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
      <g-more-button :btns="moreBtns" mode="opt" trigger="hover" />
    </g-search-bar>
    <div ref="tableSectionRef" class="upload-table-page__table">
      <o-table
        v-model="selectedRows"
        selection-type="multiple"
        :columns="columns"
        :data="data"
        :total="total"
        :isLoading="true"
        :height="tableHeight"
        :pageSize="baseSearch.pageSize"
        :pageNumber="baseSearch.pageNo"
        row-key="id"
        @update="update"
      >
        <template #status="{ value }">
          <o-tag :type="new Set([...errorStatuses, ...textMappingErrorStatuses]).has(value) ? 'danger' : 'primary'">
            {{ getDictItems('fa_file_process_status').find((v) => v.value === value).text }}
          </o-tag>
        </template>
      </o-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.upload-table-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.upload-table-page__table {
  min-height: 0;
}
</style>
