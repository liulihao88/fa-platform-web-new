<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { copyTextToClipboard } from '@pureadmin/utils'
import { $toast } from '@oeos-components/utils'
import {
  caseInvolvedList,
  entityTransListApi,
  fileContextInfo,
  getCommonDictionary,
  payeeListApi,
} from '@/api/analysis'
import { buildDescriptionOptions } from '@/utils/gFunc'
import { useMethods, useGlobalTablePageSize, useRelativeHeight } from '@/hooks'
import { useCommonHook } from '@/store'
import { intelligentDetailFields, intelligentTableColumns } from './schema'

const route = useRoute()
const { proxy } = getCurrentInstance()
const { exportXls } = useMethods()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()
const { getDictItems, setCommonItems, sysAllDictItems } = useCommonHook()
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 320, offset: 50 })

const caseId = String(route.query.caseId || '')
const tableData = ref<Record<string, any>[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRows = ref<Record<string, any>[]>([])
const fromPickerVisible = ref(false)
const toPickerVisible = ref(false)
const archiveVisible = ref(false)
const archiveText = ref('')
const detailVisible = ref(false)
const detailData = ref<Record<string, any>>({})
const fromTableRef = ref<any>(null)
const toTableRef = ref<any>(null)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orgName: '',
  transAccountNo: '',
  relAccountNo: '',
  accountName: '',
  customerName: '',
  beginDate: '',
  endDate: '',
})
syncPageSize(queryParams)

const extraParams = reactive({
  customerCd: '',
  payeeld: '',
})

const fromPersonSearchForm = reactive({
  pageNo: 1,
  pageSize: 10,
  customerName: '',
  idNum: '',
  cardNum: '',
  accountNum: '',
})
syncPageSize(fromPersonSearchForm)
const fromSelectedRows = ref<Record<string, any>[]>([])
const fromPendingRow = ref<Record<string, any> | null>(null)
const toSelectedRows = ref<Record<string, any>[]>([])
const toPendingRow = ref<Record<string, any> | null>(null)
const fromPersonData = ref<Record<string, any>[]>([])
const toPersonData = ref<Record<string, any>[]>([])
const pickerLoading = ref(false)
const fromPersonTotal = ref(0)
const toPersonTotal = ref(0)

const searchItems = [
  { label: '归属银行', prop: 'orgName', type: 'input', placeholder: '请输入归属银行' },
  { label: '交易账号', prop: 'transAccountNo', type: 'input', placeholder: '请输入交易账号' },
  { label: '相关账号', prop: 'relAccountNo', type: 'input', placeholder: '请输入相关账号' },
  { label: '户名', prop: 'accountName', type: 'input', placeholder: '请输入户名' },
  { label: '客户名称', prop: 'customerName', type: 'input', placeholder: '请输入客户名称' },
  { label: '业务日期范围', prop: 'openDate', type: 'date', dateType: 'daterange', placeholder: '请选择业务日期范围' },
] as any[]

const fromPersonSearchItems = [
  { label: '发起方名称', prop: 'customerName', type: 'input', placeholder: '请输入发起方名称' },
  { label: '证件号码', prop: 'idNum', type: 'input', placeholder: '请输入证件号码' },
  { label: '发起方卡号', prop: 'cardNum', type: 'input', placeholder: '请输入发起方卡号' },
  { label: '发起方账号', prop: 'accountNum', type: 'input', placeholder: '请输入发起方账号', span: 4 },
] as any[]

const fromPersonIndexMethod = (index: number) =>
  (fromPersonSearchForm.pageNo - 1) * fromPersonSearchForm.pageSize + index + 1

const personColumns = [
  { prop: 'radio', width: 58, align: 'center', useSlot: true },
  { type: 'index', width: 70, label: '序号', index: fromPersonIndexMethod },
  { label: '发起方名称', prop: 'customerName', minWidth: 160 },
  { label: '发起方种类', prop: 'involvedKind', minWidth: 120, useSlot: true },
  { label: '证件号码', prop: 'idNum', minWidth: 180 },
  { label: '发起方卡号', prop: 'cardNum', minWidth: 160 },
  { label: '发起方账号', prop: 'accountNum', minWidth: 160 },
] as any[]

