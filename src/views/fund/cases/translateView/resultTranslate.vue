<script setup lang="tsx">
import { ref, watch, computed, useTemplateRef, getCurrentInstance } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { $toast, notEmpty } from '@oeos-components/utils'
import {
  getCaseFileTransInfo,
  bankCustomerPageList,
  getStandardDataPageList,
  getParseStandardEntityApi,
  getParseStandardTransApi,
  getParseStandardOrderApi,
} from '@/api/analysis.ts'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalTablePageSize, useRelativeHeight } from '@/hooks'

const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()

const emits = defineEmits(['initFileInfo'])

const props = defineProps({
  type: {
    type: String,
    default: 'translate', // standard
  },
})

const data = ref([])
const total = ref(0)
const resultBodyRef = useTemplateRef('resultBodyRef')
const contentPanelRef = useTemplateRef('contentPanelRef')
const tableCardRef = useTemplateRef('tableCardRef')
const { height: tableHeight } = useRelativeHeight(tableCardRef, contentPanelRef, { minHeight: 240, offset: 80 })

const activeTab = ref('bankCustomerPageList')
const filePageId = ref('')
const activeSheetId = ref('')
const detailVisible = ref(false)
const detailData = ref<Record<string, any>>({})
const analyzeModalVisible = ref(false)
const parseActiveTab = ref('parseEntity')
const parseEntityData = ref([])
const parseTransData = ref([])
const parseOrderData = ref([])
const parseDataParams = ref({
  caseId: String(route.query.caseId || ''),
  dataType: '',
  dataId: '',
})
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()
const sendTableParams = ref({
  filePageId: filePageId.value,
  pageNo: 1,
  pageSize: 10,
})
syncPageSize(sendTableParams.value)
const parseEntityPagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})
const parseTransPagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})
const parseOrderPagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0,
})
syncPageSize(parseEntityPagination.value)
syncPageSize(parseTransPagination.value)
syncPageSize(parseOrderPagination.value)

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
  { label: '文件', prop: 'fileName', width: 100, resizable: true },
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
  { label: '业务日期', prop: 'bizDate', resizable: true, ...proxy.TIME_WIDTH_ATTRS },
  { label: '交易时间', prop: 'transTime', resizable: true, ...proxy.TIME_WIDTH_ATTRS },
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
  { label: '业务日期', prop: 'bizDate', resizable: true, ...proxy.TIME_WIDTH_ATTRS },
  { label: '交易时间', prop: 'transTime', resizable: true, ...proxy.TIME_WIDTH_ATTRS },
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
const parseEntityColumns = [
  { label: '企业客户信息', prop: 'customerName', minWidth: 140 },
  { label: '客户号', prop: 'customerId', minWidth: 100 },
  { label: '客户种类', prop: 'customerType', minWidth: 100 },
  { label: '证件号码', prop: 'idNum', minWidth: 140 },
  { label: '手机号', prop: 'teleNum', minWidth: 120 },
  { label: '营业执照', prop: 'licenseNum', minWidth: 140 },
]
const parseTransColumns = [
  { label: '交易流水号', prop: 'transNo', minWidth: 140 },
  { label: '交易金额', prop: 'transAmt', minWidth: 100 },
  { label: '交易方向', prop: 'transWay', minWidth: 100 },
  { label: '交易时间', prop: 'transTime', minWidth: 140 },
  { label: '对方账号', prop: 'counterAccountNo', minWidth: 140 },
  { label: '备注', prop: 'comment', minWidth: 140 },
]
const parseOrderColumns = [
  { label: '订单号', prop: 'orderNo', minWidth: 140 },
  { label: '商品名称', prop: 'productName', minWidth: 140 },
  { label: '交易金额', prop: 'transAmt', minWidth: 100 },
  { label: '商户名称', prop: 'merchantName', minWidth: 140 },
  { label: '手机号', prop: 'teleNum', minWidth: 120 },
  { label: '备注', prop: 'comment', minWidth: 140 },
]

const apiMap = {
  translate: getCaseFileTransInfo,
  standard: getStandardDataPageList,
}

