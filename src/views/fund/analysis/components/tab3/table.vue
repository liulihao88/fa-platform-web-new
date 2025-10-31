<template>
  <a-row :gutter="24" class="mt2">
    <!-- 左侧文件列表 -->
    <a-col :span="5">
      <h3>文件列表</h3>
      <div class="file-list">
        <div class="search-box">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索文件名称"
            @search="handleSearch"
            enter-button
          />
        </div>
        <div class="pagination-controls">
          <a-button 
            :disabled="filePagination.current === 1" 
            @click="prevPage"
            size="small"
          >
            上一页
          </a-button>
          <span class="page-info">
            第 {{ filePagination.current }} 页，共 {{ filePagination.totalPage }} 页
          </span>
          <a-button 
            :disabled="filePagination.current === filePagination.totalPage" 
            @click="nextPage"
            size="small"
          >
            下一页
          </a-button>
        </div>
        <a-spin :spinning="fileLoading">
          <div
              v-for="file in filteredFiles"
              :key="file.id"
              :class="['file-item', { active: selectedFileId === file.id }]"
              @click="selectFile(file)"
          >
            {{ file.fileName? file.fileName : file.filePath }}
          </div>
        </a-spin>
      </div>
    </a-col>

    <!-- 中间Sheet列表 -->
    <a-col :span="3">
      <h3>文件页码</h3>
      <div class="sheet-list">
        <a-spin :spinning="sheetLoading">
          <div
              v-for="sheet in sheets"
              :key="sheet.pageId"
              :class="['sheet-item', { active: selectedSheet && selectedSheet.pageId === sheet.pageId }]"
              @click="selectSheet(sheet)"
          >
            {{ sheet.pageName }}
          </div>
        </a-spin>
      </div>
    </a-col>
    <!-- 右侧数据表格 -->
    <a-col :span="16">
      <h3>转换数据</h3>
      <div class="sheet-list">
        <a-spin :spinning="tableLoading">
          <!-- Tab选项卡 -->
          <a-tabs v-model:activeKey="activeTab" class="table-tab" @change="handleTabChange">
            <a-tab-pane key="customer" tab="客户信息">
              <BasicTable
                  :columns="customerColumns"
                  :dataSource="customerData"
                  :pagination="customerPagination"
                  bordered
                  size="small"
                  :scroll="{ x: 1500, y: 500 }"
                  :loading="tableLoading"
                  @change="handleCustomerTableChange"
                  :canResize="true"
                  :showTableSetting="true"
                  :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-customer' }"
                  @register="registerCustomerTable"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'operation'">
                    <a @click="getAnalyzeResult(record,'01')">查看标准数据</a>
                  </template>
                </template>
              </BasicTable>
            </a-tab-pane>

            <a-tab-pane key="transaction" tab="交易流水">
              <BasicTable
                  :columns="transactionColumns"
                  :dataSource="transactionData"
                  :pagination="transactionPagination"
                  bordered
                  size="small"
                  :scroll="{ x: 1500, y: 500 }"
                  :loading="tableLoading"
                  @change="handleTransactionTableChange"
                  :canResize="true"
                  :showTableSetting="true"
                  :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-transaction' }"
                  @register="registerTransactionTable"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'operation'">
                    <a @click="getAnalyzeResult(record,'02')">查看标准数据</a>
                  </template>
                </template>
              </BasicTable>
            </a-tab-pane>

            <a-tab-pane key="nonBankCustomer" tab="非银行客户信息">
              <BasicTable
                  :columns="nonBankCustomerColumns"
                  :dataSource="notBankCustomersData"
                  :pagination="nonBankCustomerPagination"
                  bordered
                  size="small"
                  :scroll="{ x: 1500, y: 500 }"
                  :loading="tableLoading"
                  @change="handleNonBankCustomerTableChange"
                  :canResize="true"
                  :showTableSetting="true"
                  :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-non-bank-customer' }"
                  @register="registerNonBankCustomerTable"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'operation'">
                    <a @click="getAnalyzeResult(record,'03')">查看标准数据</a>
                  </template>
                </template>
              </BasicTable>
            </a-tab-pane>

            <a-tab-pane key="nonBankTransaction" tab="非银行交易流水">
              <BasicTable
                  :columns="nonBankTransactionColumns"
                  :dataSource="notBankTransactionsData"
                  :pagination="nonBankTransactionPagination"
                  bordered
                  size="small"
                  :scroll="{ x: 1500, y: 500 }"
                  :loading="tableLoading"
                  @change="handleNonBankTransactionTableChange"
                  :canResize="true"
                  :showTableSetting="true"
                  :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-non-bank-transaction' }"
                  @register="registerNonBankTransactionTable"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'operation'">
                    <a @click="getAnalyzeResult(record,'04')">查看标准数据</a>
                  </template>
                </template>
              </BasicTable>
            </a-tab-pane>
          </a-tabs>
        </a-spin>
      </div>
    </a-col>
  </a-row>

  <!-- 修改后的分析结果弹框 -->
  <BasicModal
      v-model:visible="analyzeModalVisible"
      title="标准数据"
      width="90%"
      style="top: 20px;"
      wrap-class-name="full-modal"
      :footer="null"
      @cancel="closeAnalyzeModal"
  >

    <a-card>
      <a-spin :spinning="tableLoading">
        <!-- Tab选项卡 -->
        <a-tabs v-model:activeKey="parseActiveTab" class="table-tab" @change="handleParseTabChange">
          <a-tab-pane key="parseEntity" tab="企业客户信息">
            <BasicTable
              :columns="parseEntityColumns"
              :dataSource="parseEntityData"
              :pagination="parseEntityPagination"
              bordered
              size="small"
              :scroll="{ x: 1500, y: 500 }"
              :loading="tableLoading"
              @change="handleParseEntityTableChange"
              :canResize="true"
              :showTableSetting="true"
              :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-parse-entity' }"
              @register="registerParseEntityTable"
            >
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="parseTrans" tab="交易流水">
            <BasicTable
              :columns="parseTransColumns"
              :dataSource="parseTransData"
              :pagination="parseTransPagination"
              bordered
              size="small"
              :scroll="{ x: 1500, y: 500 }"
              :loading="tableLoading"
              @change="handleParseTransTableChange"
              :canResize="true"
              :showTableSetting="true"
              :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-parse-trans' }"
              @register="registerParseTransTable"
            >
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="parseOrder" tab="订单信息">
            <BasicTable
              :columns="parseOrderColumns"
              :dataSource="parseOrderData"
              :pagination="parseOrderPagination"
              bordered
              size="small"
              :scroll="{ x: 1500, y: 500 }"
              :loading="tableLoading"
              @change="handleParseOrderTableChange"
              :canResize="true"
              :showTableSetting="true"
              :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab3-parse-order' }"
              @register="registerParseOrderTable"
            >
            </BasicTable>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
      <!-- 企业客户信息表 -->
      <!--<div class="table-section" v-if="analyzeData.faStandardEntities.length">
        <div class="table-title">企业客户信息</div>
        <a-table
            :columns="enterpriseCustomerColumns"
            :data-source="analyzeData.faStandardEntities"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1500, y: 400 }"
        />
      </div>