const payeeColumns = [
  { prop: 'radio', width: 58, align: 'center', useSlot: true },
  { label: '交易对方卡号', prop: 'counterCardNum', minWidth: 160 },
  { label: '交易对方名称', prop: 'counterName', minWidth: 160 },
  { label: '交易对方账号', prop: 'counterAccountNo', minWidth: 160 },
  { label: '对方机构名称', prop: 'counterOrgName', minWidth: 180 },
] as any[]

const toPersonSearchForm = reactive({
  pageNo: 1,
  pageSize: 10,
  counterName: '',
  counterCardNum: '',
  counterAccountNo: '',
})
syncPageSize(toPersonSearchForm)

const toPersonSearchItems = [
  { label: '交易对方名称', prop: 'counterName', type: 'input', placeholder: '请输入交易对方名称' },
  { label: '对方卡号', prop: 'counterCardNum', type: 'input', placeholder: '请输入对方卡号' },
  { label: '对方账号', prop: 'counterAccountNo', type: 'input', placeholder: '请输入对方账号' },
] as any[]

const mainColumns = computed(() =>
  (intelligentTableColumns as any[]).concat([
    {
      key: 'operation',
      label: '操作',
      fixed: 'right',
      btns: [{ handler: handleDetail, ...proxy.setDetailAttrs() }],
    },
  ]),
)

const detailDescOptions = computed(() => buildDescriptionOptions(intelligentDetailFields, detailData.value))
const kindOptions = computed(() => getDictItems('fa_involved_person_type') || [])

async function ensureDictLoaded(code: string) {
  if ((getDictItems(code) || []).length > 0) return
  const res = await getCommonDictionary(code)
  const items = Array.isArray(res) ? res : res?.result || []
  setCommonItems('sysAllDictItems', {
    ...(sysAllDictItems || {}),
    [code]: items,
  })
}

function getKindText(kind: string | number) {
  return kindOptions.value.find((item) => Number(item.value) === Number(kind))?.label || '嫌疑人'
}

function getKindType(kind: string | number) {
  const typeMap = {
    1: 'success',
    2: 'danger',
    3: 'warning',
  }
  return typeMap[Number(kind)] || 'info'
}

const fromDisplayText = computed(() => {
  const selected = fromSelectedRows.value[0]
  if (!selected) return '请选择交易发起方'
  return selected.customerName || '已选中'
})

const fromSelectedPersonId = computed({
  get: () => fromPendingRow.value?.id || '',
  set: (value: string) => {
    const matchedRow = fromPersonData.value.find((item) => item.id === value) || null
    fromPendingRow.value = matchedRow
    nextTick(() => {
      fromTableRef.value?.$refs?.tableRef?.setCurrentRow(matchedRow || null)
    })
  },
})

const toDisplayText = computed(() => {
  const selected = toSelectedRows.value[0]
  if (!selected) return '请选择交易对方'
  return selected.counterName || '已选中'
})

const toSelectedPayeeId = computed({
  get: () => toPendingRow.value?.id || '',
  set: (value: string) => {
    const matchedRow = toPersonData.value.find((item) => item.id === value) || null
    toPendingRow.value = matchedRow
    nextTick(() => {
      toTableRef.value?.$refs?.tableRef?.setCurrentRow(matchedRow || null)
    })
  },
})

function handleFromCurrentChange(row?: Record<string, any>) {
  fromPendingRow.value = row || null
}

function handleToCurrentChange(row?: Record<string, any>) {
  toPendingRow.value = row || null
}

function handleDetail(record: Record<string, any>) {
  detailData.value = record || {}
  detailVisible.value = true
}

