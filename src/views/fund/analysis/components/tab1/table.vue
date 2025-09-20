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
          <input type="file" @change="(event)=>{changeHandle(record,event)}"/>
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
      :width="1200"
      :footer="null"
      wrap-class-name="full-modal"
      @ok="closeEditModal"
      @cancel="closeEditModal"
  >
    <a-card>
      <a-row>
        <a-col span="12">
          <a-card title="源文件视图">
            <a-row>
              <a-col span="24">文件名称：{{ currentFile.fileName || '-' }}</a-col>
            </a-row>
            <a-row>
              <a-col span="4">文件内容：</a-col>
            </a-row>
            <a-row>
              <VueOfficeExcel
                  v-if="currentFileType == 1"
                  :src="fileStreamInfo"
                  @rendered="onExcelRendered"
                  @error="onExcelError"
                  style="height: 600px; width: 100%"
              />
              <VueOfficePdf
                  v-if="currentFileType == 2"
                  :src="fileStreamInfo"
                  @rendered="onExcelRendered"
                  @error="onExcelError"
                  style="height: 600px; width: 100%"
              />
            </a-row>
          </a-card>
        </a-col>
        <a-col span="12">
          <a-card title="转换结果">
            <a-row>
              <a-col span="24">机构名称：{{ currentFile.organization || '-' }}</a-col>
            </a-row>
            <a-row>
              <a-col span="4">机构编码：{{ currentFile.organizationCode || '-' }}</a-col>
            </a-row>
            <a-row>
              <VueOfficeExcel
                  v-if="currentFileType == 1"
                  :src="fileStreamInfo"
                  @rendered="onExcelRendered"
                  @error="onExcelError"
                  style="height: 600px; width: 100%"
              />
              <VueOfficePdf
                  v-if="currentFileType == 2"
                  :src="fileStreamInfo"
                  @rendered="onExcelRendered"
                  @error="onExcelError"
                  style="height: 600px; width: 100%"
              />
            </a-row>
          </a-card>
<!--          <a-row>
            <a-col  :offset="16" span="4">
              <a-button type="primary"  @click="closeEditModal">确认</a-button>
            </a-col>
          </a-row>-->
        </a-col>
      </a-row>
    </a-card>

  </a-modal>
  <!-- 上传文件的Modal弹框 -->
  <a-modal
      v-model:visible="uploadModalVisible"
      title="上传文件"
      width="600px"
      :maskClosable="false"
      :keyboard="false"
      :footer="null"
  >
    <div>
      <a-card>
        <a-upload-dragger
            :fileList="fileList"
            :multiple="true"
            :customRequest="onFileListUpload"
            accept=".xls,.xlsx,.csv,.pdf"
            :beforeUpload="beforeUpload"
            @remove="handleRemove"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined style="font-size: 48px; color: #1890ff;"></inbox-outlined>
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
          <p class="ant-upload-hint">
            支持扩展名 .xls .xlsx .csv .pdf
          </p>
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
<!--          <a-button @click="closeUploadModal" style="margin-right: 8px;">取消</a-button>-->
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
import { ref,reactive, onMounted, defineProps } from 'vue';
import { message, Modal} from 'ant-design-vue';
//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
//引入相关样式
import '@vue-office/excel/lib/index.css'
import {
  caseFileListApi,
  deleteFileListApi,
  getFileConverResultApi,
  uploadFileApi,
  getFileStreamByFileId, getFileInfoItem
} from '../../user.api'
//ts语法
import { useRoute } from 'vue-router';
import {useRouter} from "vue-router";
const router = useRouter();
interface Props {
  fileProcessOptions: Array<{value: string, label: string}>;
}

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
const currentFileType = ref<any>();



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
// 转换查看
const editFile = async (record) => {
   const fileInfo = await getFileInfoItem({fileId:record.id})
   const { fileType } = fileInfo
   if(['xlsx','xlsx','csx'].includes(fileType)){ // 加载vue-office-excel
     currentFileType.value = 1
   }else if(['pdf'].includes(fileType)){// 加载vue-office-pdf
     currentFileType.value = 2
   }
  console.info('currentFileType----------->',currentFileType.value)
   console.info('文件的详细信息----------->',fileInfo)
   fileStreamInfo.value = ''
  // 查询转换基本信息
   const convertInfo = await getFileConverResultApi({fileId:record.id})
   // 预览文件excel或者pdf
   getFileStreamByFileId({fileId:record.id}).then((res)=>{
    // 方法1: 使用 instanceof 检查
    if (res instanceof ArrayBuffer) {
      console.info('fileStreamInfo 是 ArrayBuffer')
      fileStreamInfo.value = res
    } else {
      console.info('fileStreamInfo 不是 ArrayBuffer，实际类型:', typeof res)

      // 如果是 Blob，可以转换为 ArrayBuffer
      if (res instanceof Blob) {
        console.info('fileStreamInfo 是 Blob，正在转换为 ArrayBuffer...')
        const arrayBuffer =  res.arrayBuffer()
        fileStreamInfo.value = arrayBuffer
      } else {
        // 其他类型处理
        fileStreamInfo.value = ''
        console.info('需要特殊处理的数据类型')
      }
    }
  }).catch(()=>{
     fileStreamInfo.value = ''
  })
  currentFile = convertInfo || {};
  // 显示Modal
  editModalVisible.value = true;
};

// 关闭编辑Modal
const closeEditModal = () => {
  editModalVisible.value = false;
  // 清空当前文件信息
  Object.assign(currentFile, {
    fileName: '',
    pageNumber: '',
    fileContent: ''
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
const changeHandle= async(record,event)=>{
  console.info('event',event)
  console.info('record',record)
  const fileInfo = await getFileInfoItem({fileId:record.id})
  const { fileType } = fileInfo

  if(['xlsx','xlsx','csx'].includes(fileType)){ // 加载vue-office-excel
    currentFileType.value = 1
  }else if(['pdf'].includes(fileType)){// 加载vue-office-pdf
    currentFileType.value = 2
  }

  let file = event.target.files[0]
  let fileReader = new FileReader()
  fileReader.readAsArrayBuffer(file)
  fileReader.onload =  () => {
    fileStreamInfo.value = fileReader.result
    editModalVisible.value = true;

  }
}


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
</style>