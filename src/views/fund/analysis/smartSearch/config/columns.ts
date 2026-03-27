// 智能查询表格列配置
export const tableColumns = [
  {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '行号',
    dataIndex: 'rowNum',
    key: 'rowNum',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '机构名称',
    dataIndex: 'orgName',
    key: 'orgName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '客户号',
    dataIndex: 'showCustomerCd',
    key: 'showCustomerCd',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    key: 'customerName',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易账号',
    dataIndex: 'transAccountNo',
    key: 'transAccountNo',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '相关账号',
    dataIndex: 'relAccountNo',
    key: 'relAccountNo',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '户名',
    dataIndex: 'accountName',
    key: 'accountName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '币种',
    dataIndex: 'currNo',
    key: 'currNo',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '交易状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '交易方向',
    dataIndex: 'transWay',
    key: 'transWay',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易金额',
    dataIndex: 'transAmt',
    key: 'transAmt',
    align: 'right' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易种类',
    dataIndex: 'transType',
    key: 'transType',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '业务日期',
    dataIndex: 'bizDate',
    key: 'bizDate',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '交易时间',
    dataIndex: 'transTime',
    key: 'transTime',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '余额',
    dataIndex: 'balence',
    key: 'balence',
    align: 'center' as const,
    width: 100,
    resizable: true
  },
  {
    title: '对方机构名称',
    dataIndex: 'counterOrgName',
    key: 'counterOrgName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '对方账号',
    dataIndex: 'counterAccountNo',
    key: 'counterAccountNo',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '对方户名',
    dataIndex: 'counterName',
    key: 'counterName',
    ellipsis: true,
    width: 100,
    resizable: true
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center' as const,
    width: 220,
    fixed: 'right' as const
  }
];

// 银行客户信息列配置
export const bankCustomerColumns = [
  { title: '文件', dataIndex: 'fileName', width: 100, resizable: true },
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '银行名称', dataIndex: 'orgName', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'showCustomerId', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '客户证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '客户证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '工作单位', dataIndex: 'workUnit', width: 100, resizable: true },
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true },
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true },
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '操作', dataIndex: 'operation', width: 120, fixed: 'right' as const, resizable: true }
];

// 银行交易流列配置
export const bankTransactionColumns = [
  { title: '文件', dataIndex: 'fileName', width: 100, resizable: true },
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '机构名称', dataIndex: 'orgName', width: 100, resizable: true },
  { title: '户名', dataIndex: 'accountName', width: 100, resizable: true },
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true },
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true },
  { title: '交易渠道', dataIndex: 'channel', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true },
  { title: '对方机构名称', dataIndex: 'counterOrgName', width: 100, resizable: true },
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'showCustomerId', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '结算金额', dataIndex: 'settlementAmt', width: 100, resizable: true },
  { title: '手续费', dataIndex: 'feeAmt', width: 100, resizable: true },
  { title: '代办人姓名', dataIndex: 'agentName', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '操作', dataIndex: 'operation', width: 120, fixed: 'right' as const, resizable: true }
];

// 非银行客户信息列配置
export const nonBankCustomerColumns = [
  { title: '文件', dataIndex: 'fileName', width: 100, resizable: true },
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '机构名称', dataIndex: 'orgName', width: 100, resizable: true },
  { title: '商户号', dataIndex: 'showMerchantId', width: 100, resizable: true },
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '店铺号', dataIndex: 'portId', width: 100, resizable: true },
  { title: '结算银行名称', dataIndex: 'settlementOrg', width: 100, resizable: true },
  { title: '结算账号/卡号', dataIndex: 'settlementAccountNum', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '商户证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '商户证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '工作单位', dataIndex: 'workUnit', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '操作', dataIndex: 'operation', width: 120, fixed: 'right' as const, resizable: true }
];

// 非银行交易流列配置
export const nonBankTransactionColumns = [
  { title: '文件', dataIndex: 'fileName', width: 100, resizable: true },
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true },
  { title: '机构名称', dataIndex: 'orgName', width: 100, resizable: true },
  { title: '商户号', dataIndex: 'showMerchantId', width: 100, resizable: true },
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true },
  { title: '店铺号', dataIndex: 'portId', width: 100, resizable: true },
  { title: '订单号', dataIndex: 'orderNo', width: 100, resizable: true },
  { title: '商品名称', dataIndex: 'productName', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 100, resizable: true },
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100, resizable: true },
  { title: '交易卡开户行', dataIndex: 'openOrgCd', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '结算金额', dataIndex: 'settlementAmt', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balance', width: 100, resizable: true },
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true },
  { title: '操作', dataIndex: 'operation', width: 120, fixed: 'right' as const, resizable: true }
];
