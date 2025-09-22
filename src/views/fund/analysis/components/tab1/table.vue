<template>
  <!-- 搜索卡片 -->
  <a-card class="m2">
    <a-form
        ref="formRef"
        class="search-form"
        name="advanced_search"
        :model="formState"
        @finish="onSearch"
    >
      <!-- 增加行间距为32px -->
      <a-row gutter="16">
        <a-col :span="24">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                  name="folder"
                  label="文件夹"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-input v-model:value="formState.folder" placeholder="请输入文件夹名称" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                  name="fileName"
                  label="文件名称"
                  :labelCol="{ span: 5 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-input v-model:value="formState.fileName" placeholder="请输入文件名称"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                  name="fileStatus"
                  label="状态"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 18 }"
              >
                <a-select v-model:value="formState.fileStatus" placeholder="请选择状态">
                  <a-select-option
                      v-for="item in props.fileProcessOptions"
                      :key="item.value"
                      :value="item.value"
                  >
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <a-row gutter="16">
        <a-col :span="24" class="search-buttons">
          <a-button type="primary" html-type="submit" :loading="searchLoading">查询</a-button>
          <a-button class="ml2" @click="resetSearch">重置</a-button>
          <a-button type="primary" class="ml2 upload-button" @click="uploadFile">上传文件</a-button>
          <a-button class="ml2" type="primary" @click="confirmFileConvert">确认文件转换</a-button>
        </a-col>
      </a-row>
    </a-form>
  </a-card>

  <!-- 表格部分 -->
  <a-table
      class="m2"
      :columns="columns"
      :data-source="dataSource"
      :scroll="{ x: 1500 }"
      :loading="tableLoading"
      bordered
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ index + 1 }}
      </template>
      <template v-if="column.dataIndex === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template v-if="column.key === 'operation'">
        <div class="table-operations">
          <a-button size="small" @click="editFile(record)">转换查看</a-button>
          <a-button class="ml1" size="small" type="primary" danger @click="deleteFile(record)">删除</a-button>
        </div>
      </template>
    </template>
  </a-table>
  <!-- 编辑文件的Modal弹框 -->
  <a-modal
      v-model:visible="editModalVisible"
      title="文件转换详情"
      :footer="null"
      width="100%"
      wrap-class-name="full-modal"
      @ok="closeEditModal"
      @cancel="closeEditModal"
  >
    <a-card>
      <a-row :gutter="16">
        <a-col span="10">
          <a-card title="源文件视图" size="small">
            <a-row>
              <a-col span="24">文件名称：{{ currentFile.fileName || '-' }}</a-col>
            </a-row>
            <a-row>
              <a-col v-if="['xls', 'xlsx', 'xlsm'].includes(currentFileType)" span="24" style="height: 600px" >
                <VueOfficeExcel
                    :src="fileStreamInfo"
                    :options="vueExcelOptions"
                    @rendered="onExcelRendered"
                    @error="onExcelError"
                />
              </a-col>
              <a-col v-if="currentFileType == 'pdf'" span="24">
                <VueOfficePdf
                    :src="fileStreamInfo"
                    @rendered="onExcelRendered"
                    style="height: 600px;width: 100%"
                    @error="onExcelError"
                />
              </a-col>
              <a-col v-else-if="currentFileType === 'csv'" span="24">
                <!-- CSV预览 - 仿Excel表格样式 -->
                <div class="csv-preview">
                  <table class="csv-table" border="1" cellspacing="0" cellpadding="5">
                    <thead>
                    <tr>
                      <th v-for="(header, index) in csvHeaders" :key="index">{{ header }}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, rowIndex) in csvRows" :key="rowIndex">
                      <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </a-col>

            </a-row>
          </a-card>
        </a-col>
        <a-col span="14">
          <a-card title="转换结果" size="small">
            <!-- 文件归属银行选择区域 -->
            <a-row style="margin-bottom: 16px;">
              <a-col :span="4">
                <span style="line-height: 32px;">文件归属银行：</span>
              </a-col>
              <a-col :span="6">
                <JSearchSelect :disabled="!bankEfit" dict="fa_orgs_configure,org_name,org_cd" v-model:value="selectedBank" placeholder="请选择文件归属银行"  allow-clear ></JSearchSelect>
              </a-col>
              <a-col :span="4">
                <template v-if="bankEfit">
                  <a-button  type="primary" @click="confirmBank" style="margin-left: 8px;">确认</a-button>
                  <a-button  type="default" @click="cancelBank" style="margin-left: 8px;">取消</a-button>
                </template>
                <a-button v-else type="primary" @click="doBankEdit" style="margin-left: 8px;">修改</a-button>

              </a-col>
            </a-row>

            <!-- Sheet列表区域 -->
            <a-row style="margin-bottom: 16px;">
              <a-col :span="4">
                <div class="sheet-list">
                  <h3>文件页码</h3>
                  <div
                      v-for="sheet in currentFile.filePages"
                      :key="sheet.pageId"
                      :class="['file-item', { active: activeSheet === sheet.pageId }]"
                      @click="selectSheet(sheet)"
                  >
                    {{ sheet.pageName }}
                  </div>
                </div>
              </a-col>
              <a-col :span="20">
                <!-- 银行客户信息表格 -->
                <a-table
                    v-if="activeSheetData.bankCustomers.length"
                    :columns="bankCustomerColumns"
                    :data-source="activeSheetData.bankCustomers"
                    size="small"
                    bordered
                    :pagination="false"
                    :scroll="{ x: 1500 }"
                    style="margin-bottom: 16px;"
                />

                <!-- 银行交易流水表格 -->
                <a-table
                    v-if="activeSheetData.bankTransactions.length"
                    :columns="bankTransactionColumns"
                    :data-source="activeSheetData.bankTransactions"
                    size="small"
                    bordered
                    :pagination="false"
                    :scroll="{ x: 1500 }"
                    style="margin-bottom: 16px;"
                />

                <!-- 非银行客户信息表格 -->
                <a-table
                    v-if="activeSheetData.notBankCustomers.length"
                    :columns="nonBankCustomerColumns"
                    :data-source="activeSheetData.notBankCustomers"
                    size="small"
                    bordered
                    :pagination="false"
                    :scroll="{ x: 1500 }"
                    style="margin-bottom: 16px;"
                />

                <!-- 非银行交易流水表格 -->
                <a-table
                    v-if="activeSheetData.notBankTransactions.length"
                    :columns="nonBankTransactionColumns"
                    :data-source="activeSheetData.notBankTransactions"
                    size="small"
                    :scroll="{ x: 1500 }"
                    bordered
                    :pagination="false"
                />
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </a-modal>

  <!-- 上传文件的Modal弹框 -->
  <a-modal
      v-model:visible="uploadModalVisible"
      title="上传文件"
      width="800px"
      :maskClosable="false"
      :keyboard="false"
      :footer="null"
  >
    <div>
      <div class="ml4" style="color:red">注：如果压缩文件或者数据文件有密码，需要用密码打开后去掉密码再上传</div>
      <a-card>
        <a-upload-dragger
            :fileList="fileList"
            :multiple="true"
            :customRequest="onFileListUpload"
            accept=".xls,.xlsx,.csv,.pdf,.rar,.zip"
            :beforeUpload="beforeUpload"
            @remove="handleRemove"
            class="custom-upload-dragger"
        >
          <div class="upload-dragger-content">
            <p class="ant-upload-drag-icon">
              <inbox-outlined style="font-size: 48px; color: #1890ff;"></inbox-outlined>
            </p>
            <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p class="ant-upload-hint">
              支持扩展名 .xls .xlsx .csv .pdf .rar .zip
            </p>
          </div>
        </a-upload-dragger>

        <div class="upload-list">
          <div v-for="file in fileList" :key="file.uid" class="upload-item">
            <paper-clip-outlined />
            <div class="upload-item-info">
              <div class="upload-item-name">{{ file.name }}</div>
              <div class="upload-item-size">{{ formatFileSize(file.size) }}</div>
              <div class="progress-container">
                <a-progress
                    :percent="file.percent"
                    :status="file.status === 'error' ? 'exception' : file.status === 'done' ? 'success' : 'active'"
                    size="small"
                />
              </div>
            </div>
            <div class="upload-actions">
              <a-button
                  v-if="file.status === 'uploading'"
                  size="small"
                  @click="handleCancel(file)"
              >
                取消
              </a-button>
              <close-outlined
                  v-else
                  style="color: #ff4d4f; cursor: pointer;"
                  @click="handleRemove(file)"
              />
            </div>
          </div>
        </div>

        <div style="margin-top: 16px; text-align: right;">
          <a-button
              type="primary"
              @click="handleUpload"
              :disabled="fileList.length === 0"
              :loading="uploading"
          >
            {{ uploading ? '上传中' : '确认' }}
          </a-button>
        </div>
      </a-card>

    </div>
  </a-modal>
