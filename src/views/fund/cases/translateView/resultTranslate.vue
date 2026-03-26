<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { $toast, notEmpty } from '@oeos-components/utils'
import { getCaseFileTransInfo, bankCustomerPageList } from '@/api/analysis.ts'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const data = ref([])
const total = ref(0)
const tableCardRef = ref<HTMLElement | null>(null)
const tableHeight = ref(400)

const fileId = route.query.fileId

const activeTab = ref('bankCustomerPageList')
const filePageId = ref('')
const activeSheetId = ref('')
const detailVisible = ref(false)
const detailData = ref<Record<string, any>>({})
const TABLE_PAGINATION_HEIGHT = 50
const sendTableParams = ref({
  filePageId: filePageId.value,
  pageNo: 1,
  pageSize: 10,
})

const sheetList = ref([])

// 表格列定义
const bankCustomerPageListColumns = ref([
  { label: '文件', prop: 'fileName', width: 100, resizable: true },
  { label: '行号', prop: 'rowNum', width: 100, resizable: true },
  { label: '银行名称', prop: 'orgName', width: 100, resizable: true },
  { label: '客户号', prop: 'showCustomerId', width: 100, resizable: true },
  { label: '客户种类', prop: 'customerType', width: 100, resizable: true },
  { label: '客户名称', prop: 'customerName', width: 100, resizable: true },
  { label: '营业执照', prop: 'licenseNum', width: 100, resizable: true },
  { label: '法人姓名', prop: 'legalPersonName', width: 100, resizable: true },
  { label: '客户证件种类', prop: 'idType', width: 100, resizable: true },
  { label: '客户证件号码', prop: 'idNum', width: 100, resizable: true },
  { label: '手机号码', prop: 'teleNum', width: 100, resizable: true },
  { label: '工作单位', prop: 'workUnit', width: 100, resizable: true },
  { label: '账号', prop: 'accountNum', width: 100, resizable: true },
  { label: '卡号', prop: 'cardNum', width: 100, resizable: true },
  { label: '币种', prop: 'currNo', width: 100, resizable: true },
  { label: '余额', prop: 'balence', width: 100, resizable: true },
  { label: '账户类型', prop: 'accountType', width: 100, resizable: true },
  { label: '备注', prop: 'comment', width: 100, resizable: true },
])

const bankTransPageListColumns = ref([
  { label: '文件2', prop: 'fileName', width: 100, resizable: true },
  { label: '行号', prop: 'rowNum', width: 100, resizable: true },
  { label: '机构名称', prop: 'orgName', width: 100, resizable: true },
  { label: '户名', prop: 'accountName', width: 100, resizable: true },
  { label: '账号', prop: 'accountNum', width: 100, resizable: true },
  { label: '卡号', prop: 'cardNum', width: 100, resizable: true },
  { label: '流水号', prop: 'transNo', width: 100, resizable: true },
  { label: '交易渠道', prop: 'channel', width: 100, resizable: true },
  { label: '币种', prop: 'currNo', width: 100, resizable: true },
  { label: '交易方向', prop: 'transWay', width: 100, resizable: true },
  { label: '交易金额', prop: 'transAmt', width: 100, resizable: true },
  { label: '贷方发生额', prop: 'creditAmt', width: 100, resizable: true },
  { label: '余额', prop: 'balence', width: 100, resizable: true },
  { label: '交易种类', prop: 'transType', width: 100, resizable: true },
  { label: '业务日期', prop: 'bizDate', width: 100, resizable: true },
  { label: '交易时间', prop: 'transTime', width: 100, resizable: true },
  { label: '对方机构名称', prop: 'counterOrgName', width: 100, resizable: true },
  { label: '对方账号', prop: 'counterAccountNo', width: 100, resizable: true },
  { label: '客户号', prop: 'showCustomerId', width: 100, resizable: true },
  { label: '客户名称', prop: 'customerName', width: 100, resizable: true },
  { label: '结算金额', prop: 'settlementAmt', width: 100, resizable: true },
  { label: '手续费', prop: 'feeAmt', width: 100, resizable: true },
  { label: '代办人姓名', prop: 'agentName', width: 100, resizable: true },
  { label: '备注', prop: 'comment', width: 100, resizable: true },
])