-->
      <!-- 交易流水表 -->
      <!--<div class="table-section" v-if="analyzeData.faStandardTrans.length">
        <div class="table-title">交易流水</div>
        <a-table
            :columns="transactionFlowColumns"
            :data-source="analyzeData.faStandardTrans"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1800, y: 400 }"
        />
      </div>-->

      <!-- 订单表 -->
      <!--<div class="table-section" v-if="analyzeData.faStandardOrders.length">
        <div class="table-title">订单信息</div>
        <a-table
            :columns="orderInfoColumns"
            :data-source="analyzeData.faStandardOrders"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1200, y: 400 }"
        />
      </div>-->

     <!-- <div v-if="!hasAnalyzeData" class="no-data-container">
        <a-empty description="暂无解析数据" />
      </div>-->
    </a-card>
  </BasicModal>
</template>

<script lang="ts" name="tab1" setup>
import {ref, reactive, onMounted, computed, defineProps} from 'vue';
import { useRoute } from "vue-router";
import {
  // getAnalyzesultApi,
  standardFileListApi,
  standardFilePageListApi,
  standardSheetListApi,
  standardCustomerApi,
  standardTransApi,
  standardNonBankCustomerApi,
  standardNonBankTransApi,
  getParseStandardEntityApi,
  getParseStandardTransApi,
  getParseStandardOrderApi
} from "@/views/fund/analysis/user.api";
import {FullscreenExitOutlined, FullscreenOutlined} from "@ant-design/icons-vue";
import {BasicModal, useModalInner} from '/@/components/Modal';
import { BasicTable, useTable, TableAction } from '/@/components/Table';

