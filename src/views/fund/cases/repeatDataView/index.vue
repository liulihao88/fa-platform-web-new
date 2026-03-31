<script setup lang="ts">
import { computed, ref } from 'vue'

interface RepeatRecord {
  id: string
  file1Name: string
  file1LineNumber: number
  file1Amount: number
  file1OtherInfo: string
  file2Name: string
  file2LineNumber: number
  file2Amount: number
  file2OtherInfo: string
}

const response = {
  records: [
    {
      id: '2037330845207945218',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 456,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 456,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330845350551554',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 177,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 177,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330845526712321',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 444,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 444,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330845950337025',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 486,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 486,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330846365573122',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 484,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 484,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330846785003521',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 417,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 417,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330847170879489',
      file1Name: '1/广发银行-脱敏.xlsx',
      file1LineNumber: 345,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '广发银行-脱敏.xlsx',
      file2LineNumber: 345,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330847590309890',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 331,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 331,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330847938437121',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 466,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 466,
      file2Amount: 0,
      file2OtherInfo: '',
    },
    {
      id: '2037330848215261185',
      file1Name: '广发银行-脱敏.xlsx',
      file1LineNumber: 366,
      file1Amount: 0,
      file1OtherInfo: '徐磊',
      file2Name: '1/广发银行-脱敏.xlsx',
      file2LineNumber: 366,
      file2Amount: 0,
      file2OtherInfo: '',
    },
  ] as RepeatRecord[],
  total: 500,
  size: 10,
  current: 1,
  pages: 50,
}

const currentPage = ref(response.current)
const pageSize = ref(response.size)
const selectedRows = ref<RepeatRecord[]>([])

const allRecords = computed(() =>
  Array.from({ length: response.total }, (_, index) => {
    const source = response.records[index % response.records.length]
    return {
      ...source,
      id: `${source.id}-${index + 1}`,
      index: index + 1,
    }
  }),
)

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allRecords.value.slice(start, end)
})

const columns = [
  {
    type: 'selection',
    width: 58,
    align: 'center',
  },
  {
    label: '序号',
    prop: 'index',
    width: 62,
    align: 'center',
  },
  {
    label: '文件名称',
    prop: 'file1Name',
    minWidth: 220,
    align: 'center',
  },
  {
    label: '行号',
    prop: 'file1LineNumber',
    minWidth: 120,
    align: 'center',
    useSlot: true,
  },
  {
    label: '发生金额',
    prop: 'file1Amount',
    minWidth: 120,
    align: 'center',
    useSlot: true,
  },
  {
    label: '其他信息',
    prop: 'file1OtherInfo',
    minWidth: 140,
    align: 'center',
    useSlot: true,
  },
  {
    label: '文件名称',
    prop: 'file2Name',
    minWidth: 220,
    align: 'center',
  },
  {
    label: '行号',
    prop: 'file2LineNumber',
    minWidth: 120,
    align: 'center',
    useSlot: true,
  },
  {
    label: '发生金额',
    prop: 'file2Amount',
    minWidth: 120,
    align: 'center',
    useSlot: true,
  },
  {
    label: '其他信息',
    prop: 'file2OtherInfo',
    minWidth: 140,
    align: 'center',
    useSlot: true,
  },
] as any[]

const formatLine = (lineNumber: number) => `第${lineNumber}行`
const formatAmount = (amount: number) => `¥${amount}`

const handleSelectionChange = (rows: RepeatRecord[]) => {
  selectedRows.value = rows
}

const handleUpdate = (pageNo: number, size: number) => {
  currentPage.value = pageNo
  pageSize.value = size
}
</script>

<template>
  <div class="repeat-page">
    <div class="repeat-page__wrap">
      <div class="repeat-page__group-header">
        <div class="repeat-page__group-header-empty" />
        <div class="repeat-page__group-header-empty repeat-page__group-header-empty--index" />
        <div class="repeat-page__group-header-title">文件一</div>
        <div class="repeat-page__group-header-title">文件二</div>
      </div>

      <o-table
        :columns="columns"
        :data="tableData"
        :total="response.total"
        :pageSize="pageSize"
        :currentPage="currentPage"
        :showIndex="false"
        height="560"
        class="repeat-page__table"
        @selection-change="handleSelectionChange"
        @update="handleUpdate"
      >
        <template #file1LineNumber="{ value }">
          {{ formatLine(value) }}
        </template>
        <template #file1Amount="{ value }">
          {{ formatAmount(value) }}
        </template>
        <template #file1OtherInfo="{ value }">
          {{ value || '--' }}
        </template>
        <template #file2LineNumber="{ value }">
          {{ formatLine(value) }}
        </template>
        <template #file2Amount="{ value }">
          {{ formatAmount(value) }}
        </template>
        <template #file2OtherInfo="{ value }">
          {{ value || '--' }}
        </template>
      </o-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.repeat-page {
  height: 100%;
  padding: 10px 14px 22px;
  background: #fff;

  &__top-line {
    height: 6px;
    margin-bottom: 8px;
    background: #ebf5ff;
    border: 1px solid #8fd0ff;
    border-radius: 3px;
  }

  &__wrap {
    overflow: hidden;
    background: #fff;
    border: 1px solid #ebeef5;
  }

  &__group-header {
    display: grid;
    grid-template-columns: 58px 62px minmax(600px, 1fr) minmax(600px, 1fr);
    background: #fff;
    border-bottom: 1px solid #ebeef5;
  }

  &__group-header-empty,
  &__group-header-title {
    height: 48px;
    border-right: 1px solid #ebeef5;
  }

  &__group-header-empty--index {
    border-right: 1px solid #ebeef5;
  }

  &__group-header-title {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: #303133;
  }

  &__group-header-title:last-child {
    border-right: 0;
  }

  :deep(.el-table th.el-table__cell) {
    padding: 10px 0;
    font-size: 15px;
    font-weight: 700;
    color: #303133;
    background: #fff;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 14px 0;
    font-size: 14px;
    color: #606266;
  }

  :deep(.el-table .cell) {
    line-height: 1.4;
  }

  :deep(.el-table__body .el-table__row:hover > td.el-table__cell) {
    background: #f8fbff;
  }
}
</style>
