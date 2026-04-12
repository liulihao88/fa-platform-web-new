<script setup lang="ts">
import { computed, ref, nextTick, watch, useTemplateRef } from 'vue'
import { $toast, isEmpty } from '@oeos-components/utils'
import { getCaseDuplicateData } from '@/api/analysis.ts'
import { useRouter, useRoute } from 'vue-router'

import { useMethods, useGlobalTablePageSize, useRelativeHeight } from '@/hooks'

const { exportXls } = useMethods()
const { syncPageSize, globalPageSize, updatePageSize } = useGlobalTablePageSize()
const { query } = useRoute()
const pageRef = useTemplateRef('pageRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, pageRef, { minHeight: 300, offset: 62 })
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

const displayData = ref()
const tableRef = ref()
const syncingSelection = ref(false)

const syncSelection = async () => {
  await nextTick()
  if (!tableRef.value) return

  syncingSelection.value = true
  try {
    tableRef.value.$refs.tableRef.clearSelection()
    displayData.value.forEach((row) => {
      if (selectedMap.value.has(row.id)) {
        tableRef.value.$refs.tableRef.toggleRowSelection(row, true)
      }
    })
  } finally {
    await nextTick()
    syncingSelection.value = false
  }
}

const response = ref({})

const currentPage = ref(1)
const pageSize = ref(globalPageSize.value)
syncPageSize(pageSize, 'value')
const selectedMap = ref(new Map<string, any>())

const init = async () => {
  let sendParams = {
    caseId: query.caseId,
    pageNo: currentPage.value,
    pageSize: pageSize.value,
  }
  let res = await getCaseDuplicateData(sendParams)
  response.value = res
  displayData.value = res.records
  await syncSelection()
}
init()

const columns = [] as any[]

const formatLine = (lineNumber: number) => `第${lineNumber}行`
const formatAmount = (amount: number) => `¥${amount}`
const selectedCount = computed(() => selectedMap.value.size)

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

const handleUpdate = (pageNo: number, size: number) => {
  currentPage.value = pageNo
  updatePageSize(pageSize, size, 'value')
  init()
}

const clearSelected = () => {
  selectedMap.value.clear()
  tableRef.value?.$refs.tableRef.clearSelection()
}

const exportData = () => {
  $toast(`导出全部数据，共 ${response.value.total} 条`, 's')
  const params = {
    caseId: query.caseId,
    ids: [],
  }
  exportXls('重复数据列表', 'fa/caseDuplicateData/exportXls', params, false, 'post')
}

const exportSelectedData = () => {
  if (!selectedCount.value) {
    $toast('请先选择数据', 'w')
    return
  }

  const params = {
    caseId: query.caseId,
    ids: Array.from(selectedMap.value.keys()),
  }
  console.log(`94 params`, params)
  exportXls('重复数据列表', 'fa/caseDuplicateData/exportXls', params, false, 'post')
}

const indexMethod = (index) => {
  console.log(`37 index`, index)
  // 如果当前页是最后一页（数据量不足 pageSize），则基于实际数据量计算
  return (currentPage.value - 1) * pageSize.value + index + 1
}

watch(
  selectedMap,
  (val) => {
    console.log(`14 103行 test/t2.vue val`, val)
  },
  {
    deep: true,
    immediate: true,
  },
)
</script>

<template>
  <div ref="pageRef" class="repeat-page">
    <div class="repeat-page__wrap">
      <o-flex align="center" class="repeat-page__toolbar">
        <div>
          <o-button type="primary" icon="el-icon-download" :disabled="isEmpty(displayData)" @click="exportData">
            导出数据
          </o-button>
          <o-button type="primary" icon="el-icon-download" :disabled="!selectedCount" @click="exportSelectedData">
            导出选择数据
          </o-button>
        </div>
        <gSelectedCount :count="selectedCount" class="ml2" @clear="clearSelected" />
      </o-flex>

      <div ref="tableSectionRef" class="repeat-page__table">
        <o-table
          ref="tableRef"
          :columns="columns"
          :data="displayData"
          :total="response.total"
          :pageSize="pageSize"
          :pageNumber="currentPage"
          row-key="id"
          :index="indexMethod"
          :height="tableHeight"
          @selection-change="handleSelectionChange"
          @update="handleUpdate"
        >
          <el-table-column type="selection" width="58" align="center" :reserve-selection="true" />
          <!-- <el-table-column prop="index" label="序号1" width="70" align="center" /> -->
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
        </o-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.repeat-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;

  &__top-line {
    height: 6px;
    margin-bottom: 8px;
    background: #ebf5ff;
    border: 1px solid #8fd0ff;
    border-radius: 3px;
  }

  &__wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #ebeef5;
  }

  &__toolbar {
    display: flex;
    flex-shrink: 0;
    padding: 0 16px;
    margin: 8px 0;
  }

  &__table {
    min-height: 0;
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
