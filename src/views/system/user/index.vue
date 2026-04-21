<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { $toast } from '@oeos-components/utils'
import { uploadFile } from '@/utils/request'
import { useCommonHook } from '@/store'
import { useGlobalTablePageSize } from '@/hooks'
import { batchFrozenUser, deleteBatchUser, deleteUser, exportUser, getUserList } from '@/api/system'
import { getDictLabel } from '@/views/system/utils'
import { useSelectionMap } from '@/views/system/useSelectionMap'
import UserDialog from './UserDialog.vue'
import PasswordDialog from './PasswordDialog.vue'
import AgentDialog from './AgentDialog.vue'
import UserRecycleDialog from './UserRecycleDialog.vue'

defineOptions({
  name: 'SystemUserPage',
})

const { proxy } = getCurrentInstance()
const { getDictItems } = useCommonHook()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const headerRef = ref()
const userDialogRef = ref()
const passwordDialogRef = ref()
const agentDialogRef = ref()
const recycleDialogRef = ref()
const data = ref<any[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  order: 'desc',
  username: '',
  realname: '',
  sex: '',
  phone: '',
  status: '',
}
syncPageSize(baseSearch)

const { selectedCount, selectedKeys, selectedRows, clearSelected } = useSelectionMap()

const items = [
  { label: '账号', prop: 'username', type: 'input', placeholder: '请输入账号' },
  { label: '姓名', prop: 'realname', type: 'input', placeholder: '请输入姓名' },
  { label: '性别', prop: 'sex', type: 'select', placeholder: '请选择性别', dict: 'sex' },
  { label: '手机号', prop: 'phone', type: 'input', placeholder: '请输入手机号' },
  { label: '状态', prop: 'status', type: 'select', placeholder: '请选择状态', dict: 'user_status' },
]

const columns = [
  { label: '用户账号', prop: 'username' },
  { label: '用户姓名', prop: 'realname' },
  { label: '头像', prop: 'avatar', width: 80, useSlot: true },
  { label: '性别', prop: 'sex', align: 'center', useSlot: true },
  { label: '生日', prop: 'birthday' },
  { label: '手机号', prop: 'phone' },
  { label: '部门', prop: 'orgCodeTxt', showOverflowTooltip: true },
  { label: '负责部门', prop: 'departIds_dictText', showOverflowTooltip: true },
  { label: '状态', prop: 'status', align: 'center', useSlot: true },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    maxBtns: 5,
    btns: [
      { content: '编辑', type: 'primary', handler: handleEdit },
      { content: '密码', type: 'primary', handler: handlePassword },
      { content: '代理人', type: 'primary', handler: handleAgent },
      {
        content: (row) => (String(row.status) === '1' ? '冻结' : '解冻'),
        type: 'warning',
        reConfirm: true,
        title: (row) => (String(row.status) === '1' ? '确认冻结当前账号吗？' : '确认解冻当前账号吗？'),
        handler: handleToggleFrozen,
      },
      {
        content: '删除',
        type: 'danger',
        reConfirm: true,
        title: '确认删除当前用户吗？',
        handler: handleDelete,
      },
    ],
  },
]

const sexOptions = computed(() => getDictItems('sex') || [])
const statusOptions = computed(() => getDictItems('user_status') || [])

function handleSearch(form?) {
  baseSearch.pageNo = 1
  baseSearch.username = form?.username || ''
  baseSearch.realname = form?.realname || ''
  baseSearch.sex = form?.sex || ''
  baseSearch.phone = form?.phone || ''
  baseSearch.status = form?.status || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}

async function init() {
  const res = await getUserList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

function handleCreate() {
  userDialogRef.value?.open({}, { title: '新增用户' })
}

function handleEdit(row) {
  userDialogRef.value?.open(row, { title: '编辑用户' })
}

function handlePassword(row) {
  passwordDialogRef.value?.open(row.username)
}

function handleAgent(row) {
  agentDialogRef.value?.open(row.username)
}

function hasAdminUser(rows: any[]) {
  return (rows || []).some((item) => item.username === 'admin')
}

async function handleDelete(row) {
  if (row.username === 'admin') {
    $toast.warning('管理员账号不允许删除')
    return
  }
  await deleteUser(row.id)
  init()
}

async function handleBatchDelete() {
  if (hasAdminUser(selectedRows.value)) {
    $toast.warning('管理员账号不允许删除')
    return
  }
  await deleteBatchUser(selectedKeys.value.join(','))
  clearSelected()
  init()
}

async function handleToggleFrozen(row) {
  if (row.username === 'admin') {
    $toast.warning('管理员账号不允许冻结或解冻')
    return
  }
  await batchFrozenUser({
    ids: String(row.id),
    status: String(row.status) === '1' ? 2 : 1,
  })
  init()
}

async function handleBatchFrozen(status: number) {
  if (hasAdminUser(selectedRows.value)) {
    $toast.warning('管理员账号不允许冻结或解冻')
    return
  }
  await batchFrozenUser({
    ids: selectedKeys.value.join(','),
    status,
  })
  clearSelected()
  init()
}

function handleImport() {
  uploadFile({
    url: '/sys/user/importExcel',
    multiple: false,
    callback: {
      success: () => init(),
    },
  })
}

async function handleExport() {
  await exportUser({
    username: baseSearch.username,
    realname: baseSearch.realname,
    sex: baseSearch.sex,
    phone: baseSearch.phone,
    status: baseSearch.status,
  })
}

function handleRecycle() {
  recycleDialogRef.value?.open()
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" :itemsPerRow="5" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button
          :btns="[
            { content: '新增', type: 'primary', icon: 'el-icon-plus', handler: handleCreate },
            { content: '导入', type: 'primary', icon: 'el-icon-upload', handler: handleImport },
            { content: '导出', type: 'primary', icon: 'el-icon-download', handler: handleExport },
            { content: '回收站', type: 'primary', icon: 'el-icon-delete', handler: handleRecycle },
            {
              content: '批量删除',
              type: 'danger',
              icon: 'el-icon-delete',
              disabled: () => selectedCount === 0,
              isShow: () => selectedCount !== 0,
              handler: handleBatchDelete,
            },
            {
              content: '批量冻结',
              type: 'warning',
              icon: 'el-icon-lock',
              disabled: () => selectedCount === 0,
              isShow: () => selectedCount !== 0,
              handler: () => handleBatchFrozen(2),
            },
            {
              content: '批量解冻',
              type: 'primary',
              icon: 'el-icon-unlock',
              disabled: () => selectedCount === 0,
              isShow: () => selectedCount !== 0,
              handler: () => handleBatchFrozen(1),
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
    >
      <template #avatar="{ row }">
        <el-avatar :src="row.avatar" :size="32">
          {{ row.realname?.slice?.(0, 1) || row.username?.slice?.(0, 1) }}
        </el-avatar>
      </template>
      <template #sex="{ value }">
        {{ getDictLabel(sexOptions, value) }}
      </template>
      <template #status="{ value }">
        <o-tag :type="String(value) === '1' ? 'success' : 'danger'">
          {{ getDictLabel(statusOptions, value) }}
        </o-tag>
      </template>
    </o-table>

    <UserDialog ref="userDialogRef" @success="init" />
    <PasswordDialog ref="passwordDialogRef" @success="init" />
    <AgentDialog ref="agentDialogRef" @success="init" />
    <UserRecycleDialog ref="recycleDialogRef" @success="init" />
  </div>
</template>