async function fetchList() {
  loading.value = true
  try {
    const res = await entityTransListApi({
      caseId,
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize,
      ...queryParams,
      ...extraParams,
    })
    tableData.value = res?.records || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch(params: Record<string, any>) {
  queryParams.pageNo = 1
  Object.assign(queryParams, {
    orgName: '',
    transAccountNo: '',
    relAccountNo: '',
    accountName: '',
    customerName: '',
    beginDate: '',
    endDate: '',
    ...(params || {}),
  })
  const openDate = params?.openDate
  if (Array.isArray(openDate) && openDate.length === 2) {
    queryParams.beginDate = openDate[0] || ''
    queryParams.endDate = openDate[1] || ''
  }
  delete (queryParams as any).openDate
  fetchList()
}

function handleReset() {
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: queryParams.pageSize,
    orgName: '',
    transAccountNo: '',
    relAccountNo: '',
    accountName: '',
    customerName: '',
    beginDate: '',
    endDate: '',
  })
  fetchList()
}

async function handleUpdate(pageNo: number, pageSize: number) {
  queryParams.pageNo = pageNo
  updatePageSize(queryParams, pageSize)
  await fetchList()
}

function handleSelectionChange(rows: Record<string, any>[]) {
  selectedRows.value = rows
}

function exportCurrentPage() {
  exportXls(
    '涉案人交易查询数据列表',
    'fa/caseStandardData/exportXls',
    { caseId, ids: tableData.value.map((item) => item.id), ...queryParams, ...extraParams },
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
    '涉案人交易查询数据列表',
    'fa/caseStandardData/exportXls',
    { caseId, ids: selectedRows.value.map((item) => item.id), ...queryParams, ...extraParams },
    false,
    'post',
  )
}