interface FileItem {
  id: string;
  fileName: string;
  filePath: string;
  [key: string]: any;
}

interface SheetItem {
  pageId: string;
  pageName: string;
  [key: string]: any;
}

interface Props {
  filteredFiles: FileItem[];
}
const props = defineProps<Props>();
const { query } = useRoute();

const tableLoading = ref(false);
const searchLoading = ref(false);
const searchText = ref('');
const fileLoading = ref(false);
const sheetLoading = ref(false);
const selectedFileId = ref(null);
const selectedSheet = ref<SheetItem | null>(null);
const sheets = ref<SheetItem[]>([]);
const customerData = ref([]);
const transactionData = ref([]);
const notBankCustomersData = ref([]);
const notBankTransactionsData = ref([]);
const filteredFiles = ref<FileItem[]>([]);

const parseEntityData = ref([]);
const parseTransData = ref([]);
const parseOrderData = ref([]);

const parseDataParams = reactive({
  caseId: '',
  dataType: '',
  dataId: ''
});

// 分析结果弹框相关状态
const analyzeModalVisible = ref(false);
// const analyzeData = reactive({
//   faStandardEntities: [],
//   faStandardTrans: [],
//   faStandardOrders: []
// });

// 文件分页配置
const filePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPage: 0
});

// 分页配置
const customerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const transactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const nonBankCustomerPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const nonBankTransactionPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});
const activeTab = ref('customer'); // 默认激活第一个选项卡


// 计算属性：检查是否有分析数据
// const hasAnalyzeData = computed(() => {
//   return analyzeData.faStandardEntities.length > 0 ||
//       analyzeData.faStandardTrans.length > 0 ||
//       analyzeData.faStandardOrders.length > 0;
// });

// 计算属性：检查当前激活的选项卡是否有数据
const hasTableData = computed(() => {
  switch (activeTab.value) {
    case 'customer':
      return customerData.value.length > 0;
    case 'transaction':
      return transactionData.value.length > 0;
    case 'nonBankCustomer':
      return notBankCustomersData.value.length > 0;
    case 'nonBankTransaction':
      return notBankTransactionsData.value.length > 0;
    default:
      return false;
  }
});

// 计算属性：检查当前激活的选项卡是否有数据
const hasParseTableData = computed(() => {
  switch (parseActiveTab.value) {
    case 'parseEntity':
      return parseEntityData.value.length > 0;
    case 'parseTrans':
      return parseTransData.value.length > 0;
    case 'parseOrder':
      return parseOrderData.value.length > 0;
    default:
      return false;
  }
});


// 客户信息分页配置
const parseEntityPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 交易信息分页配置
const parseTransPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

// 交易信息分页配置
const parseOrderPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const parseActiveTab = ref('parseEntity'); // 默认激活第一个选项卡

// 选项卡切换处理
const handleParseTabChange = (key) => {
  // 重置目标选项卡的分页参数
  switch (key) {
    case 'parseEntity':
      parseEntityPagination.current = 1;
      break;
    case 'parseTrans':
      parseTransPagination.current = 1;
      break;
    case 'parseOrder':
      parseOrderPagination.current = 1;
      break;
  }

  // 如果当前选项卡没有数据，则加载数据
  if (!hasParseTableData.value) {
    loadParseTabData(key);
  }
};

