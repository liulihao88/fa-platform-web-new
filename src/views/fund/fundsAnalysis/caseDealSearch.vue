<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { copyTextToClipboard } from '@pureadmin/utils'
import { $toast } from '@oeos-components/utils'
import { caseInvolvedList, entityTransListApi, fileContextInfo, payeeListApi } from '@/api/analysis'
import { useMethods, useGlobalTablePageSize } from '@/hooks'
import { intelligentDetailFields, intelligentTableColumns } from './schema'

const route = useRoute()
const { exportXls } = useMethods()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

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

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orgCd: '',
  cardNum: '',
  accountNum: '',
  customerName: '',
  openDate: '',
})
syncPageSize(queryParams)

const extraParams = reactive({
  customerCd: '',
  payeeld: '',
})

const fromSelectedRows = ref<Record<string, any>[]>([])
const toSelectedRows = ref<Record<string, any>[]>([])
const fromPersonData = ref<Record<string, any>[]>([])
const toPersonData = ref<Record<string, any>[]>([])
const pickerLoading = ref(false)

const searchItems = [
  { label: '归属银行', prop: 'orgCd', type: 'input', placeholder: '请输入归属银行' },
  { label: '卡号', prop: 'cardNum', type: 'input', placeholder: '请输入卡号' },
  { label: '相关账号', prop: 'accountNum', type: 'input', placeholder: '请输入相关账号' },
  { label: '客户名', prop: 'customerName', type: 'input', placeholder: '请输入客户名' },
] as any[]

const personColumns = [
  { label: '发起方名称', prop: 'customerName', minWidth: 160 },
  { label: '发起方种类', prop: 'involvedKind', minWidth: 120 },
] as any[]

const payeeColumns = [
  { label: '交易对方卡号', prop: 'counterCardNum', minWidth: 160 },
  { label: '交易对方名称', prop: 'counterName', minWidth: 160 },
  { label: '交易对方账号', prop: 'counterAccountNo', minWidth: 160 },
  { label: '对方机构名称', prop: 'counterOrgName', minWidth: 180 },
] as any[]

const mainColumns = computed(() =>
  (intelligentTableColumns as any[]).concat([
    {
      key: 'operation',
      label: '操作',
      fixed: 'right',
      width: 100,
      btns: [{ content: '查看详情', handler: handleDetail }],
    },
  ]),
)

const detailDescOptions = computed(() =>
  intelligentDetailFields.map((item) => ({
    label: item.label,
    value: detailData.value?.[item.prop] ?? '--',
  })),
)

function handleFromSelection(rows: Record<string, any>[]) {
  fromSelectedRows.value = rows.slice(0, 1)
}

function handleToSelection(rows: Record<string, any>[]) {
  toSelectedRows.value = rows.slice(0, 1)
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
  Object.assign(queryParams, params || {})
  queryParams.pageNo = 1
  fetchList()
}

function handleReset() {
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: queryParams.pageSize,
    orgCd: '',
    cardNum: '',
    accountNum: '',
    customerName: '',
    openDate: '',
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
    const res = await caseInvolvedList({ caseId })
    fromPersonData.value = Array.isArray(res) ? res : res?.records || []
  } finally {
    pickerLoading.value = false
  }
}

async function loadToPersons() {
  pickerLoading.value = true
  try {
    const res = await payeeListApi({ caseId })
    toPersonData.value = res?.records || res || []
  } finally {
    pickerLoading.value = false
  }
}

async function showFromPerson() {
  fromPickerVisible.value = true
  await loadFromPersons()
}

async function showToPerson() {
  toPickerVisible.value = true
  await loadToPersons()
}

function confirmFromPerson() {
  if (!fromSelectedRows.value.length) {
    $toast('请选择交易发起方', 'w')
    return
  }
  extraParams.customerCd = fromSelectedRows.value[0].id
  fromPickerVisible.value = false
  fetchList()
}

function confirmToPerson() {
  if (!toSelectedRows.value.length) {
    $toast('请选择交易对方', 'w')
    return
  }
  extraParams.payeeld = toSelectedRows.value[0].counterCustomerId
  toPickerVisible.value = false
  fetchList()
}

