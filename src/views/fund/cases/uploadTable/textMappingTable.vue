<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'

import { casefileFileConfigData } from '@/api/analysis'

const { proxy } = getCurrentInstance()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const props = defineProps({
  orgCode: {
    type: String,
    required: true,
  },
  pageId: {
    type: String,
    required: true,
  },
})

const data = ref({})
const editRow = (row) => {}
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
        comp: 'o-icon',
        attrs: {
          name: 'edit',
          type: 'svg',
          content: '编辑',
        },
      },
    ],
  },
]

const init = async () => {
  let sendParams = {
    pageId: props.pageId,
    orgCode: props.orgCode,
  }
  let res = await casefileFileConfigData(sendParams)
  console.log(`06 res`, res)
  data.value = res[0]
}

const sourceColumns = computed(() => {
  return data.value.dataBlockStucts ?? []
})

const noMappingFields = computed(() => {
  return (
    data.value?.noMappingTitle
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  )
})

const tableData = computed(() => {
  const maxRowCount = Math.max(...sourceColumns.value.map((item) => item.datas?.length ?? 0), 0)

  return Array.from({ length: maxRowCount }, (_, index) => {
    const row = {
      __index: index + 1,
    }

    sourceColumns.value.forEach((column, columnIndex) => {
      row[`col_${columnIndex}`] = column.datas?.[index] ?? ''
    })

    return row
  })
})

const handleColumnHeader = async (column, idx) => {
  console.log(`68 idx`, idx)
  console.log(`21 column`, column)
}

const headerCellStyle = ({ column }) => {
  if (column.className?.includes('unmapped')) {
    return {
      color: '#f04438',
      fontWeight: 700,
    }
  }

  return {
    fontWeight: 600,
  }
}

defineExpose({
  init,
})
</script>

<template>
  <div class="mapping-table-page">
    <div class="mapping-summary">
      <div class="mapping-summary__line">
        <span class="mapping-summary__label">未映射的字段:</span>
        <span class="mapping-summary__value">{{ noMappingFields.join('、') }}</span>
      </div>
      <div class="mapping-summary__tip">
        <span class="mapping-summary__star">*</span>
        <span>下表数据为示例数据，不是全部数据</span>
      </div>
    </div>

    <div class="mapping-table-wrapper">
      <el-table
        :data="tableData"
        border
        stripe
        row-key="__index"
        table-layout="auto"
        :header-cell-style="headerCellStyle"
      >
        <el-table-column fixed="left" align="center" class-name="group-column" label="配置列">
          <el-table-column prop="__index" label="原字段" width="80" align="center" fixed="left" />
        </el-table-column>

        <el-table-column
          v-for="(column, columnIndex) in sourceColumns"
          :key="column.faFileParameter.id"
          :label="column.faFileParameter.newMetaData?.trim() || '未映射'"
          :min-width="((column.faFileParameter.newMetaData?.trim() || '未映射').length + 2) * 14"
          align="center"
          :class-name="
            column.faFileParameter.newMetaData?.trim() ? 'group-column' : 'group-column unmapped-group-column'
          "
        >
          <template #header>
            <div class="config-header-cell">
              <span>{{ column.faFileParameter.newMetaData?.trim() || '未映射' }}</span>
              <el-button link type="primary" :icon="Edit" @click="handleColumnHeader(column, columnIndex)" />
            </div>
          </template>
          <el-table-column
            :prop="`col_${columnIndex}`"
            :min-width="((column.faFileParameter.titleColName?.trim() || '-').length + 2) * 14"
            align="center"
            :class-name="column.faFileParameter.newMetaData?.trim() ? '' : 'unmapped-column'"
          >
            <template #header>
              <span>{{ column.faFileParameter.titleColName?.trim() || '-' }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mapping-table-page {
  padding: 16px;
  background: #fff;
}

.mapping-summary {
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.mapping-summary__line {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.7;
}

.mapping-summary__label {
  flex-shrink: 0;
  font-weight: 600;
  color: #303133;
}

.mapping-summary__value {
  font-weight: 600;
  color: #f04438;
}

.mapping-summary__tip {
  margin-top: 12px;
  color: #606266;
}

.mapping-summary__star {
  margin-right: 4px;
  font-weight: 700;
  color: #f04438;
}

:deep(.el-table) {
  width: max-content;
  min-width: 100%;
}

:deep(.el-table th .cell) {
  font-weight: 600;
  white-space: nowrap;
}

.mapping-table-wrapper {
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

:deep(.config-header-cell) {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

:deep(.config-header-actions .el-button) {
  padding: 2px;
  margin-left: 0;
}

:deep(.el-table .unmapped-group-column),
:deep(.el-table .unmapped-column) {
  color: #f04438;
}
</style>
