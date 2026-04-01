<script setup lang="ts">
import { useRoute } from 'vue-router'
import { isEmpty } from '@/utils/is';
import smartSearch from './smartSearch.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { BasicTable, useTable } from '/@/components/Table';
import { BasicModal } from '/@/components/Modal';
import { BasicDrawer, useDrawer } from '/@/components/Drawer';
import { message } from 'ant-design-vue';

// 导入列配置
import { 
  tableColumns, 
  bankCustomerColumns, 
  bankTransactionColumns, 
  nonBankCustomerColumns, 
  nonBankTransactionColumns 
} from './config/columns';

// 导入数据服务
import { 
  fetchCaseInfo, 
  fetchIntelligentList, 
  loadTabData, 
  handleTablePaginationChange 
} from './services/dataService';

// 导入导出服务
import { 
  exportCurrentPage, 
  exportMarkedData, 
  exportAllData 
} from './services/exportService';

// 导入详情服务
import { 
  sendArchive, 
  showArchiveModal, 
  closeDetailModal as closeDetailModalService, 
  showDetailModal as showDetailModalService, 
  handleTabChange as handleTabChangeService 
} from './services/detailService';

// 路由参数
const route = useRoute()
const caseId = route.query.caseId as string

// 案件详情
const detail = reactive<Record<string, any>>({})

// 搜索条件配置 - 智能查询的筛选条件
const columns = [
  { label: '关系', prop: 'operate', type: 'select', dict: 'fa_trans_query_operate' },
  { label: '字段', prop: 'field', type: 'select', dict: 'fa_trans_query_col' },
  { label: '逻辑', prop: 'condition', type: 'select', dict: 'fa_trans_query_rule_nostr' },
  { label: '值', prop: 'value', type: 'input' },
] as any[]

// 表格数据
const dataSource = ref<any[]>([])
const conditionJson = ref()
const selectedRowKeys = ref<string[]>([]);
const selectedRowsData = ref<any[]>([]);
const tableLoading = ref(false)

// 行选择配置
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys: (string | number)[], selectedRows: any[]) => {
      selectedRowKeys.value = selectedKeys as string[];
      selectedRowsData.value = selectedRows;
    },
    onSelectAll: (selected: boolean, selectedRows: any[]) => {
      selectedRowKeys.value = selected ? selectedRows.map(row => row.id) : [];
    },
    checkStrictly: false,
    columnWidth: 60,
    fixed: true
  };
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPage: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 表格注册
const [registerTable, { setPagination }] = useTable({
  columns: tableColumns,
  dataSource,
  loading: tableLoading,
  pagination,
  bordered: true,
  size: 'small',
  scroll: { x: 2000 },
  rowSelection,
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: {
    redo: false,
    size: true,
    setting: false,
    fullScreen: false,
    cacheKey: 'fund-analysis-intelligent-table'
  }
});

// 处理搜索
const handleSearch = (params: any) => {
  console.log(params)
  if (!isEmpty(params)) {
    conditionJson.value = JSON.stringify({ grouproot: params })
  }
  fetchIntelligentList(caseId, selectedRowKeys.value, conditionJson.value, pagination, dataSource, tableLoading, setPagination);
};

// 处理重置
const handleReset = (params: any) => {
  conditionJson.value = JSON.stringify({ grouproot: params })
  selectedRowKeys.value = [];
  selectedRowsData.value = [];
  pagination.current = 1;
  setPagination({ current: 1 });
  fetchIntelligentList(caseId, selectedRowKeys.value, conditionJson.value, pagination, dataSource, tableLoading, setPagination);
};

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchIntelligentList(caseId, selectedRowKeys.value, conditionJson.value, pagination, dataSource, tableLoading, setPagination);
};

// 卷宗信息相关
const archiveModalVisible = ref(false);
const archiveModalPreviewData = ref('');

// 查看详情相关状态
const detailData = ref<any>({});
const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();

// 详情抽屉相关状态 - 为每个表格创建独立的状态
const customerDetailData = ref<any>({});
const [registerCustomerDetailDrawer, { openDrawer: openCustomerDetailDrawer }] = useDrawer();

const transactionDetailData = ref<any>({});
const [registerTransactionDetailDrawer, { openDrawer: openTransactionDetailDrawer }] = useDrawer();

const nonBankCustomerDetailData = ref<any>({});
const [registerNonBankCustomerDetailDrawer, { openDrawer: openNonBankCustomerDetailDrawer }] = useDrawer();

const nonBankTransactionDetailData = ref<any>({});
const [registerNonBankTransactionDetailDrawer, { openDrawer: openNonBankTransactionDetailDrawer }] = useDrawer();

// 查看原信息相关状态
const detailModalVisible = ref(false);
const activeTab = ref('bankCustomer');
const currentRecord = ref<any>(null);

// 银行客户信息表格状态
const bankCustomerDataSource = ref([]);
const bankCustomerLoading = ref(false);
const bankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 银行交易流水表格状态
const bankTransactionDataSource = ref([]);
const bankTransactionLoading = ref(false);
const bankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 非银行客户信息表格状态
const nonBankCustomerDataSource = ref([]);
const nonBankCustomerLoading = ref(false);
const nonBankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 非银行交易流水表格状态
const nonBankTransactionDataSource = ref([]);
const nonBankTransactionLoading = ref(false);
const nonBankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 显示详情抽屉
function handleDetail(record) {
  detailData.value = record;
  openDetailDrawer(true, record);
}