// 表格列定义
const nonBankCustomerPageListColumns = ref([
  { label: '文件', prop: 'fileName', width: 100, resizable: true },
  { label: '行号', prop: 'rowNum', width: 100, resizable: true },
  { label: '机构名称', prop: 'orgName', width: 100, resizable: true },
  { label: '商户号', prop: 'showMerchantId', width: 100, resizable: true },
  { label: '商户名称', prop: 'merchantName', width: 100, resizable: true },
  { label: '手机号码', prop: 'teleNum', width: 100, resizable: true },
  { label: '店铺号', prop: 'portId', width: 100, resizable: true },
  { label: '结算银行名称', prop: 'settlementOrg', width: 100, resizable: true },
  { label: '结算账号/卡号', prop: 'settlementAccountNum', width: 100, resizable: true },
  { label: '币种', prop: 'currNo', width: 100, resizable: true },
  { label: '账户类型', prop: 'accountType', width: 100, resizable: true },
  { label: '余额', prop: 'balence', width: 100, resizable: true },
  { label: '客户种类', prop: 'customerType', width: 100, resizable: true },
  { label: '营业执照', prop: 'licenseNum', width: 100, resizable: true },
  { label: '法人姓名', prop: 'legalPersonName', width: 100, resizable: true },
  { label: '商户证件种类', prop: 'idType', width: 100, resizable: true },
  { label: '商户证件号码', prop: 'idNum', width: 100, resizable: true },
  { label: '工作单位', prop: 'workUnit', width: 100, resizable: true },
  { label: '备注', prop: 'comment', width: 100, resizable: true },
])

const nonBankTransPageListColumns = ref([
  { label: '文件', prop: 'fileName', width: 100, resizable: true },
  { label: '行号', prop: 'rowNum', width: 100, resizable: true },
  { label: '机构名称', prop: 'orgName', width: 100, resizable: true },
  { label: '商户号', prop: 'showMerchantId', width: 100, resizable: true },
  { label: '商户名称', prop: 'merchantName', width: 100, resizable: true },
  { label: '店铺号', prop: 'portId', width: 100, resizable: true },
  { label: '订单号', prop: 'orderNo', width: 100, resizable: true },
  { label: '商品名称', prop: 'productName', width: 100, resizable: true },
  { label: '手机号码', prop: 'teleNum', width: 100, resizable: true },
  { label: '流水号', prop: 'transNo', width: 100, resizable: true },
  { label: '卡号', prop: 'cardNum', width: 100, resizable: true },
  { label: '户名', prop: 'customerName', width: 100, resizable: true },
  { label: '币种', prop: 'currNo', width: 100, resizable: true },
  { label: '交易方向', prop: 'transWay', width: 100, resizable: true },
  { label: '交易金额', prop: 'transAmt', width: 100, resizable: true },
  { label: '贷方发生额', prop: 'creditAmt', width: 100, resizable: true },
  { label: '交易种类', prop: 'transType', width: 100, resizable: true },
  { label: '业务日期', prop: 'bizDate', width: 100, resizable: true },
  { label: '交易时间', prop: 'transTime', width: 100, resizable: true },
  { label: '交易卡开户行', prop: 'openOrgCd', width: 100, resizable: true },
  { label: '客户号', prop: 'customerId', width: 100, resizable: true },
  { label: '营业执照', prop: 'licenseNum', width: 100, resizable: true },
  { label: '法人姓名', prop: 'legalPersonName', width: 100, resizable: true },
  { label: '证件种类', prop: 'idType', width: 100, resizable: true },
  { label: '证件号码', prop: 'idNum', width: 100, resizable: true },
  { label: '结算金额', prop: 'settlementAmt', width: 100, resizable: true },
  { label: '余额', prop: 'balance', width: 100, resizable: true },
  { label: '备注', prop: 'comment', width: 100, resizable: true },
])

const columns = [
  {
    label: '序号',
    prop: 'index',
    width: 70,
  },
]

const init = async () => {
  let res = await getCaseFileTransInfo({ fileId: fileId })
  sheetList.value = res.filePages
  filePageId.value = sheetList.value[0]?.pageId || ''
  activeSheetId.value = filePageId.value
  sendTableParams.value.filePageId = filePageId.value
  await initTable()
}
init()