// 企业客户信息表格列配置
const parseEntityColumns = ref([
  { title: '归属机构', dataIndex: 'orgCd', width: 120, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerCd', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 120, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 150, resizable: true },
  { title: '营业执照', dataIndex: 'enterpriseLicenseNum', width: 120, resizable: true },
  { title: '法人姓名', dataIndex: 'enterpriseLegalPersonName', width: 100, resizable: true }
]);



// 交易流水表格列配置
// const transactionFlowColumns = ref([
//   { title: '行号', dataIndex: 'rowNumber', width: 80 },
//   { title: '发起行', dataIndex: 'deptCaseCode', width: 120 },
//   { title: '户名', dataIndex: 'customerName', width: 120 },
//   { title: '账号', dataIndex: 'transAccountNo', width: 150 },
//   { title: '卡号', dataIndex: 'relAccountNo', width: 150 },
//   { title: '流水号', dataIndex: 'transNo', width: 120 },
//   { title: '交易渠道', dataIndex: 'channel', width: 100 },
//   { title: '币种', dataIndex: 'currNo', width: 80 },
//   { title: '交易方向', dataIndex: 'transWay', width: 100 },
//   { title: '交易金额', dataIndex: 'transAmt', width: 120 },
//   { title: '交易种类', dataIndex: 'transType', width: 100 },
//   { title: '交易余额', dataIndex: 'transactionBalance', width: 120 },
//   { title: '业务日期', dataIndex: 'bizDate', width: 120 },
//   { title: '交易时间', dataIndex: 'transTime', width: 120 },
//   { title: '对方开户银行', dataIndex: 'counterOrgName', width: 150 },
//   { title: '对方户名', dataIndex: 'counterName', width: 120 },
//   { title: '对方账号', dataIndex: 'counterAccountNo', width: 150 },
//   { title: '交易状态', dataIndex: 'status', width: 100 },
//   { title: 'IP地址', dataIndex: 'ipAddress', width: 120 },
//   { title: '其他字段', dataIndex: 'otherFields', width: 120 }
// ]);

const parseTransColumns = ref([
  { title: '发起行', dataIndex: 'orgCd', width: 120, resizable: true },
  { title: '户名', dataIndex: 'customerName', width: 120, resizable: true },
  { title: '账号', dataIndex: 'transAccountNo', width: 150, resizable: true },
  { title: '卡号', dataIndex: 'relAccountNo', width: 150, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 120, resizable: true },
  { title: '交易渠道', dataIndex: 'channel', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 80, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 120, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 120, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 120, resizable: true },
  { title: '对方开户银行', dataIndex: 'counterOrgCd', width: 150, resizable: true },
  { title: '对方户名', dataIndex: 'counterName', width: 120, resizable: true },
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 150, resizable: true },
  { title: '交易状态', dataIndex: 'status', width: 100 , resizable: true}
]);

// 订单信息表格列配置
const parseOrderColumns = ref([
  { title: '订单号', dataIndex: 'orderNo', width: 150 , resizable: true},
  { title: '流水号', dataIndex: 'transNo', width: 150, resizable: true },
  { title: '商品名称', dataIndex: 'productorName', width: 200, resizable: true }
]);

// 客户信息表格列配置
const customerColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100, resizable: true},
  { title: '归属银行', dataIndex: 'orgCd', width: 100, resizable: true},
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true},
  { title: '客户名称', dataIndex: 'customerName', width: 100, resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true},
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true},
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true},
  { title: '账号', dataIndex: 'accountNum', width: 100, resizable: true},
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true},
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true},
  { title: '开户日期', dataIndex: 'openDate', width: 100, resizable: true},
  { title: '余额', dataIndex: 'balence', width: 100, resizable: true},
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100, resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true},
  { title: '操作', dataIndex: 'operation',  width: 120, fixed: 'right' as const , resizable: true}
]);

// 交易流水表格列配置
const transactionColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100 , resizable: true},
  { title: '归属机构', dataIndex: 'orgCd', width: 100, resizable: true },
  { title: '账号', dataIndex: 'accountNum', width: 100 , resizable: true},
  { title: '卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 100 , resizable: true},
  { title: '交易渠道', dataIndex: 'channel', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 100, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '余额', dataIndex: 'balence', width: 100 , resizable: true},
  { title: '交易种类', dataIndex: 'transType', width: 100 , resizable: true},
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100 , resizable: true},
  { title: '设备MAC', dataIndex: 'macAddress', width: 100 , resizable: true},
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true },
  { title: '交易状态', dataIndex: 'status', width: 100, resizable: true },
  { title: '对方机构', dataIndex: 'counterOrgName', width: 100, resizable: true },
  { title: '对方客户号', dataIndex: 'counterCustomerId', width: 100 , resizable: true},
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 100, resizable: true },
  { title: '对方户名', dataIndex: 'counterName', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '户名', dataIndex: 'customerName', width: 100 , resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100 , resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100 , resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100, resizable: true },
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100 , resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true},
  { title: '操作', dataIndex: 'operation',  width: 120, fixed: 'right' as const, resizable: true },
]);

//const nonBankCustomerColumns = ref([...customerColumns.value]);
//const nonBankTransactionColumns = ref([...transactionColumns.value]);