function exportAllRows() {
  exportXls(
    '涉案人交易查询全部数据',
    'fa/caseStandardData/exportXls',
    { caseId, ids: [], pageNo: 1, pageSize: total.value || queryParams.pageSize, exportAll: true, ...extraParams },
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

async function loadFromPersons() {
  pickerLoading.value = true
  try {
    const res = await caseInvolvedList({
      caseId,
      pageNo: fromPersonSearchForm.pageNo,
      pageSize: fromPersonSearchForm.pageSize,
      customerName: fromPersonSearchForm.customerName,
      idNum: fromPersonSearchForm.idNum,
      cardNum: fromPersonSearchForm.cardNum,
      accountNum: fromPersonSearchForm.accountNum,
    })
    fromPersonData.value = Array.isArray(res) ? res : res?.records || []
    fromPersonTotal.value = Array.isArray(res) ? res.length : res?.total || 0
    await nextTick()
    syncFromCurrentRow()
  } finally {
    pickerLoading.value = false
  }
}

function syncFromCurrentRow() {
  const current = fromPendingRow.value
  const tableRef = fromTableRef.value?.$refs?.tableRef
  if (!tableRef) return
  if (!current) {
    tableRef.setCurrentRow(null)
    return
  }
  const matchedRow = fromPersonData.value.find((item) => item.id === current.id)
  tableRef.setCurrentRow(matchedRow || null)
}

async function loadToPersons() {
  pickerLoading.value = true
  try {
    const res = await payeeListApi({
      caseId,
      pageNo: toPersonSearchForm.pageNo,
      pageSize: toPersonSearchForm.pageSize,
      counterName: toPersonSearchForm.counterName,
      counterCardNum: toPersonSearchForm.counterCardNum,
      counterAccountNo: toPersonSearchForm.counterAccountNo,
    })
    toPersonData.value = res?.records || res || []
    toPersonTotal.value = res?.total || toPersonData.value.length || 0
    await nextTick()
    syncToCurrentRow()
  } finally {
    pickerLoading.value = false
  }
}

function syncToCurrentRow() {
  const current = toPendingRow.value
  const tableRef = toTableRef.value?.$refs?.tableRef
  if (!tableRef) return
  if (!current) {
    tableRef.setCurrentRow(null)
    return
  }
  const matchedRow = toPersonData.value.find((item) => item.id === current.id)
  tableRef.setCurrentRow(matchedRow || null)
}

async function showFromPerson() {
  fromPendingRow.value = fromSelectedRows.value[0] || null
  fromPickerVisible.value = true
  await loadFromPersons()
}

function handleFromPersonSearch(params: Record<string, any>) {
  Object.assign(fromPersonSearchForm, params || {})
  fromPersonSearchForm.pageNo = 1
  loadFromPersons()
}

function handleFromPersonReset() {
  Object.assign(fromPersonSearchForm, {
    pageNo: 1,
    pageSize: fromPersonSearchForm.pageSize,
    customerName: '',
    idNum: '',
    cardNum: '',
    accountNum: '',
  })
  loadFromPersons()
}

async function handleFromPersonUpdate(pageNo: number, pageSize: number) {
  fromPersonSearchForm.pageNo = pageNo
  updatePageSize(fromPersonSearchForm, pageSize)
  await loadFromPersons()
}

async function showToPerson() {
  toPendingRow.value = toSelectedRows.value[0] || null
  toPickerVisible.value = true
  await loadToPersons()
}

function handleToPersonSearch(params: Record<string, any>) {
  Object.assign(toPersonSearchForm, params || {})
  toPersonSearchForm.pageNo = 1
  loadToPersons()
}

function handleToPersonReset() {
  Object.assign(toPersonSearchForm, {
    pageNo: 1,
    pageSize: toPersonSearchForm.pageSize,
    counterName: '',
    counterCardNum: '',
    counterAccountNo: '',
  })
  loadToPersons()
}

async function handleToPersonUpdate(pageNo: number, pageSize: number) {
  toPersonSearchForm.pageNo = pageNo
  updatePageSize(toPersonSearchForm, pageSize)
  await loadToPersons()
}

async function confirmFromPerson() {
  if (!fromPendingRow.value) {
    $toast('请选择交易发起方', 'w')
    return
  }
  fromSelectedRows.value = [fromPendingRow.value]
  extraParams.customerCd = fromPendingRow.value.id
  fromPickerVisible.value = false
  fetchList()
}

async function confirmToPerson() {
  if (!toPendingRow.value) {
    $toast('请选择交易对方', 'w')
    return
  }
  toSelectedRows.value = [toPendingRow.value]
  extraParams.payeeld = toPendingRow.value.counterCustomerId
  toPickerVisible.value = false
  fetchList()
}

function clearFromPerson() {
  fromPendingRow.value = null
  fromSelectedRows.value = []
  extraParams.customerCd = ''
  fetchList()
}

function clearToPerson() {
  toPendingRow.value = null
  toSelectedRows.value = []
  extraParams.payeeld = ''
  fetchList()
}

const archiveConfirm = () => {
  // archiveVisible.value = true
  copyArchive()
}

fetchList()

onMounted(async () => {
  await ensureDictLoaded('fa_involved_person_type')
})
</script>

<template>
  <div ref="pageRef" class="case-deal-page">
    <div class="case-deal-page__selectors">
      <div class="selector-card">
        <span class="selector-label">交易发起方</span>
        <div class="selector-input-group">
          <div class="selector-value">{{ fromDisplayText }}</div>
          <div class="selector-actions">
            <el-button type="primary" icon="el-icon-plus" circle @click="showFromPerson" />
            <el-button v-if="fromSelectedRows.length" icon="el-icon-close" circle @click="clearFromPerson" />
          </div>
        </div>
      </div>
      <div class="selector-arrow">-></div>
      <div class="selector-card">
        <span class="selector-label">交易对方</span>
        <div class="selector-input-group">
          <div class="selector-value">{{ toDisplayText }}</div>
          <div class="selector-actions">
            <el-button type="primary" icon="el-icon-plus" circle @click="showToPerson" />
            <el-button v-if="toSelectedRows.length" icon="el-icon-close" circle @click="clearToPerson" />
          </div>
        </div>
      </div>
    </div>

    <g-search-bar class="m-tb-16" :items="searchItems" :itemsPerRow="5" @search="handleSearch" @reset="handleReset">
      <o-item-wrapper :columns="2">
        <o-button type="primary" icon="el-icon-download" @click="exportCurrentPage">导出本页数据</o-button>
        <o-button type="primary" icon="el-icon-select" :disabled="!selectedRows.length" @click="exportSelectedRows">
          导出选择数据
        </o-button>
        <o-button type="primary" icon="el-icon-folder-opened" @click="exportAllRows">导出全部数据</o-button>
        <o-button type="primary" icon="el-icon-document" :disabled="!selectedRows.length" @click="generateArchive">
          生成卷宗信息
        </o-button>
      </o-item-wrapper>
    </g-search-bar>

    <div ref="tableSectionRef" class="case-deal-page__table">
      <o-table
        :columns="mainColumns"
        :data="tableData"
        :total="total"
        :loading="loading"
        :showIndex="false"
        :pageSize="queryParams.pageSize"
        :pageNumber="queryParams.pageNo"
        row-key="id"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
        @update="handleUpdate"
      >
        <el-table-column type="selection" width="58" align="center" />
      </o-table>
    </div>

    <o-dialog
      v-model="fromPickerVisible"
      title="选择交易发起方"
      width="1000px"
      fillSlot
      :confirm="confirmFromPerson"
      :enableConfirm="false"
    >
      <o-flex direction="column" class="h-100%">
        <g-search-bar
          class="mb-3"
          :items="fromPersonSearchItems"
          :itemsPerRow="5"
          @search="handleFromPersonSearch"
          @reset="handleFromPersonReset"
        />
        <o-table
          ref="fromTableRef"
          class="f-1"
          style="min-height: 0"
          :columns="personColumns"
          :data="fromPersonData"
          :total="fromPersonTotal"
          :loading="pickerLoading"
          :pageSize="fromPersonSearchForm.pageSize"
          :pageNumber="fromPersonSearchForm.pageNo"
          row-key="id"
          height="100%"
          :showIndex="false"
          highlight-current-row
          @current-change="handleFromCurrentChange"
          @update="handleFromPersonUpdate"
        >
          <template #radio="{ row }">
            <div class="f-ct-ct w-100%">
              <el-radio v-model="fromSelectedPersonId" :value="row.id" />
            </div>
          </template>
          <template #involvedKind="{ value }">
            <o-tag :type="getKindType(value)">
              {{ getKindText(value) }}
            </o-tag>
          </template>
        </o-table>
      </o-flex>
    </o-dialog>

    <o-dialog
      v-model="toPickerVisible"
      title="选择交易对方"
      width="1000px"
      fillSlot
      :confirm="confirmToPerson"
      :enableConfirm="false"
    >
      <o-flex direction="column" class="h-100%">
        <g-search-bar
          class="mb-3"
          :items="toPersonSearchItems"
          :itemsPerRow="3"
          @search="handleToPersonSearch"
          @reset="handleToPersonReset"
        />
        <o-table
          ref="toTableRef"
          class="f-1"
          style="min-height: 0"
          :columns="payeeColumns"
          :data="toPersonData"
          :total="toPersonTotal"
          :loading="pickerLoading"
          :pageSize="toPersonSearchForm.pageSize"
          :pageNumber="toPersonSearchForm.pageNo"
          row-key="id"
          height="100%"
          highlight-current-row
          @current-change="handleToCurrentChange"
          @update="handleToPersonUpdate"
        >
          <template #radio="{ row }">
            <div class="radio-cell">
              <el-radio v-model="toSelectedPayeeId" :value="row.id" />
            </div>
          </template>
        </o-table>
      </o-flex>
    </o-dialog>

    <o-dialog
      v-model="archiveVisible"
      title="卷宗信息预览"
      fillSlot
      cancelText="关闭"
      confirmText="复制卷宗信息"
      @confirm="archiveConfirm"
    >
      <o-flex direction="column" class="h-100% textarea-box">
        <el-input v-model="archiveText" type="textarea" class="h-100%" />
      </o-flex>
    </o-dialog>

    <o-dialog v-model="detailVisible" title="详情信息" width="1200px" :showConfirm="false">
      <o-descriptions :options="detailDescOptions" :column="3" label-width="auto" :showAll="true" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.case-deal-page__selectors {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.case-deal-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.case-deal-page__table {
  min-height: 0;
}

.selector-card {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.selector-label {
  flex-shrink: 0;
  font-weight: 600;
}

.selector-input-group {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  height: 46px;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.selector-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  color: #606266;
  white-space: nowrap;
}

.selector-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
}

.selector-actions :deep(.el-button) {
  margin-left: 0;
}

.selector-arrow {
  flex-shrink: 0;
  color: #909399;
}

.case-deal-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.radio-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.textarea-box :deep(.el-textarea__inner) {
  height: 100%;
}
</style>