const updateTableHeight = async () => {
  await nextTick()
  if (!tableCardRef.value) return
  const style = window.getComputedStyle(tableCardRef.value)
  const paddingTop = parseFloat(style.paddingTop) || 0
  const paddingBottom = parseFloat(style.paddingBottom) || 0
  tableHeight.value = Math.max(
    tableCardRef.value.clientHeight - paddingTop - paddingBottom - TABLE_PAGINATION_HEIGHT,
    240,
  )
}

const initTable = async () => {
  let res = await await bankCustomerPageList(activeTab.value, sendTableParams.value)
  data.value = res.records
  total.value = res.total
}

const handleSheetClick = async (sheet: any) => {
  activeSheetId.value = sheet.pageId
  filePageId.value = sheet.pageId
  sendTableParams.value.filePageId = sheet.pageId
  sendTableParams.value.pageNo = 1
  await initTable()
}

const columnsMap = {
  bankCustomerPageList: bankCustomerPageListColumns.value,
  bankTransPageList: bankTransPageListColumns.value,
  nonBankCustomerPageList: nonBankCustomerPageListColumns.value,
  nonBankTransPageList: nonBankTransPageListColumns.value,
}
const tabLabelMap = {
  bankCustomerPageList: '银行客户信息',
  bankTransPageList: '银行交易流水',
  nonBankCustomerPageList: '非银行客户信息',
  nonBankTransPageList: '非银行交易流水',
}
const detailRow = (row: Record<string, any>) => {
  detailData.value = row || {}
  detailVisible.value = true
}
const detailTitle = computed(() => `${tabLabelMap[activeTab.value] || '详情'}详情`)
const detailDescOptions = computed(() => {
  return (columnsMap[activeTab.value] || []).map((item) => ({
    label: item.label,
    value: detailData.value?.[item.prop] ?? '--',
  }))
})
const activeTabColumns = computed(() => {
  if (notEmpty(columnsMap[activeTab.value])) {
    return columnsMap[activeTab.value].concat([
      {
        key: 'operation',
        label: '操作',
        btns: [
          {
            content: '详情',
            handler: detailRow,
          },
        ],
      },
    ])
  }
  return columnsMap[activeTab.value] || []
})

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await updateTableHeight()
  resizeObserver = new ResizeObserver(() => {
    updateTableHeight()
  })
  if (tableCardRef.value) {
    resizeObserver.observe(tableCardRef.value)
  }
  window.addEventListener('resize', updateTableHeight)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateTableHeight)
})

watch(
  activeTab,
  async () => {
    initTable()
    await updateTableHeight()
  },
  {},
)
</script>

<template>
  <div class="result-translate">
    <div class="panel-header">转换结果</div>

    <div class="result-body">
      <div class="sheet-panel">
        <div class="sheet-label">文件页码</div>
        <div class="sheet-list">
          <div
            v-for="sheet in sheetList"
            :key="sheet.pageId"
            :class="['sheet-item', { 'is-active': activeSheetId === sheet.pageId }]"
            @click="handleSheetClick(sheet)"
          >
            {{ sheet.pageName }}
          </div>
        </div>
      </div>

      <div class="content-panel">
        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="银行客户信息" name="bankCustomerPageList" />
          <el-tab-pane label="银行交易流水" name="bankTransPageList" />
          <el-tab-pane label="非银行客户信息" name="nonBankCustomerPageList" />
          <el-tab-pane label="非银行交易流水" name="nonBankTransPageList" />
        </el-tabs>

        <div ref="tableCardRef" class="table-card">
          <o-table :columns="activeTabColumns" :data="data" :total="total" :height="tableHeight" />
        </div>
      </div>
    </div>

    <o-dialog v-model="detailVisible" :title="detailTitle" width="960px" :showConfirm="false">
      <o-descriptions :options="detailDescOptions" :column="3" />
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.result-translate {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid #e5e6eb;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.result-body {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 520px;
  padding: 12px;
}

.sheet-panel {
  flex-shrink: 0;
  width: 150px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.sheet-label {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sheet-item {
  padding: 14px 12px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sheet-item.is-active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

.content-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.result-tabs {
  padding: 0 4px;
}

.table-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.setting-icon {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
}

.pagination-wrap {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
}

.page-total {
  font-size: 14px;
  color: #606266;
}
</style>
