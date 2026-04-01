<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { $toast } from '@oeos-components/utils'
import { getCaseDuplicateData } from '@/api/analysis.ts'

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

const tableRef = ref()
const tableData = ref<RepeatRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedMap = ref(new Map<string, RepeatRecord>())
const syncingSelection = ref(false)

const selectedCount = computed(() => selectedMap.value.size)
const displayData = computed(() =>
  tableData.value.map((item, index) => ({
    ...item,
    index: (currentPage.value - 1) * pageSize.value + index + 1,
  })),
)

const formatLine = (lineNumber: number) => `第${lineNumber}行`
const formatAmount = (amount: number) => `¥${amount}`

const syncSelection = async () => {
  await nextTick()
  if (!tableRef.value) return

  syncingSelection.value = true
  try {
    tableRef.value.clearSelection()
    displayData.value.forEach((row) => {
      if (selectedMap.value.has(row.id)) {
        tableRef.value.toggleRowSelection(row, true)
      }
    })
  } finally {
    await nextTick()
    syncingSelection.value = false
  }
}

const init = async () => {
  const sendParams = {
    caseId: '2034799048267980802',
    pageNo: currentPage.value,
    pageSize: pageSize.value,
  }
  const res = await getCaseDuplicateData(sendParams)
  tableData.value = res.records ?? []
  total.value = res.total ?? 0
  await syncSelection()
}

const handleSelectionChange = (rows: RepeatRecord[]) => {
  if (syncingSelection.value) return

  const currentPageIds = new Set(displayData.value.map((item) => item.id))

  currentPageIds.forEach((id) => {
    selectedMap.value.delete(id)
  })

  rows.forEach((row) => {
    selectedMap.value.set(row.id, row)
  })
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  init()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  init()
}

const clearSelected = () => {
  selectedMap.value.clear()
  tableRef.value?.clearSelection()
}

const exportData = () => {
  $toast(`导出全部数据，共 ${total.value} 条`, 's')
}

const exportSelectedData = () => {
  if (!selectedCount.value) {
    $toast('请先选择数据', 'w')
    return
  }

  $toast(`导出选择数据，共 ${selectedCount.value} 条`, 's')
}

init()
</script>

<template>
  <div class="repeat-page">
    <div class="repeat-page__wrap">
      <div class="repeat-page__toolbar">
        <el-button type="primary" @click="exportData">导出数据</el-button>
        <el-button type="primary" @click="exportSelectedData">导出选择数据</el-button>
      </div>

      <div class="repeat-page__selection-bar">
        <template v-if="selectedCount">
          <span>已选中 {{ selectedCount }} 条记录(可跨页)</span>
          <span class="repeat-page__selection-split">|</span>
          <span class="repeat-page__selection-clear" @click="clearSelected">清空</span>
        </template>
        <span v-else>未选中任何数据</span>
      </div>

      <el-table
        ref="tableRef"
        :data="displayData"
        row-key="id"
        border
        height="560"
        class="repeat-page__table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="58" align="center" :reserve-selection="true" />
        <el-table-column prop="index" label="序号" width="70" align="center" />

        <el-table-column label="文件一" align="center">
          <el-table-column prop="file1Name" label="文件名称" min-width="220" align="center" show-overflow-tooltip />
          <el-table-column label="行号" min-width="140" align="center">
            <template #default="{ row }">
              {{ formatLine(row.file1LineNumber) }}
            </template>
          </el-table-column>
          <el-table-column label="发生金额" min-width="140" align="center">
            <template #default="{ row }">
              {{ formatAmount(row.file1Amount) }}
            </template>
          </el-table-column>
          <el-table-column label="其他信息" min-width="140" align="center">
            <template #default="{ row }">
              {{ row.file1OtherInfo || '--' }}
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="文件二" align="center">
          <el-table-column prop="file2Name" label="文件名称" min-width="220" align="center" show-overflow-tooltip />
          <el-table-column label="行号" min-width="140" align="center">
            <template #default="{ row }">
              {{ formatLine(row.file2LineNumber) }}
            </template>
          </el-table-column>
          <el-table-column label="发生金额" min-width="140" align="center">
            <template #default="{ row }">
              {{ formatAmount(row.file2Amount) }}
            </template>
          </el-table-column>
          <el-table-column label="其他信息" min-width="140" align="center">
            <template #default="{ row }">
              {{ row.file2OtherInfo || '--' }}
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <div class="repeat-page__footer">
        <div class="repeat-page__total">共 {{ total }} 条数据</div>
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          background
          layout="prev, pager, next, sizes, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.repeat-page {
  height: 100%;
  padding: 10px 14px 22px;
  background: #fff;

  &__wrap {
    overflow: hidden;
    background: #fff;
    border: 1px solid #ebeef5;
  }

  &__toolbar {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
  }

  &__selection-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px 20px;
    margin: 0 16px 14px;
    font-size: 16px;
    color: #303133;
    background: #dff3ff;
    border: 1px solid #4bb8ff;
    border-radius: 8px;
  }

  &__selection-icon {
    font-size: 22px;
    color: #1890ff;
  }

  &__selection-split {
    color: #96a3b5;
  }

  &__selection-clear {
    color: #1890ff;
    cursor: pointer;
  }

  &__footer {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 18px;
    border-top: 1px solid #ebeef5;
  }

  &__total {
    margin-right: auto;
    font-size: 14px;
    color: #606266;
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
