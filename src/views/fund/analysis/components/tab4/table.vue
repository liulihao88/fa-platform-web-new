<template>
  <BasicTable
      :columns="columns"
      :dataSource="repeatedFileList"
      :pagination="pagination"
      bordered
      size="small"
      :loading="tableLoading"
      :rowSelection="rowSelection"
      rowKey="id"
      :canResize="true"
      :showTableSetting="true"
      :tableSetting="{ redo: true, size: true, setting: true, fullScreen: true, cacheKey: 'fund-analysis-tab4-repeated-files' }"
      @register="registerTable"
      @change="handleTableChange"
  >
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" class="ml2" @click="exportPageData">导出数据</a-button>
      <a-button class="ml2" type="primary" @click="exportSelectedPageData">导出选择数据</a-button>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'file1Name'">
        <div class="file-name">{{ record.file1Name }}</div>
      </template>
      <template v-if="column.key === 'file1LineNumber'">
        <div class="row-number">第{{ record.file1LineNumber }}行</div>
      </template>
      <template v-if="column.key === 'file1Amount'">
        <div class="amount">¥{{ record.file1Amount }}</div>
      </template>
      <template v-if="column.key === 'file1OtherInfo'">
        <div class="other-info">{{ record.file1OtherInfo }}</div>
      </template>

      <template v-if="column.key === 'file2Name'">
        <div class="file-name">{{ record.file2Name }}</div>
      </template>
      <template v-if="column.key === 'file2LineNumber'">
        <div class="row-number">第{{ record.file2LineNumber }}行</div>
      </template>
      <template v-if="column.key === 'file2Amount'">
        <div class="amount">¥{{ record.file2Amount }}</div>
      </template>
      <template v-if="column.key === 'file2OtherInfo'">
        <div class="other-info">{{ record.file2OtherInfo }}</div>
      </template>
    </template>
  </BasicTable>
</template>

<script lang="ts" name="tab4" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useMethods } from '/@/hooks/system/useMethods';
const { handleExportXls } = useMethods();
import { useRoute } from "vue-router";
import {exportDataApi, repeatFileTableApi} from "@/views/fund/analysis/user.api";
import { BasicTable, useTable } from '/@/components/Table';

const { query } = useRoute();

const tableLoading = ref(false);
const repeatedFileList = ref([]);
const selectedRowKeys = ref<string[]>([]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
  onChange: (current: number, pageSize: number) => {
    pagination.current = current;
    pagination.pageSize = pageSize;
    fetchRepeatedFileList();
  }
});

const columns = [
      {
        title: '文件一',
        children: [
          {
            title: '文件名称',
            dataIndex: 'file1Name',
            key: 'file1Name',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '行号',
            dataIndex: 'file1LineNumber',
            key: 'file1LineNumber',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '发生金额',
            dataIndex: 'file1Amount',
            key: 'file1Amount',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '其他信息',
            dataIndex: 'file1OtherInfo',
            key: 'file1OtherInfo',
            className: 'sub-column',
            resizable: true
          }
        ]
      },
      {
        title: '文件二',
        children: [
          {
            title: '文件名称',
            dataIndex: 'file2Name',
            key: 'file2Name',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '行号',
            dataIndex: 'file2LineNumber',
            key: 'file2LineNumber',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '发生金额',
            dataIndex: 'file2Amount',
            key: 'file2Amount',
            className: 'sub-column',
            resizable: true
          },
          {
            title: '其他信息',
            dataIndex: 'file2OtherInfo',
            key: 'file2OtherInfo',
            className: 'sub-column',
            resizable: true
          }
        ]
      }
];

const [registerTable] = useTable({
  columns: columns,
  dataSource: repeatedFileList,
  loading: tableLoading,
  pagination: pagination,
  bordered: true,
  size: 'small',
  canResize: true,
  showTableSetting: true,
  tableSetting: { 
    redo: true, 
    size: true, 
    setting: true, 
    fullScreen: true,
    cacheKey: 'fund-analysis-tab4-repeated-files'
  }
});

// 配置行选择器
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (selectedKeys: string[]) => {
      selectedRowKeys.value = selectedKeys;
    },
    selections: [
      {
        key: 'all',
        text: '选择全部',
        onSelect: () => {
          selectedRowKeys.value = repeatedFileList.value.map(item => item.id);
        },
      },
      {
        key: 'clear',
        text: '清空所有',
        onSelect: () => {
          selectedRowKeys.value = [];
        },
      },
    ],
  };
});

onMounted(() => {
  fetchRepeatedFileList()
});

// 处理表格变化事件（分页、排序、筛选等）
const handleTableChange = (pag: any) => {
  // 移除重复调用fetchRepeatedFileList，只依赖pagination.onChange
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
};

// 获取重复数据查看列表
const fetchRepeatedFileList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      caseId: query.caseId,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };
    const response = await repeatFileTableApi(params);
    
    // 根据接口返回格式处理数据和分页信息
    if (response && response.records) {
      repeatedFileList.value = response.records || [];
      pagination.total = response.total || 0;
    } else {
      repeatedFileList.value = response || [];
      // 如果没有分页信息，则总数量为当前数据量
      pagination.total = repeatedFileList.value.length;
    }
  } catch (error) {
    console.error('获取重复文件列表失败:', error);
    repeatedFileList.value = [];
    pagination.total = 0;
  } finally {
    tableLoading.value = false;
  }
};

const exportPageData = async () => {
  const params = {
    caseId: query.caseId,
    ids: []
  }
  handleExportXls('重复数据列表', exportDataApi, params, 'post');
}

const exportSelectedPageData = () => {
  // 校验是否选择了数据
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要导出的数据');
    return;
  }

  const params = {
    caseId: query.caseId,
    ids: selectedRowKeys.value
  }
  handleExportXls('重复数据列表', exportDataApi, params, 'post');
}

</script>

<style scoped>
.file-name {
  font-weight: bold;
}

.row-number, .amount, .other-info {
  color: #666;
}
</style>