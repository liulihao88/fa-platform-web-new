<script setup lang="ts">
import { computed, ref } from 'vue'
import { $toast } from '@oeos-components/utils'
import { deleteBatchRoleUser, deleteRoleUser, addRoleUsers, getRoleUserList } from '@/api/system'
import { useSelectionMap } from '@/views/system/useSelectionMap'
import { useCommonHook } from '@/store'
import { getDictLabel } from '@/views/system/utils'
import { useTablePagination } from '@/hooks'
import UserDialog from '@/views/system/user/UserDialog.vue'
import UserSelectDialog from '@/views/system/components/UserSelectDialog.vue'

defineOptions({
  name: 'SystemRoleUsersDialog',
})

const isShow = ref(false)
const roleRow = ref<any>({})
const userDialogRef = ref()
const userSelectDialogRef = ref()
const data = ref<any[]>([])
const total = ref(0)

const { getDictItems } = useCommonHook()
const { selectedRows, selectedCount, selectedKeys, clearSelected } = useSelectionMap()

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  roleId: '',
  username: '',
}

const items = [{ label: '用户账号', prop: 'username', type: 'input', placeholder: '请输入用户账号' }]

const columns = [
  { label: '用户账号', prop: 'username', minWidth: 140 },
  { label: '用户姓名', prop: 'realname', minWidth: 140 },
  { label: '手机号', prop: 'phone', minWidth: 140 },
  { label: '状态', prop: 'status', width: 100, align: 'center', useSlot: true },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    btns: [
      { content: '编辑', type: 'primary', handler: handleEdit },
      {
        content: '取消关联',
        type: 'danger',
        reConfirm: true,
        title: '确认取消当前用户与角色的关联吗？',
        handler: handleDelete,
      },
    ],
  },
]

const statusOptions = computed(() => getDictItems('user_status') || [])

function handleSearch(form?) {
  baseSearch.pageNo = 1
  baseSearch.username = form?.username || ''
  init()
}

async function init() {
  const res = await getRoleUserList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

const { handlePageUpdate: handleUpdate } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.pageNo = pageNo
  return init()
})

function handleCreate() {
  userDialogRef.value?.open(
    {},
    {
      title: '新增用户',
      presetRoleIds: [roleRow.value.id],
      presetRoleOptions: [
        {
          label: roleRow.value.roleName,
          value: roleRow.value.id,
        },
      ],
      lockRoles: true,
    },
  )
}

function handleEdit({ row }) {
  userDialogRef.value?.open(row, { title: '编辑用户' })
}

async function handleDelete({ row }) {
  await deleteRoleUser({
    userId: row.id,
    roleId: roleRow.value.id,
  })
  init()
}

async function handleBatchDelete() {
  if (selectedCount.value === 0) {
    $toast.warning('请先选择需要取消关联的用户')
    return
  }
  await deleteBatchRoleUser({
    userIds: selectedKeys.value.join(','),
    roleId: roleRow.value.id,
  })
  clearSelected()
  init()
}

function handleSelectExisting() {
  userSelectDialogRef.value?.open({
    title: '选择已有用户',
    multiple: true,
  })
}

async function handleSelectedUsers(rows: any[]) {
  if (!rows?.length) return
  await addRoleUsers({
    roleId: roleRow.value.id,
    userIdList: rows.map((item) => item.id),
  })
  init()
}

function open(row) {
  roleRow.value = row || {}
  baseSearch.roleId = row?.id || ''
  isShow.value = true
  clearSelected()
  handleSearch({})
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog
    v-model="isShow"
    :title="`${roleRow.roleName || ''} - 角色用户`"
    width="1100px"
    fillSlot
    :showConfirm="false"
  >
    <o-flex direction="column" class="h-100%">
      <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button
          :btns="[
            { content: '新增用户', type: 'primary', icon: 'el-icon-plus', handler: handleCreate },
            { content: '已有用户', type: 'primary', icon: 'el-icon-user', handler: handleSelectExisting },
            {
              content: '批量取消关联',
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

      <o-table
        v-model="selectedRows"
        selection-type="multiple"
        class="f-1"
        style="min-height: 0"
        height="100%"
        row-key="id"
        :columns="columns"
        :data="data"
        :total="total"
        :pageNumber="baseSearch.pageNo"
        @update="handleUpdate"
      >
        <template #status="{ value }">
          <o-tag :type="String(value) === '1' ? 'success' : 'danger'">
            {{ getDictLabel(statusOptions, value) }}
          </o-tag>
        </template>
      </o-table>
    </o-flex>

    <UserDialog ref="userDialogRef" @success="init" />
    <UserSelectDialog ref="userSelectDialogRef" @select="handleSelectedUsers" />
  </o-dialog>
</template>