// 表格列定义
const nonBankCustomerColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100 , resizable: true},
  { title: '归属机构', dataIndex: 'orgCd', width: 100 , resizable: true},
  { title: '客户号', dataIndex: 'customerId', width: 100, resizable: true },
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '客户名称', dataIndex: 'customerName', width: 100 , resizable: true},
  { title: '营业执照', dataIndex: 'licenseNum', width: 100 , resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100, resizable: true },
  { title: '证件号码', dataIndex: 'idNum', width: 100 , resizable: true},
  { title: '手机号码', dataIndex: 'teleNum', width: 100 , resizable: true},
  { title: '是否商户', dataIndex: 'isMerchant', width: 100 , resizable: true},
  { title: '商户号', dataIndex: 'merchantId', width: 100, resizable: true },
  { title: '终端号', dataIndex: 'portId', width: 100 , resizable: true},
  { title: '结算银行', dataIndex: 'settlementOrg', width: 100, resizable: true },
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 100, resizable: true },
  { title: '状态', dataIndex: 'customerStatus', width: 100, resizable: true },
  { title: '账户类型', dataIndex: 'accountType', width: 100, resizable: true },
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '开户日期', dataIndex: 'openDate', width: 100 , resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100 , resizable: true},
  { title: '商户名称', dataIndex: 'merchantName', width: 100 , resizable: true},
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true},
  { title: '操作', dataIndex: 'operation',  width: 120, fixed: 'right' as const, resizable: true },
]);


const nonBankTransactionColumns = ref([
  { title: '行号', dataIndex: 'rowNum', width: 100 , resizable: true},
  { title: '归属机构', dataIndex: 'orgCd', width: 100 , resizable: true},
  { title: '商户号', dataIndex: 'merchantId', width: 100 , resizable: true},
  { title: '终端号', dataIndex: 'portId', width: 100, resizable: true },
  { title: '订单号', dataIndex: 'orderNo', width: 100 , resizable: true},
  { title: '商户名称', dataIndex: 'merchantName', width: 100, resizable: true },
  { title: '商品名称', dataIndex: 'productName', width: 100, resizable: true },
  { title: '流水号', dataIndex: 'transNo', width: 120, resizable: true },
  { title: '币种', dataIndex: 'currNo', width: 80, resizable: true },
  { title: '交易方向', dataIndex: 'transWay', width: 100, resizable: true },
  { title: '交易金额', dataIndex: 'transAmt', width: 120, resizable: true },
  { title: '贷方发生额', dataIndex: 'creditAmt', width: 100, resizable: true },
  { title: '交易种类', dataIndex: 'transType', width: 100, resizable: true },
  { title: '业务日期', dataIndex: 'bizDate', width: 100, resizable: true },
  { title: '交易时间', dataIndex: 'transTime', width: 100 , resizable: true},
  { title: '设备MAC', dataIndex: 'macAddress', width: 100 , resizable: true},
  { title: '交易IP地址', dataIndex: 'ipAddress', width: 100, resizable: true },
  { title: '交易状态', dataIndex: 'status', width: 100 , resizable: true},
  { title: '交易卡开户行', dataIndex: 'openOrgCd', width: 100, resizable: true },
  { title: '户名', dataIndex: 'customerName', width: 100, resizable: true },
  { title: '交易卡号', dataIndex: 'cardNum', width: 100, resizable: true },
  { title: '卡类型', dataIndex: 'cardType', width: 100 , resizable: true},
  { title: '附加字段', dataIndex: 'addiCols', width: 100, resizable: true},
  { title: '创建日期', dataIndex: 'createTime', width: 100, resizable: true },
  { title: '客户号', dataIndex: 'customerId', width: 100 , resizable: true},
  { title: '备注', dataIndex: 'comment', width: 100 , resizable: true},
  { title: '客户种类', dataIndex: 'customerType', width: 100, resizable: true },
  { title: '营业执照', dataIndex: 'licenseNum', width: 100 , resizable: true},
  { title: '法人姓名', dataIndex: 'legalPersonName', width: 100, resizable: true },
  { title: '证件种类', dataIndex: 'idType', width: 100 , resizable: true},
  { title: '证件号码', dataIndex: 'idNum', width: 100, resizable: true },
  { title: '手机号码', dataIndex: 'teleNum', width: 100 , resizable: true},
  { title: '结算行', dataIndex: 'settlementOrg', width: 100, resizable: true },
  { title: '结算账号', dataIndex: 'settlementAccountNum', width: 100, resizable: true },
  { title: '清洗规则', dataIndex: 'cleanRule', width: 100, resizable: true},
  { title: '操作', dataIndex: 'operation',  width: 120, fixed: 'right' as const, resizable: true },
]);

