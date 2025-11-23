<template>
  <a-card class="m2" title="错误处理">
    <a-row class="mb4">
      <a-col span="6">案件名称：{{fileInfo.caseName}}</a-col>
      <a-col span="16">文件名称：{{fileInfo.fileName}}</a-col>
    </a-row>
    <a-row gutter="16">
      <a-col :span="24" class="search-buttons">
        <a-button type="primary" :loading="searchLoading" @click="handleBatchProcess">处理完成</a-button>
        <a-button type="primary" class="ml2" @click="handleReturn">暂时返回</a-button>
      </a-col>
    </a-row>

    <!-- 表格部分 -->
    <BasicTable 
        class="m2"
        :columns="columns"
        :dataSource="dataSource"
        :loading="tableLoading"
        :pagination="pagination"
        bordered
        size="small"
        @change="handleTableChange"
        :canColDrag="true"
        :showTableSetting="true"
        :tableSetting="{ redo: false, size: true, setting: true, fullScreen: true, cacheKey: 'error-handler-table' }"
        :canResize="true"
        :minHeight="300"
        @register="registerTable"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'errorType'">
          <a-tag :color="getErrorTypeColor(record.errorType)">
            {{ getErrorTypeText(record.errorType) }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'ifProcessed'">
          <a-tag :color="record.ifProcessed === 1 ? 'green' : 'red'">
            {{ record.ifProcessed === 1 ? '已处理' : '未处理' }}
          </a-tag>
        </template>
        <template v-if="column.dataIndex === 'procDate'">
          {{ record.procDate || '--' }}
        </template>
        <template v-if="column.key === 'operation'">
          <div class="table-operations">
            <a-button class="ml1" size="small" type="primary" @click="handleProcess(record)">匹配</a-button>
          </div>
        </template>
      </template>
    </BasicTable>
  </a-card>
</template>

<script lang="ts" name="tab1" setup>
import { ref, reactive, onMounted, defineProps } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { errorHandlerListApi, errorHandlerConfirmApi,fileDetailApi } from '../FaFilesConfigure.api';
import { BasicTable, useTable, TableAction } from '/@/components/Table';

interface Props {
  fileProcessOptions: Array<{ value: string; label: string }>;
  filteredFiles: Array<{ value: string; label: string }>;
}

interface ErrorRecord {
  id: string;
  deptCaseCode: string;
  caseId: string;
  caseFileId: string;
  errorType: string;
  errorContent: string;
  ifProcessed: number;
  procDate: string | null;
  procOperator: string | null;
  createTime: string;
  createBy: string | null;
  updateTime: string | null;
  updateBy: string | null;
  deleteStatus: string | null;
  deleteTime: string | null;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number, range: [number, number]) => string;
  pageSizeOptions: string[];
}

interface FileInfo {
  caseName: string;
  fileName: string;
}

const props = defineProps<Props>();
const { query } = useRoute();
const router = useRouter();

// 分页配置
const pagination = reactive<Pagination>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
});

const tableLoading = ref(false);
const searchLoading = ref(false);
const fileInfo = ref<FileInfo>({
  caseName: '',
  fileName: ''
});

const columns = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    resizable: true,
  },
  {
    title: '错误种类',
    dataIndex: 'errorType',
    width: 120,
    resizable: true,
  },
  {
    title: '错误内容',
    dataIndex: 'errorContent',
    width: 200,
    resizable: true,
  },
  {
    title: '处理状态',
    dataIndex: 'ifProcessed',
    width: 100,
    resizable: true,
  },
  {
    title: '处理时间',
    dataIndex: 'procDate',
    width: 150,
    resizable: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    resizable: true,
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right' as const,
    width: 180,
    resizable: true,
  }
];

const dataSource = ref<ErrorRecord[]>([]);

const [registerTable] = useTable({
  columns,
  dataSource,
  loading: tableLoading,
  pagination,
  bordered: true,
  size: 'small',
  canColDrag: true,
  showTableSetting: true,
  canResize: true,
  minHeight: 300,
  tableSetting: { 
    redo: false,
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'error-handler-table'
  }
});

// 页面初始化时调用接口
onMounted(() => {
  fetchErrorFileList();
  fetchErrorFileInfo()
});

// 获取文件详情
const fetchErrorFileInfo = async () => {
  try {
    const params = {
      fileId: query.caseFileId,
    };

    const response = await fileDetailApi(params);

    if (response) {
      fileInfo.value = response || {
        caseName: '',
        fileName: ''
      };
    } else {
      fileInfo.value = {
        caseName: '',
        fileName: ''
      };
    }
  } catch (error) {

  }
};

// 获取错误文件列表
const fetchErrorFileList = async () => {
  try {
    tableLoading.value = true;

    const params = {
      caseId: query.caseId,
      caseFileId: query.caseFileId,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await errorHandlerListApi(params);

    if (response) {
      dataSource.value = response.records || [];
      pagination.total = response.total || 0;
      pagination.current = response.current || 1;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取错误文件列表失败:', error);
    message.error('获取数据失败');
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    tableLoading.value = false;
    searchLoading.value = false;
  }
};

// 处理表格分页变化
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchErrorFileList();
};

// 获取错误类型颜色
const getErrorTypeColor = (errorType: string): string => {
  const colorMap: Record<string, string> = {
    '01': 'red',
    '02': 'orange',
    '03': 'blue'
  };
  return colorMap[errorType] || 'default';
};

// 获取错误类型文本
const getErrorTypeText = (errorType: string): string => {
  const textMap: Record<string, string> = {
    '01': '数据错误',
    '02': '格式错误',
    '03': '系统错误'
  };
  return textMap[errorType] || '未知错误';
};

// 批量处理完成
const handleBatchProcess = () => {
  Modal.confirm({
    title: '确认处理完成',
    content: `确定要标记所有错误记录为已处理吗？`,
    onOk: async () => {
      try {
        searchLoading.value = true;
        const params = {
          caseId: query.caseId,
          fileId: query.caseFileId,
        }
        // 调用批量处理接口
        const response = await errorHandlerConfirmApi(params);

        if (response) {
          // 刷新页面数据
          fetchErrorFileList();
        }
      } catch (error) {
        console.error('处理完成失败:', error);
        message.error('处理完成失败');
      } finally {
        searchLoading.value = false;
      }
    }
  });
};

// 暂时返回上一页
const handleReturn = () => {
  router.back();
};

// 处理单条错误记录
const handleProcess = (record: ErrorRecord) => {
  router.push({ path: '/operation/configfile', query: {errorId:record.id} })
};
</script>
