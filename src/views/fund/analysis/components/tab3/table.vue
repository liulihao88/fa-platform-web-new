<template>
  <a-row :gutter="20" class="mt2">
    <!-- 左侧文件列表 -->
    <a-col :span="4">
      <div class="search-box">
        <a-input-search
            v-model:value="searchText"
            placeholder="搜索文件名称"
            @search="handleSearch"
            enter-button
        />
      </div>
      <h3>文件列表</h3>
      <div class="file-list">
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
      <h3 class="mt13">Sheet列表</h3>
      <div class="sheet-list">
        <a-spin :spinning="sheetLoading">
          <div
              v-for="sheet in sheets"
              :key="sheet"
              :class="['sheet-item', { active: selectedSheet === sheet }]"
              @click="selectSheet(sheet)"
          >
            {{ sheet.pageName }}
          </div>
        </a-spin>
      </div>
    </a-col>

    <!-- 右侧数据表格 -->
    <a-col :span="17">
      <a-card class="mt21">
        <a-spin :spinning="tableLoading">
          <!-- 客户信息表格 -->
          <div class="table-section" v-if="customerData.length">
            <div class="table-title">客户信息</div>
            <a-table
                :columns="customerColumns"
                :data-source="customerData"
                :pagination="false"
                bordered
                size="small"
                :scroll="{ x: 1500, y: 500 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <a @click="getAnalyzeResult(record,'01')">查看详情</a>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 交易流水表格 -->
          <div class="table-section" v-if="transactionData.length">
            <div class="table-title">交易流水</div>
            <a-table
                :columns="transactionColumns"
                :data-source="transactionData"
                :pagination="false"
                bordered
                size="small"
                :scroll="{ x: 1500, y: 500 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <a @click="getAnalyzeResult(record,'02')">查看详情</a>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 非银行客户信息 -->
          <div class="table-section" v-if="notBankCustomersData.length">
            <div class="table-title">非银行客户信息</div>
            <a-table
                :columns="nonBankCustomerColumns"
                :data-source="notBankCustomersData"
                :pagination="false"
                bordered
                size="small"
                :scroll="{ x: 1500, y: 500 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <a @click="getAnalyzeResult(record,'03')">查看详情</a>
                </template>
              </template>
            </a-table>
          </div>
          <!-- 非银行交易流水 -->
          <div class="table-section" v-if="notBankTransactionsData.length">
            <div class="table-title">非银行交易流水</div>
            <a-table
                :columns="nonBankTransactionColumns"
                :data-source="notBankTransactionsData"
                :pagination="false"
                bordered
                size="small"
                :scroll="{ x: 1500, y: 500 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation'">
                  <a @click="getAnalyzeResult(record,'04')">查看详情</a>
                </template>
              </template>
            </a-table>
          </div>


          <div v-if="!customerData.length && !transactionData.length && !tableLoading" class="loading-container">
            <a-empty description="请选择文件及Sheet页查看数据" />
          </div>
        </a-spin>
      </a-card>

    </a-col>
  </a-row>

  <!-- 修改后的分析结果弹框 -->
  <a-modal
      v-model:visible="analyzeModalVisible"
      title="数据解析详情"
      width="90%"
      style="top: 20px;"
      :footer="null"
      @cancel="closeAnalyzeModal"
  >
    <a-card>
      <!-- 企业客户信息表 -->
      <div class="table-section" v-if="analyzeData.customerInfo.length">
        <div class="table-title">企业客户信息</div>
        <a-table
            :columns="enterpriseCustomerColumns"
            :data-source="analyzeData.customerInfo"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1500, y: 400 }"
        />
      </div>

      <!-- 交易流水表 -->
      <div class="table-section" v-if="analyzeData.transactionFlow.length">
        <div class="table-title">交易流水</div>
        <a-table
            :columns="transactionFlowColumns"
            :data-source="analyzeData.transactionFlow"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1800, y: 400 }"
        />
      </div>

      <!-- 订单表 -->
      <div class="table-section" v-if="analyzeData.orderInfo.length">
        <div class="table-title">订单信息</div>
        <a-table
            :columns="orderInfoColumns"
            :data-source="analyzeData.orderInfo"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1200, y: 400 }"
        />
      </div>

      <div v-if="!hasAnalyzeData" class="no-data-container">
        <a-empty description="暂无解析数据" />
      </div>
    </a-card>
  </a-modal>
</template>

<script lang="ts" name="tab1" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from "vue-router";
import {
  getAnalyzesultApi,
  standardFileListApi,
  standardSheetListApi,
  standardTableApi
} from "@/views/fund/analysis/user.api";

const { query } = useRoute();

const tableLoading = ref(false);
const searchLoading = ref(false);
const searchText = ref('');
const fileLoading = ref(false);
const sheetLoading = ref(false);
const selectedFileId = ref(null);
const selectedSheet = ref(null);
const filteredFiles = reactive([])
const sheets = ref([]);
const customerData = ref([]);
const transactionData = ref([]);
const notBankCustomersData = ref([]);
const notBankTransactionsData = ref([]);