</template>

<script lang="ts" name="tab1" setup>
import { ref,reactive, onMounted, defineProps,computed } from 'vue';
import { message, Modal} from 'ant-design-vue';
//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
//引入相关样式
import '@vue-office/excel/lib/index.css'
import JSearchSelect from "@/components/Form/src/jeecg/components/JSearchSelect.vue";
import {
  caseFileListApi,
  deleteFileListApi,
  getFileConverResultApi,
  uploadFileApi,
  getFileStreamByFileId,
  getFileInfoItem,
  standardTableApi,
  saveEditBankApi,
  convertFileListApi
} from '../../user.api'
//ts语法
import { useRoute } from 'vue-router';
import {useRouter} from "vue-router";
const router = useRouter();
interface Props {
  fileProcessOptions: Array<{value: string, label: string}>;
}
// CSV表头
const csvHeaders = computed(() => {
  if (csvData.value.length > 0) {
    return csvData.value[0];
  }
  return [];
});

// CSV行数据
const csvRows = computed(() => {
  if (csvData.value.length > 1) {
    return csvData.value.slice(1);
  }
  return [];
});

const props = defineProps<Props>();
const formRef = ref();
const {query} = useRoute();
const formState = reactive({
  folder: '',
  fileName: '',
  fileStatus: undefined
});
// 新增：编辑Modal相关状态
const editModalVisible = ref(false);
const fileStreamInfo = ref<any>();
// 定义支持的文件类型
const supportedTypes = ['pdf', 'csv', 'xls', 'xlsm', 'xlsx']
const currentFileType = ref('');
const csvContent = ref('')
const csvData = ref([])
const vueExcelOptions =ref({
  transformImage:true,
  xls:true
})


