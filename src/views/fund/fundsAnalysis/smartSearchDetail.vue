<script setup lang="ts">
import { computed, getCurrentInstance, reactive, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { copyTextToClipboard } from '@pureadmin/utils'
import { $toast } from '@oeos-components/utils'
import { bankCustomerPageList, fileContextInfo, getTransList } from '@/api/analysis'
import { buildDescriptionOptions } from '@/utils/gFunc'
import { useMethods, useRelativeHeight, useTablePagination } from '@/hooks'
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

const caseId = String(route.query.caseId || '')
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 320, offset: 50 })
const data = ref<Record<string, any>[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRows = ref<Record<string, any>[]>([])
const selectedCount = computed(() => selectedRows.value.length)
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

const mainColumns = computed(() => {
  return (intelligentTableColumns as any[]).concat([
    {
      key: 'operation',
      label: '操作',
      fixed: 'right',
      btns: [
        { content: '查看原信息', handler: openSourceDialog },
        { handler: openMainDetail, ...proxy.setDetailAttrs() },
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
      btns: [{ handler: openSourceDetail, ...proxy.setDetailAttrs() }],
    },
  ])
})

const recordDescOptions = computed(() => buildDescriptionOptions(recordDetailFields.value, recordDetailData.value))

function clearSelected() {
  selectedRows.value = []
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

function openMainDetail({ row }: { row: Record<string, any> }) {
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

async function openSourceDialog({ row }: { row: Record<string, any> }) {
  currentRecord.value = row
  sourceActiveTab.value = 'bankCustomerPageList'
  sourceParams.pageNo = 1
  sourceVisible.value = true
  await loadSourceData()
}

function openSourceDetail({ row }: { row: Record<string, any> }) {
  recordDetailTitle.value = `${sourceTabLabelMap[sourceActiveTab.value]}详情`
  recordDetailFields.value = sourceDetailFieldMap[sourceActiveTab.value] || []
  recordDetailData.value = row || {}
  recordDetailVisible.value = true
}

const { handlePageUpdate: handleUpdate } = useTablePagination(queryParams, (pageNo) => {
  queryParams.pageNo = pageNo
  return fetchList()
})
const { handlePageUpdate: handleSourceUpdate } = useTablePagination(sourceParams, (pageNo) => {
  sourceParams.pageNo = pageNo
  return loadSourceData()
})

watch(sourceActiveTab, async () => {
  if (!sourceVisible.value) return
  sourceParams.pageNo = 1
  await loadSourceData()
})

fetchList()
</script>

<template>
  <div ref="pageRef" class="smart-page">
    <div class="smart-page__header">
      <SmartSearch :columns="searchConditionColumns" :caseId="caseId" @query="handleSearch" @reset="handleReset" />
      <o-flex class="mt-3" gap="8">
        <gSelectedCount :count="selectedCount" @clear="clearSelected" />
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

    <div ref="tableSectionRef" class="smart-page__table">
      <o-table
        v-model="selectedRows"
        selection-type="multiple"
        :height="tableHeight"
        :columns="mainColumns"
        :data="data"
        :total="total"
        :loading="loading"
        :showIndex="false"
        :pageNumber="queryParams.pageNo"
        row-key="id"
        @update="handleUpdate"
      >
        <template #transAmt="{ value }">
          {{ value || value === 0 ? Number(value).toLocaleString() : '-' }}
        </template>
      </o-table>
    </div>

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
          :pageNumber="sourceParams.pageNo"
          @update="handleSourceUpdate"
        />
      </o-flex>
    </o-dialog>

    <o-dialog v-model="recordDetailVisible" :title="recordDetailTitle" width="1200px" :showConfirm="false">
      <o-descriptions :options="recordDescOptions" :column="3" label-width="auto" :showAll="true" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.smart-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.smart-page__header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.smart-page__table {
  min-height: 0;
}

.smart-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
