<script setup lang="ts">
import { computed, getCurrentInstance, reactive, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { copyTextToClipboard } from '@pureadmin/utils'
import { $toast } from '@oeos-components/utils'
import { bankCustomerPageList, fileContextInfo, getTransList } from '@/api/analysis'
import { useMethods, useGlobalTablePageSize } from '@/hooks'
import SmartSearch from './smartSearch.vue'
import {
  intelligentDetailFields,
  intelligentTableColumns,
  searchConditionColumns,
  sourceColumnsMap,
  sourceDetailFieldMap,
  sourceTabLabelMap,
} from './schema'

const route = useRoute()
const { proxy } = getCurrentInstance()
const { exportXls } = useMethods()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const caseId = String(route.query.caseId || '')
const headerRef = useTemplateRef('headerRef')
const tableRef = ref()
const data = ref<Record<string, any>[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRows = ref<Record<string, any>[]>([])
const conditionJson = ref('')
const archiveVisible = ref(false)
const archiveText = ref('')
const sourceVisible = ref(false)
const sourceActiveTab = ref<keyof typeof sourceTabLabelMap>('bankCustomerPageList')
const currentRecord = ref<Record<string, any> | null>(null)
const sourceLoading = ref(false)
const sourceData = ref<Record<string, any>[]>([])
const sourceTotal = ref(0)
const sourceParams = reactive({
  pageNo: 1,
  pageSize: 10,
})
const recordDetailVisible = ref(false)
const recordDetailTitle = ref('详情信息')
const recordDetailFields = ref<{ label: string; prop: string }[]>([])
const recordDetailData = ref<Record<string, any>>({})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
})
syncPageSize(queryParams)
syncPageSize(sourceParams)

const mainColumns = computed(() => {
  return (intelligentTableColumns as any[]).concat([
    {
      key: 'operation',
      label: '操作',
      fixed: 'right',
      btns: [
        { content: '查看原信息', handler: openSourceDialog },
        { content: '详情', handler: openMainDetail },
      ],
    },
  ])
})

const sourceColumns = computed(() => {
  return ((sourceColumnsMap[sourceActiveTab.value] || []) as any[]).concat([
    {
      key: 'operation',
      label: '操作',
      fixed: 'right',
      width: 100,
      btns: [{ content: '详情', handler: openSourceDetail }],
    },
  ])
})

const recordDescOptions = computed(() =>
  recordDetailFields.value.map((item) => ({
    label: item.label,
    value: recordDetailData.value?.[item.prop] ?? '--',
  })),
)

function handleSelectionChange(rows: Record<string, any>[]) {
  selectedRows.value = rows
}