onMounted(() => {
  fetchStandardFileList();
});

// 获取标准数据查看列表
const fetchStandardFileList = async () => {
  try {
    fileLoading.value = true;
    const params = {
      caseId: query.caseId as string,
      fileName: searchText.value || null,
      pageNo: filePagination.current,
      pageSize: filePagination.pageSize
    };
    const response = await standardFilePageListApi(params);
    filteredFiles.value = response.records || [];
    filePagination.total = response.total || 0;
    filePagination.totalPage = Math.ceil(filePagination.total / filePagination.pageSize) || 0;

  } catch (error) {
    console.error('获取文件列表失败:', error);
  } finally {
    fileLoading.value = false;
    searchLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  filePagination.current = 1;
  fetchStandardFileList();
};

// 上一页
const prevPage = () => {
  if (filePagination.current > 1) {
    filePagination.current--;
    fetchStandardFileList();
  }
};

// 下一页
const nextPage = () => {
  if (filePagination.current < filePagination.totalPage) {
    filePagination.current++;
    fetchStandardFileList();
  }
};

// 选择文件
const selectFile = async(file: FileItem) => {
  try {
    selectedFileId.value = file.id;
    sheetLoading.value = true;
    const params = {
      fileId:file.id,
    };
    const response = await standardSheetListApi(params);
    sheets.value = response;
    sheetLoading.value = false;
    selectedSheet.value = null;
    customerData.value = [];
    transactionData.value = [];
  } catch (error) {

  } finally {
    sheetLoading.value = false;
  }

};

// 选项卡切换处理
const handleTabChange = (key) => {
  // 重置目标选项卡的分页参数
  switch (key) {
    case 'customer':
      customerPagination.current = 1;
      break;
    case 'transaction':
      transactionPagination.current = 1;
      break;
    case 'nonBankCustomer':
      nonBankCustomerPagination.current = 1;
      break;
    case 'nonBankTransaction':
      nonBankTransactionPagination.current = 1;
      break;
  }

  // 如果当前选项卡没有数据，则加载数据
  if (!hasTableData.value) {
    loadTabData(key);
  }
};

// 表格分页变化处理
const handleCustomerTableChange = (pagination) => {
  customerPagination.current = pagination.current;
  customerPagination.pageSize = pagination.pageSize;
  loadTabData('customer');
};

const handleTransactionTableChange = (pagination) => {
  transactionPagination.current = pagination.current;
  transactionPagination.pageSize = pagination.pageSize;
  loadTabData('transaction');
};

const handleNonBankCustomerTableChange = (pagination) => {
  nonBankCustomerPagination.current = pagination.current;
  nonBankCustomerPagination.pageSize = pagination.pageSize;
  loadTabData('nonBankCustomer');
};

const handleNonBankTransactionTableChange = (pagination) => {
  nonBankTransactionPagination.current = pagination.current;
  nonBankTransactionPagination.pageSize = pagination.pageSize;
  loadTabData('nonBankTransaction');
};

// 加载选项卡数据
const loadTabData = async (tabKey) => {
  if (!selectedFileId.value || !selectedSheet.value) return;

  try {
    tableLoading.value = true;

    let pageNo, pageSize, params;

    switch (tabKey) {
      case 'customer':
        pageNo = customerPagination.current;
        pageSize = customerPagination.pageSize;
        params = {
         // fileId: selectedFileId.value,
          filePageId: selectedSheet.value.pageId,
          pageNo,
          pageSize
        };
        const customerResponse = await standardCustomerApi(params);
        customerData.value = customerResponse.records || customerResponse.bankCustomers || [];
        customerPagination.total = customerResponse.total || customerResponse.records?.length || 0;
        break;

      case 'transaction':
        pageNo = transactionPagination.current;
        pageSize = transactionPagination.pageSize;
        params = {
          //fileId: selectedFileId.value,
          filePageId: selectedSheet.value.pageId,
          pageNo,
          pageSize
        };
        const transactionResponse = await standardTransApi(params);
        transactionData.value = transactionResponse.records || transactionResponse.bankTransactions || [];
        transactionPagination.total = transactionResponse.total || transactionResponse.records?.length || 0;
        break;

      case 'nonBankCustomer':
        pageNo = nonBankCustomerPagination.current;
        pageSize = nonBankCustomerPagination.pageSize;
        params = {
        //  fileId: selectedFileId.value,
          filePageId: selectedSheet.value.pageId,
          pageNo,
          pageSize
        };
        const nonBankCustomerResponse = await standardNonBankCustomerApi(params);
        notBankCustomersData.value = nonBankCustomerResponse.records || nonBankCustomerResponse.notBankCustomers || [];
        nonBankCustomerPagination.total = nonBankCustomerResponse.total || nonBankCustomerResponse.records?.length || 0;
        break;

      case 'nonBankTransaction':
        pageNo = nonBankTransactionPagination.current;
        pageSize = nonBankTransactionPagination.pageSize;
        params = {
         // fileId: selectedFileId.value,
          filePageId: selectedSheet.value.pageId,
          pageNo,
          pageSize
        };
        const nonBankTransactionResponse = await standardNonBankTransApi(params);
        notBankTransactionsData.value = nonBankTransactionResponse.records || nonBankTransactionResponse.notBankTransactions || [];
        nonBankTransactionPagination.total = nonBankTransactionResponse.total || nonBankTransactionResponse.records?.length || 0;
        break;
    }
  } catch (error) {
    console.error(`加载${tabKey}数据失败:`, error);
  } finally {
    tableLoading.value = false;
  }
};


// 表格分页变化处理
const handleParseEntityTableChange = (pagination) => {
  parseEntityPagination.current = pagination.current;
  parseEntityPagination.pageSize = pagination.pageSize;
  loadParseTabData('parseEntity');
};

// 表格分页变化处理
const handleParseTransTableChange = (pagination) => {
  parseTransPagination.current = pagination.current;
  parseTransPagination.pageSize = pagination.pageSize;
  loadParseTabData('parseTrans');
};

// 表格分页变化处理
const handleParseOrderTableChange = (pagination) => {
  parseOrderPagination.current = pagination.current;
  parseOrderPagination.pageSize = pagination.pageSize;
  loadParseTabData('parseOrder');
};

// 加载选项卡数据
const loadParseTabData = async (tabKey) => {


  try {
    tableLoading.value = true;

    let pageNo, pageSize,caseId,dataType,dataId, params;
    caseId = parseDataParams.caseId;
    dataType = parseDataParams.dataType;
    dataId = parseDataParams.dataId;
    if (!dataId || !dataId) return;

    switch (tabKey) {
      case 'parseEntity':
        pageNo = parseEntityPagination.current;
        pageSize = parseEntityPagination.pageSize;
        params = {
          caseId,
          dataType,
          dataId,
          pageNo,
          pageSize
        };
        const parseEntityResponse = await getParseStandardEntityApi(params);
        parseEntityData.value = parseEntityResponse.records || [];
        parseEntityPagination.total = parseEntityResponse.total || parseEntityResponse.records?.length || 0;
        break;

      case 'parseTrans':
        pageNo = parseTransPagination.current;
        pageSize = parseTransPagination.pageSize;
        params = {
          caseId,
          dataType,
          dataId,
          pageNo,
          pageSize
        };
        const parseTransResponse = await getParseStandardTransApi(params);
        parseTransData.value = parseTransResponse.records || [];
        parseTransPagination.total = parseTransResponse.total || parseTransResponse.records?.length || 0;
        break;

      case 'parseOrder':
        pageNo = parseOrderPagination.current;
        pageSize = parseOrderPagination.pageSize;
        params = {
          caseId,
          dataType,
          dataId,
          pageNo,
          pageSize
        };
        const parseOrderResponse = await getParseStandardOrderApi(params);
        parseOrderData.value = parseOrderResponse.records || [];
        parseOrderPagination.total = parseOrderResponse.total || parseOrderResponse.records?.length || 0;
        break;
    }
  } catch (error) {
    console.error(`加载${tabKey}数据失败:`, error);
  } finally {
    tableLoading.value = false;
  }
};


// 选择Sheet页
const selectSheet = async(sheet: SheetItem) => {
  try {
    selectedSheet.value = sheet;
    activeTab.value = 'customer';

    // 重置所有分页参数
    customerPagination.current = 1;
    customerPagination.total = 0;
    transactionPagination.current = 1;
    transactionPagination.total = 0;
    nonBankCustomerPagination.current = 1;
    nonBankCustomerPagination.total = 0;
    nonBankTransactionPagination.current = 1;
    nonBankTransactionPagination.total = 0;

    // 清空所有数据
    customerData.value = [];
    transactionData.value = [];
    notBankCustomersData.value = [];
    notBankTransactionsData.value = [];

    // 加载第一个选项卡的数据
    await loadTabData('customer');
  } catch (error) {
    console.error('选择Sheet页失败:', error);
  }
};

// 查看解析详情接口
const getAnalyzeResult = async(record: any, dataType: string) => {
  try {

    parseDataParams.caseId = query.caseId as string;
    parseDataParams.dataType = dataType;
    parseDataParams.dataId = record.id;

    loadParseTabData("parseEntity");

    // 显示弹框
    analyzeModalVisible.value = true;

  } catch (error) {
    console.error('获取分析结果失败:', error);
    // 清空数据
    parseEntityData.value = [];
    parseTransData.value = [];
    parseOrderData.value = [];
    analyzeModalVisible.value = true;
  }
};

// 关闭分析结果弹框
const closeAnalyzeModal = () => {
  analyzeModalVisible.value = false;
  // 清空数据
  parseEntityData.value = [];
  parseTransData.value = [];
  parseOrderData.value = [];
};

const [registerCustomerTable] = useTable({
  columns: customerColumns.value,
  dataSource: customerData,
  loading: tableLoading,
  pagination: customerPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-customer'
  }
});

