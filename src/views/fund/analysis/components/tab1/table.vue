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
                  <a-select-option value="all">全部</a-select-option>
                  <a-select-option value="active">可用</a-select-option>
                  <a-select-option value="inactive">不可用</a-select-option>
                  <a-select-option value="draft">草稿</a-select-option>
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
          <a-button class="ml2 upload-button" @click="uploadFile">上传文件</a-button>
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
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template v-if="column.key === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template v-if="column.key === 'operation'">
        <div class="table-operations">
          <a-button size="small" @click="editFile(record)">转换确认</a-button>
          <a-button class="ml1" size="small" type="primary" danger @click="deleteFile(record)">删除</a-button>
        </div>
      </template>
    </template>
  </a-table>
  <!-- 编辑文件的Modal弹框 -->
  <a-modal
      v-model:visible="editModalVisible"
      title="文件详情"
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
              <a-col span="4">文件名称</a-col>
              <a-col span="20">{{ currentFile.fileName || '-' }}</a-col>
            </a-row>
            <a-row>
              <a-col span="4">文件内容</a-col>
            </a-row>
            <a-row>
              {{ currentFile.fileAddress || '-' }}
            </a-row>
          </a-card>
        </a-col>
        <a-col span="12">
          <a-card title="转换结果">
            <a-row>
              <a-col span="4">机构名称</a-col>
              <a-col span="20">{{ currentFile.organization || '-' }}</a-col>
            </a-row>
            <a-row>
              <a-col span="4">机构编码</a-col>
              <a-col span="20">{{ currentFile.organizationCode || '-' }}</a-col>
            </a-row>
            <a-row>
              {{ currentFile.fileAddress || '-' }}
            </a-row>
          </a-card>
          <a-row>
            <a-col  :offset="16" span="4">
              <a-button type="primary"  @click="closeEditModal">确认</a-button>
            </a-col>
          </a-row>
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
            accept=".xls,.xlsx,.csv"
            :beforeUpload="beforeUpload"
            @remove="handleRemove"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined style="font-size: 48px; color: #1890ff;"></inbox-outlined>
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
          <p class="ant-upload-hint">
            支持扩展名 .xls .xlsx .csv
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
          <a-button @click="closeUploadModal" style="margin-right: 8px;">取消</a-button>
          <a-button
              type="primary"
              @click="handleUpload"
              :disabled="fileList.length === 0"
              :loading="uploading"
          >
            {{ uploading ? '保存' : '保存' }}
          </a-button>
        </div>
      </a-card>

    </div>
  </a-modal>
</template>

<script lang="ts" name="tab1" setup>
import { ref,reactive, onMounted } from 'vue';
import { message, Modal, Upload} from 'ant-design-vue';
import {caseFileListApi,deleteFileListApi,getFileConverResultApi,uploadFilesApi} from '../../user.api'
//ts语法
import { useRoute } from 'vue-router';
import {useRouter} from "vue-router";
const router = useRouter();

const formRef = ref();
const {query} = useRoute();
const formState = reactive({
  folder: '',
  fileName: '',
  fileStatus: undefined
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 50,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
});
// 新增：编辑Modal相关状态
const editModalVisible = ref(false);
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
    dataIndex: 'id',
    key: 'id',
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

// 关闭上传Modal
const closeUploadModal = () => {
  if (!uploading.value) {
    uploadModalVisible.value = false;
    fileList.value = [];
  } else {
    message.info('请等待上传完成或取消上传');
  }
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

  return false; // 阻止默认上传
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

  uploading.value = true;
  const formData = new FormData();

  // 添加文件到FormData
  fileList.value.forEach(file => {
    if (file.status !== 'done') {
      file.status = 'uploading';
      formData.append('files', file.originFileObj);
    }
  });

  // 模拟上传进度
  const totalFiles = fileList.value.filter(file => file.status === 'uploading').length;
  let completedFiles = 0;

  const progressInterval = setInterval(() => {
    fileList.value.forEach(file => {
      if (file.status === 'uploading' && file.percent < 90) {
        file.percent += 10;
      }
    });
    fileList.value = [...fileList.value]; // 触发响应式更新
  }, 300);

  try {
    // 调用上传API
    await uploadFilesApi(formData);

    clearInterval(progressInterval);

    // 标记所有文件为完成状态
    fileList.value.forEach(file => {
      if (file.status === 'uploading') {
        file.status = 'done';
        file.percent = 100;
      }
    });
    fileList.value = [...fileList.value]; // 触发响应式更新

    message.success('文件上传成功');

    // 2秒后关闭模态框
    setTimeout(() => {
      uploading.value = false;
      uploadModalVisible.value = false;
      fileList.value = [];

      // 刷新文件列表
      fetchFileList();
    }, 2000);

  } catch (error) {
    clearInterval(progressInterval);

    // 标记所有文件为错误状态
    fileList.value.forEach(file => {
      if (file.status === 'uploading') {
        file.status = 'error';
      }
    });
    fileList.value = [...fileList.value]; // 触发响应式更新

    message.error('文件上传失败');
    uploading.value = false;
  }
};
// 编辑文件
const editFile = async (record) => {
  const convertInfo = await getFileConverResultApi({fileId:record.id})
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
        message.success(`文件已删除`);
        fetchFileList();
      })

    }
  });
};

// 状态颜色
const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange'
  };
  return colors[status] || 'default';
};

// 状态文本
const getStatusText = (status) => {
  const texts = {
    active: '可用',
    inactive: '不可用',
    draft: '草稿'
  };
  return texts[status] || '未知';
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
</style>