<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { uploadFile } from '@/utils/request'
import { deleteBatchRole, deleteRole, exportRole, getRoleList } from '@/api/system'
import { useGlobalTablePageSize } from '@/hooks'
import { useSelectionMap } from '@/views/system/useSelectionMap'
import RoleDialog from './RoleDialog.vue'
import RolePermissionDialog from './RolePermissionDialog.vue'
import RoleUsersDialog from './RoleUsersDialog.vue'

defineOptions({
  name: 'SystemRolePage',
})

const { proxy } = getCurrentInstance()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const headerRef = ref()
const roleDialogRef = ref()
const permissionDialogRef = ref()
const roleUsersDialogRef = ref()
const data = ref<any[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  roleName: '',
  roleCode: '',
}
syncPageSize(baseSearch)

const { selectedRows, selectedCount, selectedKeys, clearSelected } = useSelectionMap()

const items = [
  { label: '角色名称', prop: 'roleName', type: 'input', placeholder: '请输入角色名称' },
  { label: '角色编码', prop: 'roleCode', type: 'input', placeholder: '请输入角色编码' },
]

const columns = [
  { label: '角色名称', prop: 'roleName', minWidth: 180 },
  { label: '角色编码', prop: 'roleCode', minWidth: 180 },
  { label: '备注', prop: 'description', minWidth: 220, showOverflowTooltip: true },
  { label: '创建时间', prop: 'createTime', minWidth: 180 },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    maxBtns: 4,
    btns: [
      { content: '用户', type: 'primary', handler: handleUsers },
      { content: '授权', type: 'primary', handler: handlePermission },
      { content: '编辑', type: 'primary', handler: handleEdit },
      {
        content: '删除',
        type: 'danger',
        reConfirm: true,
        title: '确认删除当前角色吗？',
        handler: handleDelete,
      },
    ],
  },
]

function handleSearch(form?) {
  baseSearch.pageNo = 1
  baseSearch.roleName = form?.roleName || ''
  baseSearch.roleCode = form?.roleCode || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}

async function init() {
  const res = await getRoleList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

function handleCreate() {
  roleDialogRef.value?.open({}, '新增角色')
}

function handleEdit({ row }) {
  roleDialogRef.value?.open(row, '编辑角色')
}

async function handleDelete({ row }) {
  await deleteRole(row.id)
  init()
}

async function handleBatchDelete() {
  await deleteBatchRole(selectedKeys.value.join(','))
  clearSelected()
  init()
}

function handleUsers({ row }) {
  roleUsersDialogRef.value?.open(row)
}

function handlePermission({ row }) {
  permissionDialogRef.value?.open({
    roleId: row.id,
  })
}

async function handleExport() {
  await exportRole({
    roleName: baseSearch.roleName,
    roleCode: baseSearch.roleCode,
  })
}

function handleImport() {
  uploadFile({
    url: '/sys/role/importExcel',
    multiple: false,
    callback: {
      success: () => init(),
    },
  })
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button
          :btns="[
            { content: '新增', type: 'primary', icon: 'el-icon-plus', handler: handleCreate },
            { content: '导入', type: 'primary', icon: 'el-icon-upload', handler: handleImport },
            { content: '导出', type: 'primary', icon: 'el-icon-download', handler: handleExport },
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

    <o-table
      v-model="selectedRows"
      selection-type="multiple"
      :height="$tableHeight.value"
      row-key="id"
      :columns="columns"
      :data="data"
      :total="total"
      :page-size="baseSearch.pageSize"
      :pageNumber="baseSearch.pageNo"
      @update="handleUpdate"
    />

    <RoleDialog ref="roleDialogRef" @success="init" />
    <RolePermissionDialog ref="permissionDialogRef" />
    <RoleUsersDialog ref="roleUsersDialogRef" />
  </div>
</template>