const [registerTransactionTable] = useTable({
  columns: transactionColumns.value,
  dataSource: transactionData,
  loading: tableLoading,
  pagination: transactionPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-transaction'
  }
});

const [registerNonBankCustomerTable] = useTable({
  columns: nonBankCustomerColumns.value,
  dataSource: notBankCustomersData,
  loading: tableLoading,
  pagination: nonBankCustomerPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-non-bank-customer'
  }
});

const [registerNonBankTransactionTable] = useTable({
  columns: nonBankTransactionColumns.value,
  dataSource: notBankTransactionsData,
  loading: tableLoading,
  pagination: nonBankTransactionPagination,
  bordered: true,
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-non-bank-transaction'
  }
});

const [registerParseEntityTable] = useTable({
  columns: parseEntityColumns.value,
  dataSource: parseEntityData,
  loading: tableLoading,
  pagination: parseEntityPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-parse-entity'
  }
});

const [registerParseTransTable] = useTable({
  columns: parseTransColumns.value,
  dataSource: parseTransData,
  loading: tableLoading,
  pagination: parseTransPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-parse-trans'
  }
});

const [registerParseOrderTable] = useTable({
  columns: parseOrderColumns.value,
  dataSource: parseOrderData,
  loading: tableLoading,
  pagination: parseOrderPagination,
  bordered: true,
  size: 'small',
  scroll: { x: 1500, y: 500 },
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab3-parse-order'
  }
});

</script>

<style scoped>
.search-box {
  margin-bottom: 10px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}

.pagination-controls .page-info {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.file-list, .sheet-list {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 10px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
}

.file-item, .sheet-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-item:hover, .sheet-item:hover {
  background-color: #f0f7ff;
}

.file-item.active, .sheet-item.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.table-section {
  margin-bottom: 24px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #262626;
  padding-left: 8px;
  border-left: 4px solid #1890ff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.table-tab :deep(.ant-table-body) {
  height: 462px;
}

.table-tab :deep(.ant-table-placeholder .ant-table-cell) {
  border: none!important;
}

.full-modal .ant-modal {
  transition: all 0.3s ease;
}

.full-modal .ant-modal.is-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  top: 0 !important;
  left: 0 !important;
  max-width: 100% !important;
}

.fullscreen-btn {
  position: absolute !important;
  right: 44px !important;
  top: 12px !important;
  color: #1890ff !important;
  border: 1px solid #d9d9d9 !important;
  background: #fff !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  height: auto !important;
}

.fullscreen-btn:hover {
  color: #40a9ff !important;
  border-color: #40a9ff !important;
  background: #f0f8ff !important;
}
</style>