// 显示查看原信息弹窗
const showDetailModal = (record) => {
  showDetailModalService(record, detailModalVisible, activeTab, currentRecord, (tabKey: string) => {
    loadTabData(
      tabKey,
      caseId,
      currentRecord,
      bankCustomerDataSource,
      bankCustomerLoading,
      bankCustomerPagination,
      bankTransactionDataSource,
      bankTransactionLoading,
      bankTransactionPagination,
      nonBankCustomerDataSource,
      nonBankCustomerLoading,
      nonBankCustomerPagination,
      nonBankTransactionDataSource,
      nonBankTransactionLoading,
      nonBankTransactionPagination
    );
  });
};

// 关闭查看原信息弹窗
const closeDetailModal = () => {
  closeDetailModalService(
    detailModalVisible,
    bankCustomerPagination,
    bankTransactionPagination,
    nonBankCustomerPagination,
    nonBankTransactionPagination,
    bankCustomerDataSource,
    bankTransactionDataSource,
    nonBankCustomerDataSource,
    nonBankTransactionDataSource
  );
};

// 选项卡切换处理
const handleTabChange = (key) => {
  handleTabChangeService(key, (tabKey: string) => {
    loadTabData(
      tabKey,
      caseId,
      currentRecord,
      bankCustomerDataSource,
      bankCustomerLoading,
      bankCustomerPagination,
      bankTransactionDataSource,
      bankTransactionLoading,
      bankTransactionPagination,
      nonBankCustomerDataSource,
      nonBankCustomerLoading,
      nonBankCustomerPagination,
      nonBankTransactionDataSource,
      nonBankTransactionLoading,
      nonBankTransactionPagination
    );
  });
};

// 银行客户信息表格分页变化处理
const handleBankCustomerTableChange = (pagination: any) => {
  handleTablePaginationChange(
    pagination,
    'bankCustomer',
    caseId,
    currentRecord,
    bankCustomerDataSource,
    bankCustomerPagination,
    bankTransactionDataSource,
    bankTransactionPagination,
    nonBankCustomerDataSource,
    nonBankCustomerPagination,
    nonBankTransactionDataSource,
    nonBankTransactionPagination
  );
};

// 银行交易流水分页变化处理
const handleBankTransactionTableChange = (pagination: any) => {
  handleTablePaginationChange(
    pagination,
    'bankTransaction',
    caseId,
    currentRecord,
    bankCustomerDataSource,
    bankCustomerPagination,
    bankTransactionDataSource,
    bankTransactionPagination,
    nonBankCustomerDataSource,
    nonBankCustomerPagination,
    nonBankTransactionDataSource,
    nonBankTransactionPagination
  );
};

// 非银行客户信息表格分页变化处理
const handleNonBankCustomerTableChange = (pagination: any) => {
  handleTablePaginationChange(
    pagination,
    'nonBankCustomer',
    caseId,
    currentRecord,
    bankCustomerDataSource,
    bankCustomerPagination,
    bankTransactionDataSource,
    bankTransactionPagination,
    nonBankCustomerDataSource,
    nonBankCustomerPagination,
    nonBankTransactionDataSource,
    nonBankTransactionPagination
  );
};

// 非银行交易流水分页变化处理
const handleNonBankTransactionTableChange = (pagination: any) => {
  handleTablePaginationChange(
    pagination,
    'nonBankTransaction',
    caseId,
    currentRecord,
    bankCustomerDataSource,
    bankCustomerPagination,
    bankTransactionDataSource,
    bankTransactionPagination,
    nonBankCustomerDataSource,
    nonBankCustomerPagination,
    nonBankTransactionDataSource,
    nonBankTransactionPagination
  );
};

// 显示详情抽屉 - 为每个表格创建独立的处理函数
function handleCustomerDetail(record) {
  customerDetailData.value = record;
  openCustomerDetailDrawer(true, record);
}

function handleTransactionDetail(record) {
  transactionDetailData.value = record;
  openTransactionDetailDrawer(true, record);
}

function handleNonBankCustomerDetail(record) {
  nonBankCustomerDetailData.value = record;
  openNonBankCustomerDetailDrawer(true, record);
}

function handleNonBankTransactionDetail(record) {
  nonBankTransactionDetailData.value = record;
  openNonBankTransactionDetailDrawer(true, record);
}

// 组件挂载
onMounted(() => {
  fetchCaseInfo(caseId, detail);
  fetchIntelligentList(caseId, selectedRowKeys.value, conditionJson.value, pagination, dataSource, tableLoading, setPagination);
});
</script>