const bankEfit = ref(false);
const selectedBank = ref('');
const activeSheet = ref('');
const activeSheetData = ref({
  bankCustomers:[],
  bankTransactions:[],
  notBankCustomers:[],
  notBankTransactions:[]
});

// 表格列定义
const bankCustomerColumns = ref([
  { title: '行号', dataIndex: 'rowNumber'},
  { title: '归属机构', dataIndex: 'belongOrg'},
  { title: '客户种类', dataIndex: 'customerType'},
  { title: '客户名称', dataIndex: 'customerName'},
  { title: '证件种类', dataIndex: 'idType'},
  { title: '证件号码', dataIndex: 'idNumber'},
  { title: '营业执照', dataIndex: 'businessLicense'},
  { title: '法人姓名', dataIndex: 'legalPerson'},
  { title: '是否商户', dataIndex: 'isMerchant'},
  { title: '商户号', dataIndex: 'merchantNumber'},
  { title: '终端号', dataIndex: 'terminalNumber'},
  { title: '结算银行', dataIndex: 'settlementBank'},
  { title: '结算账号', dataIndex: 'settlementAccount'},
  { title: '币种', dataIndex: 'currency'},
  { title: '账户类型', dataIndex: 'accountType'},
  { title: '状态', dataIndex: 'status'},
  { title: '其他字段', dataIndex: 'otherFields'}
]);