const init = async (sendFileId = '') => {
  let res = await apiMap[props.type]({ fileId: sendFileId || route.query.fileId })
  if (props.type === 'standard') {
    sheetList.value = res
    filePageId.value = res[0].pageId
    activeSheetId.value = filePageId.value
    sendTableParams.value.filePageId = filePageId.value
  } else {
    sheetList.value = res.filePages
    filePageId.value = sheetList.value[0]?.pageId || ''
    activeSheetId.value = filePageId.value
    sendTableParams.value.filePageId = filePageId.value
    emits('initFileInfo', res)
  }

  await initTable()
}
if (props.type === 'translate') {
  init()
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
const detailFieldMap = {
  bankCustomerPageList: [
    { label: '文件', prop: 'fileName' },
    { label: '行号', prop: 'rowNum' },
    { label: '银行名称', prop: 'orgName' },
    { label: '客户号', prop: 'showCustomerId' },
    { label: '客户种类', prop: 'customerType' },
    { label: '客户名称', prop: 'customerName' },
    { label: '营业执照', prop: 'licenseNum' },
    { label: '法人姓名', prop: 'legalPersonName' },
    { label: '客户证件种类', prop: 'idType' },
    { label: '客户证件号码', prop: 'idNum' },
    { label: '手机号码', prop: 'teleNum' },
    { label: '工作单位', prop: 'workUnit' },
    { label: '账号', prop: 'accountNum' },
    { label: '卡号', prop: 'cardNum' },
    { label: '币种', prop: 'currNo' },
    { label: '余额', prop: 'balence' },
    { label: '账户类型', prop: 'accountType' },
    { label: '备注', prop: 'comment' },
    { label: '地税纳税号', prop: 'localTaxNum' },
    { label: '国税纳税号', prop: 'countryTaxNum' },
    { label: '法人证件种类', prop: 'legalIdType' },
    { label: '法人证件号码', prop: 'legalIdNum' },
    { label: '住宅电话', prop: 'homeTel' },
    { label: '单位电话', prop: 'unitTel' },
    { label: '状态', prop: 'customerStatus' },
    { label: '开户日期', prop: 'openDate' },
    { label: '可用余额', prop: 'avaiBalence' },
    { label: '开户网点', prop: 'openBranches' },
    { label: '开户网点代码', prop: 'openBranchesCd' },
    { label: '开户城市', prop: 'openCity' },
    { label: '开户省份', prop: 'openProvince' },
    { label: '关联资金账户', prop: 'cashAccountRel' },
    { label: '统一客户号', prop: 'customerCd' },
    { label: '清洗规则', prop: 'cleanRule' },
    { label: '通信地址', prop: 'communicationAddr' },
    { label: '住宅地址', prop: 'homeAddr' },
    { label: '单位地址', prop: 'unitAddr' },
    { label: '邮箱地址', prop: 'mailAddr' },
    { label: '邮政编码', prop: 'postCode' },
    { label: '销户日期', prop: 'closeDate' },
    { label: '销户网点', prop: 'closeBranches' },
    { label: '最后交易时间', prop: 'lastTransTime' },
    { label: '账户销户银行', prop: 'closeBank' },
  ],
  bankTransPageList: [
    { label: '文件', prop: 'fileName' },
    { label: '行号', prop: 'rowNum' },
    { label: '机构名称', prop: 'orgName' },
    { label: '户名', prop: 'accountName' },
    { label: '账号', prop: 'accountNum' },
    { label: '卡号', prop: 'cardNum' },
    { label: '流水号', prop: 'transNo' },
    { label: '交易渠道', prop: 'channel' },
    { label: '币种', prop: 'currNo' },
    { label: '交易方向', prop: 'transWay' },
    { label: '交易金额', prop: 'transAmt' },
    { label: '贷方发生额', prop: 'creditAmt' },
    { label: '余额', prop: 'balence' },
    { label: '交易种类', prop: 'transType' },
    { label: '业务日期', prop: 'bizDate' },
    { label: '交易时间', prop: 'transTime' },
    { label: '对方机构名称', prop: 'counterOrgName' },
    { label: '对方账号', prop: 'counterAccountNo' },
    { label: '客户号', prop: 'showCustomerId' },
    { label: '客户名称', prop: 'customerName' },
    { label: '结算金额', prop: 'settlementAmt' },
    { label: '手续费', prop: 'feeAmt' },
    { label: '利息', prop: 'interestAmt' },
    { label: '违约金', prop: 'liquidatedAmt' },
    { label: '代办人姓名', prop: 'agentName' },
    { label: '备注', prop: 'comment' },
    { label: '设备MAC', prop: 'macAddress' },
    { label: '交易IP地址', prop: 'ipAddress' },
    { label: '交易状态', prop: 'status' },
    { label: '对方客户唯一识别', prop: 'counterCustomerId' },
    { label: '对方机构编码', prop: 'counterOrgCd' },
    { label: '对方卡号', prop: 'counterCardNum' },
    { label: '交易对方证件号码', prop: 'counterIdNum' },
    { label: '交易对方余额', prop: 'counterBalance' },
    { label: '统一客户号', prop: 'customerCd' },
    { label: '客户种类', prop: 'customerType' },
    { label: '营业执照', prop: 'licenseNum' },
    { label: '法人姓名', prop: 'legalPersonName' },
    { label: '证件种类', prop: 'idType' },
    { label: '证件号码', prop: 'idNum' },
    { label: '手机号码', prop: 'teleNum' },
    { label: '清洗规则', prop: 'cleanRule' },
    { label: '交易代码', prop: 'transCode' },
    { label: '交易柜员', prop: 'teller' },
    { label: '交易发生地', prop: 'transLocation' },
    { label: '服务界面', prop: 'serviceInterface' },
    { label: '凭证号', prop: 'bankPaperNum' },
    { label: '凭证种类', prop: 'bankPaperType' },
    { label: '现金标志', prop: 'cashStatus' },
    { label: '钞汇标志', prop: 'fxCashStatus' },
    { label: '交易渠道', prop: 'transChannel' },
    { label: '交易渠道代码', prop: 'transChannelCd' },
    { label: '终端号', prop: 'portNumber' },
    { label: '代办人电话', prop: 'agentTel' },
    { label: '代办人证件号码', prop: 'agentIdNum' },
    { label: '代办人证件类型', prop: 'adengIdType' },
  ],
  nonBankCustomerPageList: [
    { label: '文件', prop: 'fileName' },
    { label: '行号', prop: 'rowNum' },
    { label: '机构名称', prop: 'orgName' },
    { label: '商户号', prop: 'showMerchantId' },
    { label: '商户名称', prop: 'merchantName' },
    { label: '手机号码', prop: 'teleNum' },
    { label: '店铺号', prop: 'portId' },
    { label: '结算银行名称', prop: 'settlementOrg' },
    { label: '结算账号/卡号', prop: 'settlementAccountNum' },
    { label: '币种', prop: 'currNo' },
    { label: '账户类型', prop: 'accountType' },
    { label: '余额', prop: 'balence' },
    { label: '客户种类', prop: 'customerType' },
    { label: '营业执照', prop: 'licenseNum' },
    { label: '法人姓名', prop: 'legalPersonName' },
    { label: '商户证件种类', prop: 'idType' },
    { label: '商户证件号码', prop: 'idNum' },
    { label: '工作单位', prop: 'workUnit' },
    { label: '备注', prop: 'comment' },
    { label: '是否商户', prop: 'isMerchant' },
    { label: '结算银行编码', prop: 'settlementOrgCd' },
    { label: '账户状态', prop: 'accontStatus' },
    { label: '开户日期', prop: 'openDate' },
    { label: '可用余额', prop: 'avaiBalence' },
    { label: '地税纳税号', prop: 'localTaxNum' },
    { label: '国税纳税号', prop: 'countryTaxNum' },
    { label: '法人证件种类', prop: 'legalIdType' },
    { label: '法人证件号码', prop: 'legalIdNum' },
    { label: '住宅电话', prop: 'homeTel' },
    { label: '单位电话', prop: 'unitTel' },
    { label: '状态', prop: 'customerStatus' },
    { label: '客户号', prop: 'customerId' },
    { label: '客户名称', prop: 'customerName' },
    { label: '统一客户号', prop: 'customerCd' },
    { label: '清洗规则', prop: 'cleanRule' },
    { label: '通信地址', prop: 'communicationAddr' },
    { label: '住宅地址', prop: 'homeAddr' },
    { label: '单位地址', prop: 'unitAddr' },
    { label: '邮箱地址', prop: 'mailAddr' },
    { label: '邮政编码', prop: 'postCode' },
    { label: '开户网点', prop: 'openBranches' },
    { label: '开户网点代码', prop: 'openBranchesCd' },
    { label: '销户日期', prop: 'closeDate' },
    { label: '最后交易时间', prop: 'lastTransTime' },
  ],
  nonBankTransPageList: [
    { label: '文件', prop: 'fileName' },
    { label: '行号', prop: 'rowNum' },
    { label: '机构名称', prop: 'orgName' },
    { label: '商户号', prop: 'showMerchantId' },
    { label: '商户名称', prop: 'merchantName' },
    { label: '店铺号', prop: 'portId' },
    { label: '订单号', prop: 'orderNo' },
    { label: '商品名称', prop: 'productName' },
    { label: '手机号码', prop: 'teleNum' },
    { label: '流水号', prop: 'transNo' },
    { label: '卡号', prop: 'cardNum' },
    { label: '户名', prop: 'customerName' },
    { label: '币种', prop: 'currNo' },
    { label: '交易方向', prop: 'transWay' },
    { label: '交易金额', prop: 'transAmt' },
    { label: '贷方发生额', prop: 'creditAmt' },
    { label: '交易种类', prop: 'transType' },
    { label: '业务日期', prop: 'bizDate' },
    { label: '交易时间', prop: 'transTime' },
    { label: '交易卡开户行', prop: 'openOrgCd' },
    { label: '客户号', prop: 'customerId' },
    { label: '营业执照', prop: 'licenseNum' },
    { label: '法人姓名', prop: 'legalPersonName' },
    { label: '证件种类', prop: 'idType' },
    { label: '证件号码', prop: 'idNum' },
    { label: '结算金额', prop: 'settlementAmt' },
    { label: '余额', prop: 'balance' },
    { label: '备注', prop: 'comment' },
    { label: '客户种类', prop: 'customerType' },
    { label: '结算行', prop: 'settlementOrg' },
    { label: '结算行编码', prop: 'settlementOrgCd' },
    { label: '结算账号', prop: 'settlementAccountNum' },
    { label: '卡类型', prop: 'cardType' },
    { label: '设备MAC', prop: 'macAddress' },
    { label: '交易IP地址', prop: 'ipAddress' },
    { label: '交易状态', prop: 'status' },
    { label: '统一客户号', prop: 'customerCd' },
    { label: '清洗规则', prop: 'cleanRule' },
    { label: '交易渠道', prop: 'transChannel' },
    { label: '交易代码', prop: 'transCode' },
    { label: '手续费', prop: 'feeAmt' },
    { label: '现金标志', prop: 'cashStatus' },
    { label: '钞汇标志', prop: 'fxCashStatus' },
    { label: '交易发生地', prop: 'transLocation' },
  ],
}
const detailRow = (row: Record<string, any>) => {
  detailData.value = row || {}
  detailVisible.value = true
}
const detailTitle = computed(() => `${tabLabelMap[activeTab.value] || '详情'}详情`)
const detailDescOptions = computed(() => {
  return (detailFieldMap[activeTab.value] || columnsMap[activeTab.value] || []).map((item) => ({
    label: item.label,
    labelRender: (labelItem) => {
      if (detailData.value?.[item.prop]) {
        return <div class="cl-blue"> {item.label} </div>
      } else {
        return item.label
      }
    },
    value: detailData.value?.[item.prop],
  }))
})
const activeTabColumns = computed(() => {
  if (notEmpty(columnsMap[activeTab.value])) {
    const operationBtns = []

    if (props.type === 'standard') {
      operationBtns.push({
        content: '查看标准数据',
        handler: openAnalyzeResult,
      })
    }

    operationBtns.push({
      handler: detailRow,
      ...proxy.setDetailAttrs(),
    })

    return columnsMap[activeTab.value].concat([
      {
        key: 'operation',
        label: '操作',
        btns: operationBtns,
      },
    ])
  }
  return columnsMap[activeTab.value] || []
})

const parseTableMap = {
  parseEntity: {
    api: getParseStandardEntityApi,
    data: parseEntityData,
    pagination: parseEntityPagination,
  },
  parseTrans: {
    api: getParseStandardTransApi,
    data: parseTransData,
    pagination: parseTransPagination,
  },
  parseOrder: {
    api: getParseStandardOrderApi,
    data: parseOrderData,
    pagination: parseOrderPagination,
  },
}

const parseTabOptions = [
  { label: '企业客户信息', value: 'parseEntity' },
  { label: '交易流水', value: 'parseTrans' },
  { label: '订单信息', value: 'parseOrder' },
]

const activeParseColumns = computed(() => {
  if (parseActiveTab.value === 'parseEntity') return parseEntityColumns
  if (parseActiveTab.value === 'parseTrans') return parseTransColumns
  return parseOrderColumns
})

const activeParseData = computed(() => parseTableMap[parseActiveTab.value].data.value)
const activeParseTotal = computed(() => parseTableMap[parseActiveTab.value].pagination.value.total || 0)
const activeParsePageSize = computed(() => parseTableMap[parseActiveTab.value].pagination.value.pageSize)
const activeParsePageNo = computed(() => parseTableMap[parseActiveTab.value].pagination.value.pageNo)

async function loadParseTabData(tabKey = parseActiveTab.value) {
  const { caseId, dataType, dataId } = parseDataParams.value
  if (!caseId || !dataType || !dataId) return

  const current = parseTableMap[tabKey]
  const params = {
    caseId,
    dataType,
    dataId,
    pageNo: current.pagination.value.pageNo,
    pageSize: current.pagination.value.pageSize,
  }
  const res = await current.api(params)
  current.data.value = res?.records || []
  current.pagination.value.total = res?.total || 0
}

async function openAnalyzeResult(row) {
  parseDataParams.value.caseId = String(route.query.caseId || '')
  parseDataParams.value.dataType = getAnalyzeDataType(activeTab.value)
  parseDataParams.value.dataId = row.id
  parseActiveTab.value = 'parseEntity'
  parseEntityPagination.value.pageNo = 1
  parseTransPagination.value.pageNo = 1
  parseOrderPagination.value.pageNo = 1
  parseEntityData.value = []
  parseTransData.value = []
  parseOrderData.value = []
  analyzeModalVisible.value = true
  await loadParseTabData('parseEntity')
}

function getAnalyzeDataType(tabKey) {
  const map = {
    bankCustomerPageList: '01',
    bankTransPageList: '02',
    nonBankCustomerPageList: '03',
    nonBankTransPageList: '04',
  }
  return map[tabKey] || '01'
}

function handleParseUpdate(pageNo, pageSize) {
  const current = parseTableMap[parseActiveTab.value]
  current.pagination.value.pageNo = pageNo
  updatePageSize(current.pagination.value, pageSize)
  loadParseTabData()
}

const update = (number, size) => {
  sendTableParams.value.pageNo = number
  updatePageSize(sendTableParams.value, size)
  initTable()
}

watch(
  activeTab,
  async () => {
    initTable()
  },
  {},
)

watch(parseActiveTab, async () => {
  if (!analyzeModalVisible.value) return
  await loadParseTabData()
})

defineExpose({
  init,
})
</script>

<template>
  <div class="result-translate">
    <div ref="resultBodyRef" class="result-body">
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

      <div ref="contentPanelRef" class="content-panel">
        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane label="银行客户信息" name="bankCustomerPageList" />
          <el-tab-pane label="银行交易流水" name="bankTransPageList" />
          <el-tab-pane label="非银行客户信息" name="nonBankCustomerPageList" />
          <el-tab-pane label="非银行交易流水" name="nonBankTransPageList" />
        </el-tabs>

        <div ref="tableCardRef" class="table-card">
          <o-table
            :columns="activeTabColumns"
            :data="data"
            :total="total"
            :height="tableHeight"
            :pageSize="sendTableParams.pageSize"
            :pageNumber="sendTableParams.pageNo"
            @update="update"
          />
        </div>
      </div>
    </div>

    <o-dialog v-model="detailVisible" :title="detailTitle" width="1200px" :showConfirm="false">
      <o-descriptions :options="detailDescOptions" :column="3" label-width="auto" :showAll="true" />
    </o-dialog>
    <o-dialog v-model="analyzeModalVisible" title="标准数据" width="1400px" :showConfirm="false">
      <div class="analyze-modal">
        <el-tabs v-model="parseActiveTab" class="result-tabs">
          <el-tab-pane v-for="tab in parseTabOptions" :key="tab.value" :label="tab.label" :name="tab.value" />
        </el-tabs>
        <o-table
          :columns="activeParseColumns"
          :data="activeParseData"
          :total="activeParseTotal"
          :pageSize="activeParsePageSize"
          :pageNumber="activeParsePageNo"
          height="500"
          @update="handleParseUpdate"
        />
      </div>
    </o-dialog>
  </div>
</template>

<style scoped lang="scss">
.result-translate {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
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
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
}

.sheet-panel {
  flex-shrink: 0;
  width: 150px;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
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
  min-height: 0;
  overflow-y: auto;
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
  min-height: 0;
  overflow: hidden;
}

.result-tabs {
  flex-shrink: 0;
  min-width: 0;
  padding: 0 4px;
  overflow: hidden;
}

.table-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.table-card :deep(.o-table) {
  width: 100%;
  min-width: 0;
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

.analyze-modal {
  min-height: 0;
}
</style>