function clearFromPerson() {
  fromSelectedRows.value = []
  extraParams.customerCd = ''
  fetchList()
}

function clearToPerson() {
  toSelectedRows.value = []
  extraParams.payeeld = ''
  fetchList()
}

fetchList()
</script>

<template>
  <div class="case-deal-page">
    <div class="case-deal-page__selectors">
      <div class="selector-card">
        <span class="selector-label">交易发起方</span>
        <div class="selector-value">{{ fromSelectedRows[0]?.customerName || '请选择交易发起方' }}</div>
        <div class="selector-actions">
          <el-button type="primary" icon="el-icon-plus" circle @click="showFromPerson" />
          <el-button v-if="fromSelectedRows.length" icon="el-icon-close" circle @click="clearFromPerson" />
        </div>
      </div>
      <div class="selector-arrow">-></div>
      <div class="selector-card">
        <span class="selector-label">交易对方</span>
        <div class="selector-value">{{ toSelectedRows[0]?.counterName || '请选择交易对方' }}</div>
        <div class="selector-actions">
          <el-button type="primary" icon="el-icon-plus" circle @click="showToPerson" />
          <el-button v-if="toSelectedRows.length" icon="el-icon-close" circle @click="clearToPerson" />
        </div>
      </div>
    </div>

    <g-search-bar class="mt-3" :items="searchItems" :itemsPerRow="5" @search="handleSearch" @reset="handleReset">
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

    <o-table
      :columns="mainColumns"
      :data="tableData"
      :total="total"
      :loading="loading"
      :showIndex="false"
      :pageSize="queryParams.pageSize"
      :pageNumber="queryParams.pageNo"
      row-key="id"
      height="520"
      @selection-change="handleSelectionChange"
      @update="handleUpdate"
    >
      <el-table-column type="selection" width="58" align="center" />
    </o-table>

    <o-dialog v-model="fromPickerVisible" title="选择交易发起方" width="900px" :showConfirm="false">
      <o-table
        :columns="personColumns"
        :data="fromPersonData"
        :loading="pickerLoading"
        :showPage="false"
        height="420"
        @selection-change="handleFromSelection"
      >
        <el-table-column type="selection" width="58" align="center" />
      </o-table>
      <div class="case-deal-page__dialog-footer">
        <el-button icon="el-icon-close" @click="fromPickerVisible = false">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="confirmFromPerson">确定</el-button>
      </div>
    </o-dialog>

    <o-dialog v-model="toPickerVisible" title="选择交易对方" width="1000px" :showConfirm="false">
      <o-table
        :columns="payeeColumns"
        :data="toPersonData"
        :loading="pickerLoading"
        :showPage="false"
        height="420"
        @selection-change="handleToSelection"
      >
        <el-table-column type="selection" width="58" align="center" />
      </o-table>
      <div class="case-deal-page__dialog-footer">
        <el-button icon="el-icon-close" @click="toPickerVisible = false">取消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="confirmToPerson">确定</el-button>
      </div>
    </o-dialog>

    <o-dialog v-model="archiveVisible" title="卷宗信息预览" width="1200px" :showConfirm="false">
      <el-input v-model="archiveText" type="textarea" :rows="14" />
      <div class="case-deal-page__dialog-footer">
        <el-button icon="el-icon-close" @click="archiveVisible = false">关闭</el-button>
        <el-button type="primary" icon="el-icon-document-copy" @click="copyArchive">复制</el-button>
      </div>
    </o-dialog>

    <o-dialog v-model="detailVisible" title="详情信息" width="1200px" :showConfirm="false">
      <o-descriptions :options="detailDescOptions" :column="2" label-width="auto" :showAll="true" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.case-deal-page__selectors {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.selector-card {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.selector-label {
  flex-shrink: 0;
  font-weight: 600;
}

.selector-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  white-space: nowrap;
}

.selector-actions {
  display: flex;
  gap: 8px;
}

.selector-arrow {
  color: #909399;
}

.case-deal-page__dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