const bankTransactionColumns = ref([
  { title: '行号', dataIndex: 'rowNumber'},
  { title: '发起行', dataIndex: 'issuingBank'},
  { title: '户名', dataIndex: 'accountName'},
  { title: '账号', dataIndex: 'accountNumber'},
  { title: '卡号', dataIndex: 'cardNumber'},
  { title: '流水号', dataIndex: 'serialNumber'},
  { title: '交易渠道', dataIndex: 'transactionChannel'},
  { title: '币种', dataIndex: 'currency'},
  { title: '交易方向', dataIndex: 'transactionDirection',},
  { title: '交易金额', dataIndex: 'transactionAmount'},
  { title: '交易种类', dataIndex: 'transactionType'},
  { title: '交易余额', dataIndex: 'transactionBalance' },
  { title: '业务日期', dataIndex: 'businessDate'},
  { title: '交易时间', dataIndex: 'transactionTime' },
  { title: '对方开户银行', dataIndex: 'counterpartyBank' },
  { title: '对方户名', dataIndex: 'counterpartyName'},
  { title: '对方账号', dataIndex: 'counterpartyAccount' },
  { title: '卡号', dataIndex: 'counterpartyCardNumber' },
  { title: '交易状态', dataIndex: 'transactionStatus' },
  { title: 'IP地址', dataIndex: 'ipAddress' },
  { title: '其他字段', dataIndex: 'otherFields' }
]);

const nonBankCustomerColumns = ref([...bankCustomerColumns.value]);
const nonBankTransactionColumns = ref([...bankTransactionColumns.value]);

let currentFile = reactive({
  fileName: '',
  fileAddress: '',
  filePages: [],
  organization: '',
  organizationCode:''
});
// 上传Modal相关状态
const uploadModalVisible = ref(false);
const fileList = ref([]);
const uploading = ref(false);
const tableLoading = ref(false);
const searchLoading = ref(false);


const columns = ref([
  {
    title: '序号',
    key: 'index',
    width: 80,
  },
  {
    title: '源文件',
    dataIndex: 'sourceFile',
    width: 200,
  },
  {
    title: '文件夹',
    dataIndex: 'folder',
    key: 'folder',
    width: 150,
  },
  {
    title: '文件名称',
    dataIndex: 'fileName',
    width: 100,
  },
  {
    title: '所属机构',
    dataIndex: 'organization',
    width: 180,
  },
  {
    title: '返回信息',
    dataIndex: 'returnInfo',
    width: 180,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  },

  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    width: 180,
  },
  {
    title: '成功时间',
    dataIndex: 'successTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 180,
  }
]);
const dataSource = ref([])

// 页面初始化时调用接口
onMounted(() => {
  fetchFileList();
});

// 获取文件列表
const fetchFileList = async () => {
  try {
    tableLoading.value = true;

    const params = {
      caseId: query.caseId,
      folder: formState.folder,
      fileName: formState.fileName,
      fileStatus: formState.fileStatus
    };

    const response = await caseFileListApi(params);
    dataSource.value = response;
  } catch (error) {
  } finally {
    tableLoading.value = false;
    searchLoading.value = false;
  }
};


// 修改onFileListUpload方法
const onFileListUpload = (data) => {
  const file = fileList.value.find(item => item.uid === data.file.uid);
  if (file) {
    file.status = 'uploading';
  }

  const params = {
    file: data.file,
    data: { caseId: query.caseId },
  };

  uploadFileApi(params,true).then((res)=>{
    if (res.code === 200) {
      // 上传成功，更新文件状态
      const uploadedFile = fileList.value.find(item => item.uid === data.file.uid);
      if (uploadedFile) {
        uploadedFile.status = 'done';
        uploadedFile.percent = 100;
        // 触发响应式更新
        fileList.value = [...fileList.value];
      }
    }else{
      const uploadedFile = fileList.value.find(item => item.uid === data.file.uid);
      if (uploadedFile) {
        uploadedFile.status = 'error';
        uploadedFile.percent = 0;
        // 触发响应式更新
        fileList.value = [...fileList.value];
      }
      message.error(`${res.message || '上传失败'} `);
    }

  })
};

// 搜索处理
const onSearch = () => {
  searchLoading.value = true;
  fetchFileList();
};

// 重置搜索
const resetSearch = () => {
  formRef.value.resetFields();
  fetchFileList()
};

// 上传文件
const uploadFile = () => {
  uploadModalVisible.value = true
};

// 上传前校验
const beforeUpload = (file) => {
  // 检查是否已存在同名文件
  const isExist = fileList.value.some(item => item.name === file.name);
  if (isExist) {
    message.warning(`文件 ${file.name} 已经存在上传列表中`);
    return false;
  }

  // 添加到文件列表
  fileList.value = [...fileList.value, {
    uid: file.uid,
    name: file.name,
    size: file.size,
    type: file.type,
    originFileObj: file,
    percent: 0,
    status: 'pending'
  }];

};

