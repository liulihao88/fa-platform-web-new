<template>
  <a-table
      :columns="columns"
      :data-source="repeatedFileList"
      :pagination="false"
      bordered
      size="middle"
      :loading="tableLoading"
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
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute } from "vue-router";
import { repeatFileTableApi } from "@/views/fund/analysis/user.api";

const { query } = useRoute();

const tableLoading = ref(false);
const repeatedFileList = reactive([]);
const columns = [
  {
    title: '文件一',
    children: [
      {
        title: '文件名称',
        dataIndex: 'file1Name',
        className: 'sub-column'
      },
      {
        title: '行号',
        dataIndex: 'file1LineNumber',
        className: 'sub-column'
      },
      {
        title: '发生金额',
        dataIndex: 'file1Amount',
        className: 'sub-column'
      },
      {
        title: '其他信息',
        dataIndex: 'file1OtherInfo',
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
        className: 'sub-column'
      },
      {
        title: '行号',
        dataIndex: 'file2LineNumber',
        className: 'sub-column'
      },
      {
        title: '发生金额',
        dataIndex: 'file2Amount',
        className: 'sub-column'
      },
      {
        title: '其他信息',
        dataIndex: 'file2OtherInfo',
        className: 'sub-column'
      }
    ]
  }
];


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

</script>

<style scoped>

</style>