// 分析结果弹框相关状态
const analyzeModalVisible = ref(false);
const analyzeData = reactive({
  customerInfo: [],
  transactionFlow: [],
  orderInfo: []
});

// 计算属性：检查是否有分析数据
const hasAnalyzeData = computed(() => {
  return analyzeData.customerInfo.length > 0 ||
      analyzeData.transactionFlow.length > 0 ||
      analyzeData.orderInfo.length > 0;
});

// 企业客户信息表格列配置
const enterpriseCustomerColumns = ref([
  { title: '行号', dataIndex: 'rowNumber', width: 80 },
  { title: '归属机构', dataIndex: 'orgCd', width: 120 },
  { title: '客户种类', dataIndex: 'customerType', width: 100 },
  { title: '客户名称', dataIndex: 'customerName', width: 120 },
  { title: '证件种类', dataIndex: 'idType', width: 100 },
  { title: '证件号码', dataIndex: 'idNum', width: 150 },
  { title: '营业执照', dataIndex: 'enterpriseLicenseNum', width: 120 },
  { title: '法人姓名', dataIndex: 'enterpriseLegalPersonName', width: 100 },
  { title: '是否商户', dataIndex: 'isMerchant', width: 80 },
  { title: '商户号', dataIndex: 'merchantNumber', width: 100 },
  { title: '终端号', dataIndex: 'terminalNumber', width: 80 },
  { title: '结算银行', dataIndex: 'settlementBank', width: 150 },
  { title: '结算账号', dataIndex: 'settlementAccount', width: 150 },
  { title: '币种', dataIndex: 'currency', width: 80 },
  { title: '账户类型', dataIndex: 'accountType', width: 100 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '其他字段', dataIndex: 'otherFields', width: 120 }
]);

// 交易流水表格列配置
const transactionFlowColumns = ref([
  { title: '行号', dataIndex: 'rowNumber', width: 80 },
  { title: '发起行', dataIndex: 'deptCaseCode', width: 120 },
  { title: '户名', dataIndex: 'customerName', width: 120 },
  { title: '账号', dataIndex: 'transAccountNo', width: 150 },
  { title: '卡号', dataIndex: 'relAccountNo', width: 150 },
  { title: '流水号', dataIndex: 'transNo', width: 120 },
  { title: '交易渠道', dataIndex: 'channel', width: 100 },
  { title: '币种', dataIndex: 'currNo', width: 80 },
  { title: '交易方向', dataIndex: 'transWay', width: 100 },
  { title: '交易金额', dataIndex: 'transAmt', width: 120 },
  { title: '交易种类', dataIndex: 'transType', width: 100 },
  { title: '交易余额', dataIndex: 'transactionBalance', width: 120 },
  { title: '业务日期', dataIndex: 'bizDate', width: 120 },
  { title: '交易时间', dataIndex: 'transTime', width: 120 },
  { title: '对方开户银行', dataIndex: 'counterOrgName', width: 150 },
  { title: '对方户名', dataIndex: 'counterName', width: 120 },
  { title: '对方账号', dataIndex: 'counterAccountNo', width: 150 },
  { title: '交易状态', dataIndex: 'status', width: 100 },
  { title: 'IP地址', dataIndex: 'ipAddress', width: 120 },
  { title: '其他字段', dataIndex: 'otherFields', width: 120 }
]);

// 订单信息表格列配置
const orderInfoColumns = ref([
  { title: '发起机构', dataIndex: 'issuingOrg', width: 120 },
  { title: '订单号', dataIndex: 'orderNo', width: 150 },
  { title: '流水号', dataIndex: 'transNo', width: 150 },
  { title: '商品名称', dataIndex: 'productorName', width: 200 },
  { title: '客户名称', dataIndex: 'customerName', width: 120 },
  { title: '账号', dataIndex: 'transAccountNo', width: 150 },
  { title: '其他字段', dataIndex: 'otherFields', width: 120 }
]);

// 客户信息表格列配置
const customerColumns = ref([
  { title: '归属机构', dataIndex: 'affiliatedOrg', width: 100 },
  { title: '客户种类', dataIndex: 'customerType',  width: 100 },
  { title: '客户名称', dataIndex: 'customerName', width: 120 },
  { title: '证件种类', dataIndex: 'idType',  width: 100 },
  { title: '证件号码', dataIndex: 'idNumber',  width: 150 },
  { title: '营业执照', dataIndex: 'businessLicense', width: 120 },
  { title: '法人姓名', dataIndex: 'legalPersonName',  width: 100 },
  { title: '是否商户', dataIndex: 'isMerchant',  width: 80 },
  { title: '商户号', dataIndex: 'customerNumber',  width: 100 },
  { title: '终端号', dataIndex: 'terminalNumber',  width: 80 },
  { title: '结算银行', dataIndex: 'settlementBank',  width: 150 },
  { title: '结算账号', dataIndex: 'settlementAccount', width: 150 },
  { title: '币种', dataIndex: 'currency',  width: 80 },
  { title: '账户类型', dataIndex: 'accountType',  width: 100 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '其他字段', dataIndex: 'otherFields',  width: 120 },
  { title: '操作', dataIndex: 'operation',  width: 100, fixed: 'right' },
]);