// 移除文件
const handleRemove = (file) => {
  fileList.value = fileList.value.filter(item => item.uid !== file.uid);
};

// 取消上传
const handleCancel = (file) => {
  file.status = 'removed';
  message.info(`已取消上传: ${file.name}`);
  handleRemove(file);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
};

// 执行上传
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('请选择要上传的文件');
    return;
  }
  uploading.value = false;
  uploadModalVisible.value = false;
  fileList.value = [];

  // 刷新文件列表
  fetchFileList();
};

// 选择sheet
const selectSheet = async (sheet) => {
  activeSheet.value = sheet.pageId;
  try {
    // 调用API获取sheet数据
    const response = await standardTableApi({
      filePageId: sheet.pageId,
      // filePageId: '40288188995b3e1901995b51ee2c0005',
      //
    });
    activeSheetData.value = response || {
      bankCustomers:[],
      bankTransactions:[],
      notBankCustomers:[],
      notBankTransactions:[]
    };
  } catch (error) {
    message.error('获取sheet数据失败');
    activeSheetData.value = {
      bankCustomers:[],
      bankTransactions:[],
      notBankCustomers:[],
      notBankTransactions:[]
    };
  }
};

//
const doBankEdit = () => {
  bankEfit.value = true
};

const cancelBank = () => {
  bankEfit.value = false
};
// 确认银行选择
const confirmBank = () => {
  const params = {
    fileId: currentFile.id,
    organizationCode: selectedBank.value
  }
  saveEditBankApi(params).then(()=>{
    bankEfit.value = false
  }).catch(()=>{
    bankEfit.value = false
  })
};

// 转换查看
const editFile = async (record) => {
  // 查询转换基本信息
  const convertInfo = await getFileConverResultApi({fileId:record.id})
  const fileInfo = await getFileInfoItem({fileId:record.id})
  const { fileType } = fileInfo
  currentFileType.value = (fileType || '').toLowerCase() // 设置文件类型
  if (supportedTypes.includes(currentFileType.value)) {
    console.log('开始预览文件')
    previewFile(record)
  } else {
    message.error(`不支持的文件类型: ${fileType.value}`)
  }

  currentFile = convertInfo || {};
  if(convertInfo.organizationCode){ // 设置银行
    selectedBank.value = convertInfo.organizationCode
  }
  // 默认选择第一个sheet并加载数据
  const {filePages} = convertInfo
  if (filePages && filePages.length > 0) {
    await selectSheet(filePages[0]);
  }
  // 显示Modal
  editModalVisible.value = true;
};
// 清理创建的对象URL
const cleanupUrl = () => {
  if (fileStreamInfo.value) {
    fileStreamInfo.value = ''
  }
}
// 解析CSV数据
const parseCSV = (csvText) => {

  const lines = csvText.split('\n');
  const result = [];
  console.info('lines',lines)
  lines.forEach(line => {
    if (line.trim() !== '') {
      // 简单的CSV解析，按逗号分割（实际项目中可能需要更复杂的解析）
      const cells = line.split(',').map(cell => {
        // 去除可能存在的引号
        return cell.trim().replace(/^"(.*)"$/, '$1');
      });
      result.push(cells);
    }
  });
  console.info('result',result)
  return result;
};
// 预览文件excel或者pdf或者csv文件
const previewFile = (record)=>{
  const  responseType = currentFileType.value === 'csv'?'text':'arraybuffer'
  getFileStreamByFileId({fileId:record.id},responseType).then((response)=>{
    console.info('文件类型',currentFileType.value)
    if (currentFileType.value === 'csv') {
      // CSV文件以文本形式获取
      console.info('文件内容',response)
      csvContent.value = response.data
      csvData.value = parseCSV(response.data)
    } else {
      // 其他文件类型以arrayBuffer形式获取
      cleanupUrl() // 清理之前的URL
      // 对于Excel文件，使用arrayBuffer创建blob
      if (['xls', 'xlsx', 'xlsm'].includes(currentFileType.value)) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        fileStreamInfo.value = blob;
      }
      // 对于PDF文件，使用arrayBuffer创建blob
      else if (currentFileType.value === 'pdf') {
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        fileStreamInfo.value = blob;
      }
    }
  }).catch(()=>{
    fileStreamInfo.value = ''
  })
}


