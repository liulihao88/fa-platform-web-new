<script setup lang="ts">
import { useRoute } from 'vue-router'
import { isEmpty } from '@/utils/is';
import smartSearch from './smartSearch.vue'
import { ref, getCurrentInstance, reactive, computed, onMounted } from 'vue'
import { BasicTable, useTable, TableAction } from '/@/components/Table';
import { useMethods } from "@/hooks/system/useMethods";
import { copyTextToClipboard } from '@/hooks/web/useCopyToClipboard';
const { handleExportXls } = useMethods();
import { message } from 'ant-design-vue';
import { getCaseInfoById, intelligentTableListApi, exportIntelligentPageData, fileContextInfo } from './api'
const route = useRoute()
const caseId = route.query.caseId as string
const detail = reactive<Record<string, any>>({})
const columns = [
  { label: '关系', prop: 'operate', type: 'select', dict: 'fa_trans_query_operate' },
  { label: '字段', prop: 'field', type: 'select', dict: 'fa_trans_query_col' },
  { label: '逻辑', prop: 'condition', type: 'select', dict: 'fa_trans_query_rule_nostr' },
  { label: '值', prop: 'value', type: 'input' },
] as any[]
// 表格列配置
const tableColumns = [
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
const dataSource = ref<any[]>([])
const conditionJson = ref()
const selectedRowKeys = ref<string[]>([]);
const selectedRowsData = ref<any[]>([]);
const tableLoading = ref(false)
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys: (string | number)[], selectedRows: any[]) => {
      selectedRowKeys.value = selectedKeys as string[];
      selectedRowsData.value = selectedRows;
    },
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
      if (selected) {
        selectedRowKeys.value = selectedRows.map(row => row.id);
      } else {
        selectedRowKeys.value = [];
      }
    },
    // 全选相关配置
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

const getCaseInfo = async () => {
  const res = await getCaseInfoById({ caseId })
  Object.assign(detail, res)
}
const handleSearch = (params: any) => {
  console.log(params)
  if (!isEmpty(params)) {
    conditionJson.value = JSON.stringify({ grouproot: params })
  }
  fetchIntelligentList()
}
const handleReset = (params: any) => {
  conditionJson.value = JSON.stringify({ grouproot: params })
  selectedRowKeys.value = [];
  selectedRowsData.value = [];
  pagination.current = 1;
  setPagination({ current: 1 });
  fetchIntelligentList()
}
// 获取智能筛选
const fetchIntelligentList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      caseId: caseId,
      ids: selectedRowKeys.value,
      conditionJson: conditionJson.value,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await intelligentTableListApi(params);

    if (response && response.records) {
      dataSource.value = response.records;
      pagination.total = response.total || 0;
      // 更新表格组件中的分页信息
      setPagination({ total: response.total || 0 });
    } else {
      dataSource.value = [];
      pagination.total = 0;
      setPagination({ total: 0 });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    // 出错时也更新分页信息
    setPagination({ total: 0 });
  } finally {
    tableLoading.value = false;
  }
};
// 表格变化处理（分页、排序等）
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchIntelligentList();
};
const exportCurrentPage = () => {
  const params = {
    caseId,
    ids: dataSource.value.map(v => v.id),
    conditionJson: conditionJson.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  handleExportXls('智能查询数据列表', exportIntelligentPageData, params, 'post');
}
const exportMarkedData = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的数据');
    return;
  }
  const params = {
    caseId,
    ids: selectedRowKeys.value,
    conditionJson: conditionJson.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  handleExportXls('智能查询数据列表', exportIntelligentPageData, params, 'post');
}
const exportAllData = () => {
  const params = {
    caseId,
    ids: [],
    conditionJson: conditionJson.value,
    pageNo: 1,
    pageSize: pagination.total, // 导出所有数据
    exportAll: true // 标识导出所有数据
  };
  handleExportXls('智能查询全部数据', exportIntelligentPageData, params, 'post');
}
const archiveModalVisible = ref(false);
const archiveModalPreviewData = ref('');
const sendArchive = () => {
  const success = copyTextToClipboard(archiveModalPreviewData.value);
  if (success) {
    message.success('复制成功！');
  } else {
    message.error('复制失败！');
  }
}
const showArchiveModal = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要生成的数据');
    return;
  }
  const params = {
    caseId,
    ids: selectedRowKeys.value,
    conditionJson: conditionJson.value,
    pageNo: pagination.current,
    pageSize: pagination.pageSize
  };
  const response = await fileContextInfo(params);
  archiveModalVisible.value = true;
  archiveModalPreviewData.value = response;
}
const showDetailModal = (row: any) => { }
const handleDetail = (row: any) => { }
onMounted(() => {
  getCaseInfo()
  fetchIntelligentList()
})
</script>

<template>
  <div class="h-100%">
    <div class="mb-4 mt-4 bg-white p-4 rounded">
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
        <a-button type="primary" @click="exportCurrentPage">
          导出本页数据
        </a-button>
        <a-button type="primary" @click="exportMarkedData" :disabled="selectedRowKeys.length === 0">
          导出选择数据
        </a-button>
        <a-button type="primary" @click="exportAllData">
          导出全部数据
        </a-button>
        <a-button type="primary" @click="showArchiveModal">
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
              <a-button type="primary" @click="sendArchive">发送</a-button>
            </a-col>
          </a-row>
        </div>
      </a-card>
    </BasicModal>
  </div>
</template>