async function fetchList() {
  if (!caseId) return
  loading.value = true
  try {
    const res = await getTransList({
      caseId,
      ids: [],
      conditionJson: conditionJson.value || undefined,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
    })
    data.value = res?.records || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

async function handleSearch(params: any) {
  queryParams.pageNo = 1
  conditionJson.value = params ? JSON.stringify({ grouproot: params }) : ''
  await fetchList()
}

async function handleReset() {
  queryParams.pageNo = 1
  conditionJson.value = ''
  await fetchList()
}

async function handleUpdate(pageNo: number, pageSize: number) {
  queryParams.pageNo = pageNo
  updatePageSize(queryParams, pageSize)
  await fetchList()
}

function exportCurrentPage() {
  exportXls(
    '智能查询数据列表',
    'fa/caseStandardData/exportXls',
    {
      caseId,
      ids: data.value.map((item) => item.id),
      conditionJson: conditionJson.value || undefined,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
    },
    false,
    'post',
  )
}

function exportSelectedRows() {
  if (!selectedRows.value.length) {
    $toast('请先选择要导出的数据', 'w')
    return
  }
  exportXls(
    '智能查询数据列表',
    'fa/caseStandardData/exportXls',
    {
      caseId,
      ids: selectedRows.value.map((item) => item.id),
      conditionJson: conditionJson.value || undefined,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
    },
    false,
    'post',
  )
}

function exportAllRows() {
  exportXls(
    '智能查询全部数据',
    'fa/caseStandardData/exportXls',
    {
      caseId,
      ids: [],
      conditionJson: conditionJson.value || undefined,
      pageNo: 1,
      pageSize: total.value || queryParams.pageSize,
      exportAll: true,
    },
    false,
    'post',
  )
}

async function generateArchive() {
  if (!selectedRows.value.length) {
    $toast('请先选择要生成的数据', 'w')
    return
  }
  const res = await fileContextInfo({
    caseId,
    ids: selectedRows.value.map((item) => item.id),
    conditionJson: conditionJson.value || undefined,
    pageNo: queryParams.pageNo,
    pageSize: queryParams.pageSize,
  })
  archiveText.value = typeof res === 'string' ? res : JSON.stringify(res, null, 2)
  archiveVisible.value = true
}

function copyArchive() {
  const success = copyTextToClipboard(archiveText.value)
  $toast(success ? '复制成功' : '复制失败', success ? 's' : 'e')
}

function openMainDetail(row: Record<string, any>) {
  recordDetailTitle.value = '详情信息'
  recordDetailFields.value = intelligentDetailFields
  recordDetailData.value = row || {}
  recordDetailVisible.value = true
}

async function loadSourceData() {
  if (!currentRecord.value) return
  sourceLoading.value = true
  try {
    const sendData: Record<string, any> = {
      caseId,
      filePageId: currentRecord.value.caseFilePageId,
      rowNum: currentRecord.value.rowNum,
      pageNo: sourceParams.pageNo,
      pageSize: sourceParams.pageSize,
    }

    if (['bankCustomerPageList', 'nonBankCustomerPageList'].includes(sourceActiveTab.value)) {
      if (!currentRecord.value.customerCd) {
        $toast('客户号为空，数据不完整', 'w')
        sourceData.value = []
        sourceTotal.value = 0
        return
      }
      sendData.customerCd = currentRecord.value.customerCd
    }

    const res = await bankCustomerPageList(sourceActiveTab.value, sendData)
    sourceData.value = res?.records || []
    sourceTotal.value = res?.total || 0
  } finally {
    sourceLoading.value = false
  }
}

async function openSourceDialog(row: Record<string, any>) {
  currentRecord.value = row
  sourceActiveTab.value = 'bankCustomerPageList'
  sourceParams.pageNo = 1
  sourceVisible.value = true
  await loadSourceData()
}

async function handleSourceUpdate(pageNo: number, pageSize: number) {
  sourceParams.pageNo = pageNo
  updatePageSize(sourceParams, pageSize)
  await loadSourceData()
}

function openSourceDetail(row: Record<string, any>) {
  recordDetailTitle.value = `${sourceTabLabelMap[sourceActiveTab.value]}详情`
  recordDetailFields.value = sourceDetailFieldMap[sourceActiveTab.value] || []
  recordDetailData.value = row || {}
  recordDetailVisible.value = true
}

watch(sourceActiveTab, async () => {
  if (!sourceVisible.value) return
  sourceParams.pageNo = 1
  await loadSourceData()
})

fetchList()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div class="smart-page">
    <div ref="headerRef" class="smart-page__header">
      <SmartSearch :columns="searchConditionColumns" :caseId="caseId" @query="handleSearch" @reset="handleReset" />
      <o-flex class="mt-3" gap="8">
        <o-button type="primary" icon="el-icon-download" @click="exportCurrentPage">导出本页数据</o-button>
        <o-button type="primary" icon="el-icon-select" :disabled="!selectedRows.length" @click="exportSelectedRows">
          导出选择数据
        </o-button>
        <o-button type="primary" icon="el-icon-folder-opened" @click="exportAllRows">导出全部数据</o-button>
        <o-button type="primary" icon="el-icon-document" :disabled="!selectedRows.length" @click="generateArchive">
          生成卷宗信息
        </o-button>
      </o-flex>
    </div>

    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="mainColumns"
      :data="data"
      :total="total"
      :loading="loading"
      :showIndex="false"
      :pageSize="queryParams.pageSize"
      :pageNumber="queryParams.pageNo"
      row-key="id"
      @selection-change="handleSelectionChange"
      @update="handleUpdate"
    >
      <el-table-column type="selection" width="58" align="center" />
      <template #transAmt="{ value }">
        {{ value || value === 0 ? Number(value).toLocaleString() : '--' }}
      </template>
    </o-table>

    <o-dialog v-model="archiveVisible" title="卷宗信息预览" width="1200px" :showConfirm="false">
      <el-input v-model="archiveText" type="textarea" :rows="14" />
      <div class="smart-page__dialog-footer">
        <el-button icon="el-icon-close" @click="archiveVisible = false">关闭</el-button>
        <el-button type="primary" icon="el-icon-document-copy" @click="copyArchive">复制</el-button>
      </div>
    </o-dialog>

    <o-dialog v-model="sourceVisible" title="查看原信息" width="1200px" fillSlot :showConfirm="false">
      <o-flex direction="column" class="h-100%">
        <el-tabs v-model="sourceActiveTab">
          <el-tab-pane v-for="(label, key) in sourceTabLabelMap" :key="key" :label="label" :name="key" />
        </el-tabs>
        <o-table
          class="f-1"
          style="min-height: 0"
          :columns="sourceColumns"
          :data="sourceData"
          :loading="sourceLoading"
          :total="sourceTotal"
          height="100%"
          :pageSize="sourceParams.pageSize"
          :pageNumber="sourceParams.pageNo"
          @update="handleSourceUpdate"
        />
      </o-flex>
    </o-dialog>

    <o-dialog v-model="recordDetailVisible" :title="recordDetailTitle" width="1200px" :showConfirm="false">
      <o-descriptions :options="recordDescOptions" :column="2" label-width="auto" :showAll="true" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.smart-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.smart-page__header {
  margin-bottom: 12px;
}

.smart-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
