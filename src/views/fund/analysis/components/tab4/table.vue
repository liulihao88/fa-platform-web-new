<template>
  <a-card>
    <a-row gutter="16">
      <a-col :span="24" class="search-buttons">
        <a-button type="primary" class="ml2" @click="exportPageData">导出数据</a-button>
        <a-button class="ml2" type="primary" @click="exportSelectedPageData">导出选择数据</a-button>
      </a-col>
    </a-row>
  </a-card>
  <a-table
      :columns="columns"
      :data-source="repeatedFileList"
      :pagination="false"
      bordered
      size="small"
      :loading="tableLoading"
      :row-selection="rowSelection"
      rowKey="id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'file1Name'">
        <div class="file-name">{{ record.file1.file1Name }}</div>
      </template>
      <template v-if="column.key === 'file1LineNumber'">
        <div class="row-number">第{{ record.file1.file1Amount }}行</div>
      </template>
      <template v-if="column.key === 'file1Amount'">
        <div class="amount">¥{{ record.file1.file1Amount }}</div>
      </template>
      <template v-if="column.key === 'file1OtherInfo'">
        <div class="other-info">{{ record.file1.file1OtherInfo }}</div>
      </template>

      <template v-if="column.key === 'file2_name'">
        <div class="file-name">{{ record.file2.file2Name }}</div>
      </template>
      <template v-if="column.key === 'file2LineNumber'">
        <div class="row-number">第{{ record.file2.file2LineNumber }}行</div>
      </template>
      <template v-if="column.key === 'file2Amount'">
        <div class="amount">¥{{ record.file2.file2Amount }}</div>
      </template>
      <template v-if="column.key === 'file2OtherInfo'">
        <div class="other-info">{{ record.file2.file2OtherInfo }}</div>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" name="tab1" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useMethods } from '/@/hooks/system/useMethods';
const { handleExportXls } = useMethods();
import { useRoute } from "vue-router";
import {exportDataApi, repeatFileTableApi} from "@/views/fund/analysis/user.api";

const { query } = useRoute();

const tableLoading = ref(false);
const repeatedFileList = reactive([]);
const selectedRowKeys = ref<string[]>([]);

const columns = [
      {
        title: '文件一',
        children: [
          {
            title: '文件名称',
            dataIndex: 'file1Name',
            key: 'file1Name',
            className: 'sub-column'
          },
          {
            title: '行号',
            dataIndex: 'file1LineNumber',
            key: 'file1LineNumber',
            className: 'sub-column'
          },
          {
            title: '发生金额',
            dataIndex: 'file1Amount',
            key: 'file1Amount',
            className: 'sub-column'
          },
          {
            title: '其他信息',
            dataIndex: 'file1OtherInfo',
            key: 'file1OtherInfo',
            className: 'sub-column'
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
            className: 'sub-column'
          },
          {
            title: '行号',
            dataIndex: 'file2LineNumber',
            key: 'file2LineNumber',
            className: 'sub-column'
          },
          {
            title: '发生金额',
            dataIndex: 'file2Amount',
            key: 'file2Amount',
            className: 'sub-column'
          },
          {
            title: '其他信息',
            dataIndex: 'file2OtherInfo',
            key: 'file2OtherInfo',
            className: 'sub-column'
          }
        ]
      }
];

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
          selectedRowKeys.value = repeatedFileList.map(item => item.id);
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

// 获取重复数据查看列表
const fetchRepeatedFileList = async () => {
  try {
    tableLoading.value = true;
    const params = {
      caseId: query.caseId,
    };
    const response = await repeatFileTableApi(params);
    Object.assign(repeatedFileList, response||[]);
  } catch (error) {
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

</style>