<template>
  <div class="h-100%">
    <div class="mb-4  bg-white p-4 rounded">
      <a-row>
        <a-col span="6">
          案件名称：{{ detail.caseName }}
        </a-col>
        <a-col span="6">
          部门受案号: {{ detail.departmentCaseNumber }}
        </a-col>
        <a-col span="6">
          受理日期：{{ detail.acceptTime }}
        </a-col>
        <a-col span="6">
          案由: {{ detail.caseReason }}
        </a-col>
      </a-row>
      <smartSearch class="mt-2" :columns="columns" :caseId="caseId" @query="handleSearch" @reset="handleReset" />

    </div>
    <!-- 表格部分 -->
    <BasicTable class="m2" :columns="tableColumns" :dataSource="dataSource" :loading="tableLoading"
      :scroll="{ x: 2000 }" :row-selection="rowSelection" :pagination="pagination" bordered @change="handleTableChange"
      rowKey="id" :canColDrag="true" :showTableSetting="true"
      :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-intelligent-table' }"
      :canResize="true" :minHeight="300" @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="exportCurrentPage(caseId, dataSource, '智能查询数据列表', conditionJson, pagination)">
          导出本页数据
        </a-button>
        <a-button type="primary" @click="exportMarkedData(caseId, selectedRowKeys, '智能查询数据列表', conditionJson, pagination)" :disabled="selectedRowKeys.length === 0">
          导出选择数据
        </a-button>
        <a-button type="primary" @click="exportAllData(caseId, '智能查询全部数据', conditionJson, pagination)">
          导出全部数据
        </a-button>
        <a-button type="primary" @click="showArchiveModal(caseId, selectedRowKeys, conditionJson, pagination, archiveModalVisible, archiveModalPreviewData)">
          生成卷宗信息
        </a-button>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'transAmt'">
          {{ record.transAmt?.toLocaleString() }}
        </template>
        <template v-else-if="column.key === 'operation'">
          <a-button type="link" @click="showDetailModal(record)">查看原信息</a-button>
          <a-button type="link" @click="handleDetail(record)">查看详情</a-button>
        </template>
      </template>
    </BasicTable>
    <!-- 卷宗信息预览Modal -->
    <BasicModal v-model:visible="archiveModalVisible" title="卷宗信息预览" width="1200px" :footer="null">
      <a-card>
        <div class="archive-preview">
          <!-- 卷宗预览内容 -->
          <div class="preview-content">
            <a-textarea v-model:value="archiveModalPreviewData" placeholder="卷宗信息" :rows="14" />
          </div>
          <a-row class="mt4">
            <a-col span="8" offset="16">
              <a-button class="mr4" @click="archiveModalVisible = false">关闭</a-button>
              <a-button type="primary" @click="sendArchive(archiveModalPreviewData)">发送</a-button>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </BasicModal>
  <!-- 查看原信息Modal -->
  <BasicModal v-model:visible="detailModalVisible" title="查看原信息" width="1200px" :useWrapper="true" :footer="null"
    @cancel="closeDetailModal">
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- 银行客户信息 -->
      <a-tab-pane key="bankCustomer" tab="银行客户信息">
        <BasicTable :columns="bankCustomerColumns" :dataSource="bankCustomerDataSource" :loading="bankCustomerLoading"
          :pagination="bankCustomerPagination" bordered size="small" :scroll="{ x: 1500, y: 400 }"
          @change="handleBankCustomerTableChange" :canColDrag="true" :showTableSetting="true"
          :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-bank-customer-table' }"
          :canResize="true" :minHeight="300">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a @click="handleCustomerDetail(record)">查看详情</a>
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>

      <!-- 银行交易流水 -->
      <a-tab-pane key="bankTransaction" tab="银行交易流水">
        <BasicTable :columns="bankTransactionColumns" :dataSource="bankTransactionDataSource"
          :loading="bankTransactionLoading" :pagination="bankTransactionPagination" bordered size="small"
          :scroll="{ x: 1500, y: 400 }" @change="handleBankTransactionTableChange" :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-bank-transaction-table' }"
          :canResize="true" :minHeight="300">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a @click="handleTransactionDetail(record)">查看详情</a>
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>

      <!-- 非银行客户信息 -->
      <a-tab-pane key="nonBankCustomer" tab="非银行客户信息">
        <BasicTable :columns="nonBankCustomerColumns" :dataSource="nonBankCustomerDataSource"
          :loading="nonBankCustomerLoading" :pagination="nonBankCustomerPagination" bordered size="small"
          :scroll="{ x: 1500, y: 400 }" @change="handleNonBankCustomerTableChange" :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-non-bank-customer-table' }"
          :canResize="true" :minHeight="300">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a @click="handleNonBankCustomerDetail(record)">查看详情</a>
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>

      <!-- 非银行交易流水 -->
      <a-tab-pane key="nonBankTransaction" tab="非银行交易流水">
        <BasicTable :columns="nonBankTransactionColumns" :dataSource="nonBankTransactionDataSource"
          :loading="nonBankTransactionLoading" :pagination="nonBankTransactionPagination" bordered size="small"
          :scroll="{ x: 1500, y: 400 }" @change="handleNonBankTransactionTableChange" :canColDrag="true"
          :showTableSetting="true"
          :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'intelligent-non-bank-transaction-table' }"
          :canResize="true" :minHeight="300">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a @click="handleNonBankTransactionDetail(record)">查看详情</a>
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>

  <!-- 用户详情抽屉 -->
  <BasicDrawer @register="registerDetailDrawer" title="详情信息" width="50%" :showFooter="false">
    <a-descriptions :column="2" bordered size="middle">
      <a-descriptions-item label="文件名称">{{ detailData.fileName }}</a-descriptions-item>
      <a-descriptions-item label="行号">{{ detailData.rowNum }}</a-descriptions-item>
      <a-descriptions-item label="机构名称">{{ detailData.orgName }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ detailData.customerCd }}</a-descriptions-item>
      <a-descriptions-item label="客户名称">{{ detailData.customerName }}</a-descriptions-item>
      <a-descriptions-item label="交易账号">{{ detailData.transAccountNo }}</a-descriptions-item>
      <a-descriptions-item label="相关账号">{{ detailData.relAccountNo }}</a-descriptions-item>
      <a-descriptions-item label="户名">{{ detailData.accountName }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ detailData.currNo }}</a-descriptions-item>
      <a-descriptions-item label="交易状态">{{ detailData.status }}</a-descriptions-item>
      <a-descriptions-item label="交易方向">{{ detailData.transWay }}</a-descriptions-item>
      <a-descriptions-item label="交易金额">{{ detailData.transAmt }}</a-descriptions-item>
      <a-descriptions-item label="交易种类">{{ detailData.transType }}</a-descriptions-item>
      <a-descriptions-item label="业务日期">{{ detailData.bizDate }}</a-descriptions-item>
      <a-descriptions-item label="交易时间">{{ detailData.transTime }}</a-descriptions-item>
      <a-descriptions-item label="余额">{{ detailData.balence }}</a-descriptions-item>
      <a-descriptions-item label="对方机构名称">{{ detailData.counterOrgName }}</a-descriptions-item>
      <a-descriptions-item label="对方账号">{{ detailData.counterAccountNo }}</a-descriptions-item>
      <a-descriptions-item label="对方户名">{{ detailData.counterName }}</a-descriptions-item>
      <a-descriptions-item label="流水号">{{ detailData.transNo }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道">{{ detailData.channel }}</a-descriptions-item>
      <a-descriptions-item label="对方客户唯一识别">{{ detailData.counterCustomerId }}</a-descriptions-item>
      <a-descriptions-item label="对方卡号">{{ detailData.counterCardNum }}</a-descriptions-item>
      <a-descriptions-item label="交易对方证件号码">{{ detailData.counterIdNum }}</a-descriptions-item>
      <a-descriptions-item label="交易对方证件种类">{{ detailData.counterIdType }}</a-descriptions-item>
      <a-descriptions-item label="对方余额">{{ detailData.counterBalance }}</a-descriptions-item>
      <a-descriptions-item label="来源">{{ detailData.sourceTable }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ detailData.comment }}</a-descriptions-item>
      <a-descriptions-item label="设备MAC">{{ detailData.macAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易IP地址">{{ detailData.ipAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易代码">{{ detailData.transCode }}</a-descriptions-item>
      <a-descriptions-item label="结算金额">{{ detailData.settlementAmt }}</a-descriptions-item>
      <a-descriptions-item label="手续费">{{ detailData.feeAmt }}</a-descriptions-item>
      <a-descriptions-item label="利息">{{ detailData.interestAmt }}</a-descriptions-item>
      <a-descriptions-item label="违约金">{{ detailData.liquidatedAmt }}</a-descriptions-item>
      <a-descriptions-item label="交易柜员">{{ detailData.teller }}</a-descriptions-item>
      <a-descriptions-item label="交易发生地">{{ detailData.transLocation }}</a-descriptions-item>
      <a-descriptions-item label="服务界面">{{ detailData.serviceInterface }}</a-descriptions-item>
      <a-descriptions-item label="凭证号">{{ detailData.bankPaperNum }}</a-descriptions-item>
      <a-descriptions-item label="凭证种类">{{ detailData.bankPaperType }}</a-descriptions-item>
      <a-descriptions-item label="现金标志">{{ detailData.cashStatus }}</a-descriptions-item>
      <a-descriptions-item label="钞汇标志">{{ detailData.fxCashStatus }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道代码">{{ detailData.transChannelCd }}</a-descriptions-item>
      <a-descriptions-item label="终端号">{{ detailData.portNumber }}</a-descriptions-item>
      <a-descriptions-item label="代办人姓名">{{ detailData.agentName }}</a-descriptions-item>
      <a-descriptions-item label="代办人电话">{{ detailData.agentTel }}</a-descriptions-item>
      <a-descriptions-item label="代办人证件号码">{{ detailData.agentIdNum }}</a-descriptions-item>
      <a-descriptions-item label="代办人证件类型">{{ detailData.adengIdType }}</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>

  <!-- 客户信息详情抽屉 -->
  <BasicDrawer @register="registerCustomerDetailDrawer" title="客户信息详情" width="50%" :showFooter="false">
    <a-descriptions :column="2" bordered size="middle">
      <a-descriptions-item label="文件">{{ customerDetailData.fileName }}</a-descriptions-item>
      <a-descriptions-item label="行号">{{ customerDetailData.rowNum }}</a-descriptions-item>
      <a-descriptions-item label="银行名称">{{ customerDetailData.orgName }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ customerDetailData.showCustomerId }}</a-descriptions-item>
      <a-descriptions-item label="客户种类">{{ customerDetailData.customerType }}</a-descriptions-item>
      <a-descriptions-item label="客户名称">{{ customerDetailData.customerName }}</a-descriptions-item>
      <a-descriptions-item label="营业执照">{{ customerDetailData.licenseNum }}</a-descriptions-item>
      <a-descriptions-item label="法人姓名">{{ customerDetailData.legalPersonName }}</a-descriptions-item>
      <a-descriptions-item label="客户证件种类">{{ customerDetailData.idType }}</a-descriptions-item>
      <a-descriptions-item label="客户证件号码">{{ customerDetailData.idNum }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ customerDetailData.teleNum }}</a-descriptions-item>
      <a-descriptions-item label="工作单位">{{ customerDetailData.workUnit }}</a-descriptions-item>
      <a-descriptions-item label="账号">{{ customerDetailData.accountNum }}</a-descriptions-item>
      <a-descriptions-item label="卡号">{{ customerDetailData.cardNum }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ customerDetailData.currNo }}</a-descriptions-item>
      <a-descriptions-item label="余额">{{ customerDetailData.balence }}</a-descriptions-item>
      <a-descriptions-item label="账户类型">{{ customerDetailData.accountType }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ customerDetailData.comment }}</a-descriptions-item>
      <a-descriptions-item label="地税纳税号">{{ customerDetailData.localTaxNum }}</a-descriptions-item>
      <a-descriptions-item label="国税纳税号">{{ customerDetailData.countryTaxNum }}</a-descriptions-item>
      <a-descriptions-item label="法人证件种类">{{ customerDetailData.legalIdType }}</a-descriptions-item>
      <a-descriptions-item label="法人证件号码">{{ customerDetailData.legalIdNum }}</a-descriptions-item>
      <a-descriptions-item label="住宅电话">{{ customerDetailData.homeTel }}</a-descriptions-item>
      <a-descriptions-item label="单位电话">{{ customerDetailData.unitTel }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ customerDetailData.customerStatus }}</a-descriptions-item>
      <a-descriptions-item label="开户日期">{{ customerDetailData.openDate }}</a-descriptions-item>
      <a-descriptions-item label="可用余额">{{ customerDetailData.avaiBalence }}</a-descriptions-item>
      <a-descriptions-item label="开户网点">{{ customerDetailData.openBranches }}</a-descriptions-item>
      <a-descriptions-item label="开户网点代码">{{ customerDetailData.openBranchesCd }}</a-descriptions-item>
      <a-descriptions-item label="开户城市">{{ customerDetailData.openCity }}</a-descriptions-item>
      <a-descriptions-item label="开户省份">{{ customerDetailData.openProvince }}</a-descriptions-item>
      <a-descriptions-item label="关联资金账户">{{ customerDetailData.cashAccountRel }}</a-descriptions-item>
      <a-descriptions-item label="统一客户号">{{ customerDetailData.customerCd }}</a-descriptions-item>
      <a-descriptions-item label="清洗规则">{{ customerDetailData.cleanRule }}</a-descriptions-item>
      <a-descriptions-item label="通信地址">{{ customerDetailData.communicationAddr }}</a-descriptions-item>
      <a-descriptions-item label="住宅地址">{{ customerDetailData.homeAddr }}</a-descriptions-item>
      <a-descriptions-item label="单位地址">{{ customerDetailData.unitAddr }}</a-descriptions-item>
      <a-descriptions-item label="邮箱地址">{{ customerDetailData.mailAddr }}</a-descriptions-item>
      <a-descriptions-item label="邮政编码">{{ customerDetailData.postCode }}</a-descriptions-item>
      <a-descriptions-item label="销户日期">{{ customerDetailData.closeDate }}</a-descriptions-item>
      <a-descriptions-item label="销户网点">{{ customerDetailData.closeBranches }}</a-descriptions-item>
      <a-descriptions-item label="最后交易时间">{{ customerDetailData.lastTransTime }}</a-descriptions-item>
      <a-descriptions-item label="账户销户银行">{{ customerDetailData.closeBank }}</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>

  <!-- 交易流水详情抽屉 -->
  <BasicDrawer @register="registerTransactionDetailDrawer" title="交易流水详情" width="50%" :showFooter="false">
    <a-descriptions :column="2" bordered size="middle">
      <a-descriptions-item label="文件">{{ transactionDetailData.fileName }}</a-descriptions-item>
      <a-descriptions-item label="行号">{{ transactionDetailData.rowNum }}</a-descriptions-item>
      <a-descriptions-item label="机构名称">{{ transactionDetailData.orgName }}</a-descriptions-item>
      <a-descriptions-item label="户名">{{ transactionDetailData.accountName }}</a-descriptions-item>
      <a-descriptions-item label="账号">{{ transactionDetailData.accountNum }}</a-descriptions-item>
      <a-descriptions-item label="卡号">{{ transactionDetailData.cardNum }}</a-descriptions-item>
      <a-descriptions-item label="流水号">{{ transactionDetailData.transNo }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道">{{ transactionDetailData.channel }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ transactionDetailData.currNo }}</a-descriptions-item>
      <a-descriptions-item label="交易方向">{{ transactionDetailData.transWay }}</a-descriptions-item>
      <a-descriptions-item label="交易金额">{{ transactionDetailData.transAmt }}</a-descriptions-item>
      <a-descriptions-item label="贷方发生额">{{ transactionDetailData.creditAmt }}</a-descriptions-item>
      <a-descriptions-item label="余额">{{ transactionDetailData.balence }}</a-descriptions-item>
      <a-descriptions-item label="交易种类">{{ transactionDetailData.transType }}</a-descriptions-item>
      <a-descriptions-item label="业务日期">{{ transactionDetailData.bizDate }}</a-descriptions-item>
      <a-descriptions-item label="交易时间">{{ transactionDetailData.transTime }}</a-descriptions-item>
      <a-descriptions-item label="对方机构名称">{{ transactionDetailData.counterOrgName }}</a-descriptions-item>
      <a-descriptions-item label="对方账号">{{ transactionDetailData.counterAccountNo }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ transactionDetailData.showCustomerId }}</a-descriptions-item>
      <a-descriptions-item label="客户名称">{{ transactionDetailData.customerName }}</a-descriptions-item>
      <a-descriptions-item label="结算金额">{{ transactionDetailData.settlementAmt }}</a-descriptions-item>
      <a-descriptions-item label="手续费">{{ transactionDetailData.feeAmt }}</a-descriptions-item>
      <a-descriptions-item label="利息">{{ transactionDetailData.interestAmt }}</a-descriptions-item>
      <a-descriptions-item label="违约金">{{ transactionDetailData.liquidatedAmt }}</a-descriptions-item>
      <a-descriptions-item label="代办人姓名">{{ transactionDetailData.agentName }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ transactionDetailData.comment }}</a-descriptions-item>
      <a-descriptions-item label="设备MAC">{{ transactionDetailData.macAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易IP地址">{{ transactionDetailData.ipAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易状态">{{ transactionDetailData.status }}</a-descriptions-item>
      <a-descriptions-item label="对方客户唯一识别">{{ transactionDetailData.counterCustomerId }}</a-descriptions-item>
      <a-descriptions-item label="对方机构编码">{{ transactionDetailData.counterOrgCd }}</a-descriptions-item>
      <a-descriptions-item label="对方卡号">{{ transactionDetailData.counterCardNum }}</a-descriptions-item>
      <a-descriptions-item label="交易对方证件号码">{{ transactionDetailData.counterIdNum }}</a-descriptions-item>
      <a-descriptions-item label="交易对方余额">{{ transactionDetailData.counterBalance }}</a-descriptions-item>
      <a-descriptions-item label="统一客户号">{{ transactionDetailData.customerCd }}</a-descriptions-item>
      <a-descriptions-item label="客户种类">{{ transactionDetailData.customerType }}</a-descriptions-item>
      <a-descriptions-item label="营业执照">{{ transactionDetailData.licenseNum }}</a-descriptions-item>
      <a-descriptions-item label="法人姓名">{{ transactionDetailData.legalPersonName }}</a-descriptions-item>
      <a-descriptions-item label="证件种类">{{ transactionDetailData.idType }}</a-descriptions-item>
      <a-descriptions-item label="证件号码">{{ transactionDetailData.idNum }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ transactionDetailData.teleNum }}</a-descriptions-item>
      <a-descriptions-item label="清洗规则">{{ transactionDetailData.cleanRule }}</a-descriptions-item>
      <a-descriptions-item label="交易代码">{{ transactionDetailData.transCode }}</a-descriptions-item>
      <a-descriptions-item label="交易柜员">{{ transactionDetailData.teller }}</a-descriptions-item>
      <a-descriptions-item label="交易发生地">{{ transactionDetailData.transLocation }}</a-descriptions-item>
      <a-descriptions-item label="服务界面">{{ transactionDetailData.serviceInterface }}</a-descriptions-item>
      <a-descriptions-item label="凭证号">{{ transactionDetailData.bankPaperNum }}</a-descriptions-item>
      <a-descriptions-item label="凭证种类">{{ transactionDetailData.bankPaperType }}</a-descriptions-item>
      <a-descriptions-item label="现金标志">{{ transactionDetailData.cashStatus }}</a-descriptions-item>
      <a-descriptions-item label="钞汇标志">{{ transactionDetailData.fxCashStatus }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道">{{ transactionDetailData.transChannel }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道代码">{{ transactionDetailData.transChannelCd }}</a-descriptions-item>
      <a-descriptions-item label="终端号">{{ transactionDetailData.portNumber }}</a-descriptions-item>
      <a-descriptions-item label="代办人电话">{{ transactionDetailData.agentTel }}</a-descriptions-item>
      <a-descriptions-item label="代办人证件号码">{{ transactionDetailData.agentIdNum }}</a-descriptions-item>
      <a-descriptions-item label="代办人证件类型">{{ transactionDetailData.adengIdType }}</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>

  <!-- 非银行客户信息详情抽屉 -->
  <BasicDrawer @register="registerNonBankCustomerDetailDrawer" title="非银行客户信息详情" width="50%" :showFooter="false">
    <a-descriptions :column="2" bordered size="middle">
      <a-descriptions-item label="文件">{{ nonBankCustomerDetailData.fileName }}</a-descriptions-item>
      <a-descriptions-item label="行号">{{ nonBankCustomerDetailData.rowNum }}</a-descriptions-item>
      <a-descriptions-item label="机构名称">{{ nonBankCustomerDetailData.orgName }}</a-descriptions-item>
      <a-descriptions-item label="商户号">{{ nonBankCustomerDetailData.showMerchantId }}</a-descriptions-item>
      <a-descriptions-item label="商户名称">{{ nonBankCustomerDetailData.merchantName }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ nonBankCustomerDetailData.teleNum }}</a-descriptions-item>
      <a-descriptions-item label="店铺号">{{ nonBankCustomerDetailData.portId }}</a-descriptions-item>
      <a-descriptions-item label="结算银行名称">{{ nonBankCustomerDetailData.settlementOrg }}</a-descriptions-item>
      <a-descriptions-item label="结算账号/卡号">{{ nonBankCustomerDetailData.settlementAccountNum }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ nonBankCustomerDetailData.currNo }}</a-descriptions-item>
      <a-descriptions-item label="账户类型">{{ nonBankCustomerDetailData.accountType }}</a-descriptions-item>
      <a-descriptions-item label="余额">{{ nonBankCustomerDetailData.balence }}</a-descriptions-item>
      <a-descriptions-item label="客户种类">{{ nonBankCustomerDetailData.customerType }}</a-descriptions-item>
      <a-descriptions-item label="营业执照">{{ nonBankCustomerDetailData.licenseNum }}</a-descriptions-item>
      <a-descriptions-item label="法人姓名">{{ nonBankCustomerDetailData.legalPersonName }}</a-descriptions-item>
      <a-descriptions-item label="商户证件种类">{{ nonBankCustomerDetailData.idType }}</a-descriptions-item>
      <a-descriptions-item label="商户证件号码">{{ nonBankCustomerDetailData.idNum }}</a-descriptions-item>
      <a-descriptions-item label="工作单位">{{ nonBankCustomerDetailData.workUnit }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ nonBankCustomerDetailData.comment }}</a-descriptions-item>
      <a-descriptions-item label="是否商户">{{ nonBankCustomerDetailData.isMerchant }}</a-descriptions-item>
      <a-descriptions-item label="结算银行编码">{{ nonBankCustomerDetailData.settlementOrgCd }}</a-descriptions-item>
      <a-descriptions-item label="账户状态">{{ nonBankCustomerDetailData.accontStatus }}</a-descriptions-item>
      <a-descriptions-item label="开户日期">{{ nonBankCustomerDetailData.openDate }}</a-descriptions-item>
      <a-descriptions-item label="可用余额">{{ nonBankCustomerDetailData.avaiBalence }}</a-descriptions-item>
      <a-descriptions-item label="地税纳税号">{{ nonBankCustomerDetailData.localTaxNum }}</a-descriptions-item>
      <a-descriptions-item label="国税纳税号">{{ nonBankCustomerDetailData.countryTaxNum }}</a-descriptions-item>
      <a-descriptions-item label="法人证件种类">{{ nonBankCustomerDetailData.legalIdType }}</a-descriptions-item>
      <a-descriptions-item label="法人证件号码">{{ nonBankCustomerDetailData.legalIdNum }}</a-descriptions-item>
      <a-descriptions-item label="住宅电话">{{ nonBankCustomerDetailData.homeTel }}</a-descriptions-item>
      <a-descriptions-item label="单位电话">{{ nonBankCustomerDetailData.unitTel }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ nonBankCustomerDetailData.customerStatus }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ nonBankCustomerDetailData.customerId }}</a-descriptions-item>
      <a-descriptions-item label="客户名称">{{ nonBankCustomerDetailData.customerName }}</a-descriptions-item>
      <a-descriptions-item label="统一客户号">{{ nonBankCustomerDetailData.customerCd }}</a-descriptions-item>
      <a-descriptions-item label="清洗规则">{{ nonBankCustomerDetailData.cleanRule }}</a-descriptions-item>
      <a-descriptions-item label="通信地址">{{ nonBankCustomerDetailData.communicationAddr }}</a-descriptions-item>
      <a-descriptions-item label="住宅地址">{{ nonBankCustomerDetailData.homeAddr }}</a-descriptions-item>
      <a-descriptions-item label="单位地址">{{ nonBankCustomerDetailData.unitAddr }}</a-descriptions-item>
      <a-descriptions-item label="邮箱地址">{{ nonBankCustomerDetailData.mailAddr }}</a-descriptions-item>
      <a-descriptions-item label="邮政编码">{{ nonBankCustomerDetailData.postCode }}</a-descriptions-item>
      <a-descriptions-item label="开户网点">{{ nonBankCustomerDetailData.openBranches }}</a-descriptions-item>
      <a-descriptions-item label="开户网点代码">{{ nonBankCustomerDetailData.openBranchesCd }}</a-descriptions-item>
      <a-descriptions-item label="销户日期">{{ nonBankCustomerDetailData.closeDate }}</a-descriptions-item>
      <a-descriptions-item label="最后交易时间">{{ nonBankCustomerDetailData.lastTransTime }}</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>

  <!-- 非银行交易流水详情抽屉 -->
  <BasicDrawer @register="registerNonBankTransactionDetailDrawer" title="非银行交易流水详情" width="50%" :showFooter="false">
    <a-descriptions :column="2" bordered size="middle">
      <a-descriptions-item label="文件">{{ nonBankTransactionDetailData.fileName }}</a-descriptions-item>
      <a-descriptions-item label="行号">{{ nonBankTransactionDetailData.rowNum }}</a-descriptions-item>
      <a-descriptions-item label="机构名称">{{ nonBankTransactionDetailData.orgName }}</a-descriptions-item>
      <a-descriptions-item label="商户号">{{ nonBankTransactionDetailData.showMerchantId }}</a-descriptions-item>
      <a-descriptions-item label="商户名称">{{ nonBankTransactionDetailData.merchantName }}</a-descriptions-item>
      <a-descriptions-item label="店铺号">{{ nonBankTransactionDetailData.portId }}</a-descriptions-item>
      <a-descriptions-item label="订单号">{{ nonBankTransactionDetailData.orderNo }}</a-descriptions-item>
      <a-descriptions-item label="商品名称">{{ nonBankTransactionDetailData.productName }}</a-descriptions-item>
      <a-descriptions-item label="手机号码">{{ nonBankTransactionDetailData.teleNum }}</a-descriptions-item>
      <a-descriptions-item label="流水号">{{ nonBankTransactionDetailData.transNo }}</a-descriptions-item>
      <a-descriptions-item label="卡号">{{ nonBankTransactionDetailData.cardNum }}</a-descriptions-item>
      <a-descriptions-item label="户名">{{ nonBankTransactionDetailData.customerName }}</a-descriptions-item>
      <a-descriptions-item label="币种">{{ nonBankTransactionDetailData.currNo }}</a-descriptions-item>
      <a-descriptions-item label="交易方向">{{ nonBankTransactionDetailData.transWay }}</a-descriptions-item>
      <a-descriptions-item label="交易金额">{{ nonBankTransactionDetailData.transAmt }}</a-descriptions-item>
      <a-descriptions-item label="贷方发生额">{{ nonBankTransactionDetailData.creditAmt }}</a-descriptions-item>
      <a-descriptions-item label="交易种类">{{ nonBankTransactionDetailData.transType }}</a-descriptions-item>
      <a-descriptions-item label="业务日期">{{ nonBankTransactionDetailData.bizDate }}</a-descriptions-item>
      <a-descriptions-item label="交易时间">{{ nonBankTransactionDetailData.transTime }}</a-descriptions-item>
      <a-descriptions-item label="交易卡开户行">{{ nonBankTransactionDetailData.openOrgCd }}</a-descriptions-item>
      <a-descriptions-item label="客户号">{{ nonBankTransactionDetailData.customerId }}</a-descriptions-item>
      <a-descriptions-item label="营业执照">{{ nonBankTransactionDetailData.licenseNum }}</a-descriptions-item>
      <a-descriptions-item label="法人姓名">{{ nonBankTransactionDetailData.legalPersonName }}</a-descriptions-item>
      <a-descriptions-item label="证件种类">{{ nonBankTransactionDetailData.idType }}</a-descriptions-item>
      <a-descriptions-item label="证件号码">{{ nonBankTransactionDetailData.idNum }}</a-descriptions-item>
      <a-descriptions-item label="结算金额">{{ nonBankTransactionDetailData.settlementAmt }}</a-descriptions-item>
      <a-descriptions-item label="余额">{{ nonBankTransactionDetailData.balance }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ nonBankTransactionDetailData.comment }}</a-descriptions-item>
      <a-descriptions-item label="客户种类">{{ nonBankTransactionDetailData.customerType }}</a-descriptions-item>
      <a-descriptions-item label="结算行">{{ nonBankTransactionDetailData.settlementOrg }}</a-descriptions-item>
      <a-descriptions-item label="结算行编码">{{ nonBankTransactionDetailData.settlementOrgCd }}</a-descriptions-item>
      <a-descriptions-item label="结算账号">{{ nonBankTransactionDetailData.settlementAccountNum }}</a-descriptions-item>
      <a-descriptions-item label="卡类型">{{ nonBankTransactionDetailData.cardType }}</a-descriptions-item>
      <a-descriptions-item label="设备MAC">{{ nonBankTransactionDetailData.macAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易IP地址">{{ nonBankTransactionDetailData.ipAddress }}</a-descriptions-item>
      <a-descriptions-item label="交易状态">{{ nonBankTransactionDetailData.status }}</a-descriptions-item>
      <a-descriptions-item label="统一客户号">{{ nonBankTransactionDetailData.customerCd }}</a-descriptions-item>
      <a-descriptions-item label="清洗规则">{{ nonBankTransactionDetailData.cleanRule }}</a-descriptions-item>
      <a-descriptions-item label="交易渠道">{{ nonBankTransactionDetailData.transChannel }}</a-descriptions-item>
      <a-descriptions-item label="交易代码">{{ nonBankTransactionDetailData.transCode }}</a-descriptions-item>
      <a-descriptions-item label="手续费">{{ nonBankTransactionDetailData.feeAmt }}</a-descriptions-item>
      <a-descriptions-item label="现金标志">{{ nonBankTransactionDetailData.cashStatus }}</a-descriptions-item>
      <a-descriptions-item label="钞汇标志">{{ nonBankTransactionDetailData.fxCashStatus }}</a-descriptions-item>
      <a-descriptions-item label="交易发生地">{{ nonBankTransactionDetailData.transLocation }}</a-descriptions-item>
    </a-descriptions>
  </BasicDrawer>
</div>
</template>