// 交易流水表格列配置
const transactionColumns = ref([
  { title: '发起行', dataIndex: 'initiatingBank', width: 100 },
  { title: '户名', dataIndex: 'accountName',  width: 120 },
  { title: '账号', dataIndex: 'accountNumber',  width: 150 },
  { title: '卡号', dataIndex: 'cardNumber',  width: 150 },
  { title: '流水号', dataIndex: 'serialNumber', width: 120 },
  { title: '交易渠道', dataIndex: 'channel',  width: 100 },
  { title: '币种', dataIndex: 'currency', width: 80 },
  { title: '交易方向', dataIndex: 'transactionDirection',  width: 100 },
  { title: '交易金额', dataIndex: 'transactionAmount',  width: 120 },
  { title: '交易种类', dataIndex: 'transactionType',  width: 100 },
  { title: '交易余额', dataIndex: 'transactionBalance',  width: 120 },
  { title: '业务日期', dataIndex: 'businessDate', width: 120 },
  { title: '交易时间', dataIndex: 'transactionTime', width: 120 },
  { title: '对方开户银行', dataIndex: 'oppositeBank',  width: 150 },
  { title: '对方户名', dataIndex: 'oppositeAccountName', width: 120 },
  { title: '对方账号/卡号', dataIndex: 'oppositeAccountNumber',  width: 150 },
  { title: '交易状态', dataIndex: 'transactionStatus', width: 100 },
  { title: 'IP地址', dataIndex: 'ipAddress', width: 120 },
  { title: '其他字段', dataIndex: 'otherFields',width: 120 },
  { title: '操作', dataIndex: 'operation',  width: 100, fixed: 'right' },
]);

const nonBankCustomerColumns = ref([...customerColumns.value]);
const nonBankTransactionColumns = ref([...transactionColumns.value]);

onMounted(() => {
  fetchStandardFileList()
});

// 获取标准数据查看列表
const fetchStandardFileList = async () => {
  try {
    fileLoading.value = true;
    const params = {
      caseId: query.caseId,
      fileName: searchText.value,
    };
    const response = await standardFileListApi(params);
    Object.assign(filteredFiles, response||[]);
  } catch (error) {
  } finally {
    fileLoading.value = false;
    searchLoading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  fetchStandardFileList()
};

// 选择文件
const selectFile = async(file) => {
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

// 选择Sheet页
const selectSheet = async(sheet) => {
  try {
    selectedSheet.value = sheet;
    tableLoading.value = true;
    const params = {
      fileId:selectedFileId.value,
      filePageId: sheet.pageId,
     // filePageId: '40288188995b3e1901995b51ee2c0005',
    };
    const response = await standardTableApi(params);
    const {bankCustomers,bankTransactions,notBankCustomers,notBankTransactions} = response
    customerData.value = bankCustomers
    transactionData.value = bankTransactions
    notBankCustomersData.value = notBankCustomers
    notBankTransactionsData.value = notBankTransactions
  } catch (error) {

  } finally {
    tableLoading.value = false;
  }
};

// 查看解析详情接口
const getAnalyzeResult = async(record,dataType) => {
  try {
    const params = {
      caseId: query.caseId,
      dataType,
      dataId: record.id
    };

    const response = await getAnalyzesultApi(params);
    const {faStandardEntities,faStandardTrans,faStandardOrders} = response

    // 根据接口返回的数据结构，映射到三个表格
    analyzeData.faStandardEntities = faStandardEntities ||  [];
    analyzeData.faStandardTrans = faStandardTrans || [];
    analyzeData.faStandardOrders = faStandardOrders || [];

    // 显示弹框
    analyzeModalVisible.value = true;

  } catch (error) {
    console.error('获取分析结果失败:', error);
    // 清空数据
    analyzeData.faStandardEntities = [];
    analyzeData.faStandardTrans = [];
    analyzeData.faStandardOrders = [];
    analyzeModalVisible.value = true;
  }
};

// 关闭分析结果弹框
const closeAnalyzeModal = () => {
  analyzeModalVisible.value = false;
  // 清空数据
  analyzeData.faStandardEntities = [];
  analyzeData.faStandardTrans = [];
  analyzeData.faStandardOrders = [];
};

</script>

<style scoped>
.search-box {
  margin-bottom: 20px;
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
</style>