// 关闭编辑Modal
const closeEditModal = () => {
  editModalVisible.value = false;
  // 清空当前文件信息
  Object.assign(currentFile, {
    fileName: '',
    pageNumber: '',
    fileContent: ''
  });
  activeSheetData.value = {
    bankCustomers:[],
    bankTransactions:[],
    notBankCustomers:[],
    notBankTransactions:[]
  };
};

// 确认文件转换
const confirmFileConvert = async () => {
  Modal.confirm({
    title: '确认转换文件吗',
    content: `确定要转换所有文件吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      convertFileListApi({caseId:query.caseId,}).then(()=>{
        fetchFileList();
      })
    }
  });
};


// 删除文件
const deleteFile = async (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文件吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {

      deleteFileListApi({fileId:record.id}).then(()=>{
        fetchFileList();
      })

    }
  });
};

// 状态颜色映射（可根据需要调整）
const statusColorMap = {
  '1': 'green',    // 成功
  '2': 'red',      // 失败
  '3': 'orange',   // 处理中
  '4': 'blue',     // 待处理
  '5': 'gray'      // 其他状态
};

// 状态颜色
const getStatusColor = (status) => {
  return statusColorMap[status] || 'default';
};

// 状态文本 - 从fileProcessOptions中获取
const getStatusText = (statusValue) => {
  if (!props.fileProcessOptions || !Array.isArray(props.fileProcessOptions)) {
    return '未知';
  }
  const option = props.fileProcessOptions.find(opt => opt.value === statusValue);
  return option ? option.label : '未知';
};

// Excel渲染事件处理
const onExcelRendered = () => {
  console.log('Excel渲染完成');
};

const onExcelError = (error) => {
  console.error('Excel渲染错误:', error);
};


</script>

<style scoped>
.search-form :deep(label) {
  width: 100%;
}

.search-form :deep(.ant-form-item-control) {
  width: 100%;
}

.search-form :deep(.ant-input) {
  width: 100%;
}

.search-form :deep(.ant-select) {
  width: 100%;
}

/* 自定义上传拖拽区域样式 */
.custom-upload-dragger :deep{
  .ant-upload-btn :deep{
    height: 280px;
  }

}

.upload-dragger-content {
  text-align: center;
}

/* 增加上传列表项的间距 */
.upload-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.upload-item-info {
  flex: 1;
  margin-left: 8px;
}

.upload-item-name {
  font-weight: 500;
}

.upload-item-size {
  color: #999;
  font-size: 12px;
}

.progress-container {
  margin-top: 4px;
}

.upload-actions {
  margin-left: 8px;
}

.sheet-list {
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
/* 新增Excel预览容器样式 */
.excel-preview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.excel-container {
  height: 600px;
  overflow: auto;
  position: relative;
  border: 1px solid #e8e8e8;
  margin-top: 10px;
}

/* 修复VueOfficeExcel样式问题 */
:deep(.x-spreadsheet-sheet){
  width: 100%;
}
:deep(.vue-office-excel) {
  height: 100% !important;
}

:deep(.vue-office-excel .luckysheet) {
  height: 100% !important;
  min-width: unset !important;
}

:deep(.vue-office-excel .luckysheet-cell-sheettable) {
  overflow: auto !important;
}

:deep(.vue-office-excel .luckysheet-wa-calc) {
  min-width: unset !important;
}

/* 调整Sheet选项卡样式 */
:deep(.vue-office-excel .luckysheet-sheet-area) {
  overflow-x: auto !important;
  white-space: nowrap !important;
}

:deep(.vue-office-excel .luckysheet-sheet-container) {
  display: flex !important;
  flex-wrap: nowrap !important;
}

/* 确保内容区域适应容器 */
:deep(.vue-office-excel .luckysheet-grid-container) {
  max-width: 100% !important;
}
.csv-preview {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.csv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: left;
  }

  th, td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    white-space: nowrap;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f0f0f0;
  }
}

</style>