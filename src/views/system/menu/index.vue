<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { $toast } from '@oeos-components/utils'
import { getMenuList, deleteBatchMenu, deleteMenu } from '@/api/system'
import { useCommonHook } from '@/store'
import { getDictLabel } from '@/views/system/utils'
import MenuDialog from './MenuDialog.vue'
import MenuIconPreview from './MenuIconPreview.vue'
import DataRuleDrawer from './DataRuleDrawer.vue'

defineOptions({
  name: 'SystemMenuPage',
})

const { proxy } = getCurrentInstance()
const { getDictItems } = useCommonHook()

const headerRef = ref()
const tableRef = ref()
const dialogRef = ref()
const dataRuleDrawerRef = ref()

const loading = ref(false)
const tableKey = ref(0)
const expandAll = ref(true)
const selectedRows = ref<any[]>([])
const data = ref<any[]>([])
const searchForm = ref({
  name: '',
})

const selectedCount = computed(() => selectedRows.value.length)
const menuTypeOptions = computed(() => getDictItems('menu_type') || [])

const items = [{ label: '菜单名称', prop: 'name', type: 'input', placeholder: '请输入菜单名称' }]

async function init() {
  loading.value = true
  try {
    data.value = await getMenuList({
      name: searchForm.value.name,
    })
    refreshTable()
  } finally {
    loading.value = false
  }
}

function refreshTable() {
  tableKey.value += 1
}

function handleSearch(form?) {
  searchForm.value.name = form?.name || ''
  init()
}

function clearSelected() {
  selectedRows.value = []
  tableRef.value?.clearSelection?.()
}

function handleSelectionChange(rows) {
  selectedRows.value = rows || []
}

function handleCreate() {
  dialogRef.value?.open({}, '新增菜单')
}

function handleEdit(row) {
  dialogRef.value?.open(row, '编辑菜单')
}

function handleDetail(row) {
  dialogRef.value?.open(row, '菜单详情')
}

function handleAddChild(row) {
  dialogRef.value?.open(
    {
      parentId: row.id,
      menuType: 1,
    },
    '添加下级菜单',
  )
}

function handleRule(row) {
  dataRuleDrawerRef.value?.open(row.id)
}

async function handleDelete(row) {
  await deleteMenu(row.id)
  init()
}

async function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    $toast.warning('请先选择需要删除的菜单')
    return
  }
  await ElMessageBox.confirm('确认删除当前选中的菜单吗？', '批量删除', {
    type: 'warning',
  })
  await deleteBatchMenu(selectedRows.value.map((item) => item.id).join(','))
  clearSelected()
  init()
}

function handleExpand(expanded: boolean) {
  expandAll.value = expanded
  refreshTable()
}

function getActionButtons(row) {
  return [
    { label: '编辑', handler: () => handleEdit(row) },
    { label: '详情', handler: () => handleDetail(row) },
    { label: '添加下级', handler: () => handleAddChild(row) },
    { label: '数据规则', handler: () => handleRule(row) },
    { label: '删除', handler: () => handleDelete(row), danger: true },
  ]
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div class="system-menu-page">
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button
          :btns="[
            { content: '新增', type: 'primary', icon: 'el-icon-plus', handler: handleCreate },
            { content: '展开全部', type: 'primary', icon: 'el-icon-plus', handler: () => handleExpand(true) },
            { content: '折叠全部', type: 'primary', icon: 'el-icon-minus', handler: () => handleExpand(false) },
            {
              content: '批量删除',
              type: 'danger',
              icon: 'el-icon-delete',
              disabled: () => selectedCount === 0,
              isShow: () => selectedCount !== 0,
              handler: handleBatchDelete,
            },
          ]"
          mode="opt"
          trigger="hover"
        />
      </g-search-bar>
    </div>

    <el-card shadow="never">
      <el-table
        :key="tableKey"
        ref="tableRef"
        v-loading="loading"
        :data="data"
        row-key="id"
        :height="$tableHeight.value"
        border
        :default-expand-all="expandAll"
        :tree-props="{ children: 'children' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="52" />
        <el-table-column prop="name" label="菜单名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="menuType" label="菜单类型" width="120" align="center">
          <template #default="{ row }">
            {{ getDictLabel(menuTypeOptions, row.menuType) }}
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="90" align="center">
          <template #default="{ row }">
            <MenuIconPreview :icon="row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="component" label="前端组件" min-width="180" show-overflow-tooltip />
        <el-table-column prop="url" label="访问路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortNo" label="排序" width="90" align="center" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="flex opretion" style="justify-content: space-between">
              <el-button
                v-for="button in getActionButtons(row)"
                :key="button.label"
                text
                :type="button.danger ? 'danger' : 'primary'"
                @click="button.handler"
              >
                {{ button.label }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuDialog ref="dialogRef" :menuTreeData="data" @success="init" />
    <DataRuleDrawer ref="dataRuleDrawerRef" />
  </div>
</template>

<style scoped lang="scss">
.system-menu-page :deep(.el-card__body) {
  padding: 0;
}

.opretion :deep(.el-button, .el-button.is-round) {
  padding: 0;
}
</style>
