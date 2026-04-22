<script setup lang="ts">
import { computed, ref } from 'vue'
import { deleteRecycleUser, getUserRecycleList, revertRecycleUser } from '@/api/system'
import { useSelectionMap } from '@/views/system/useSelectionMap'
import { useCommonHook } from '@/store'
import { getDictLabel } from '@/views/system/utils'
import { useProvideOTablePageSize, useTablePagination } from '@/hooks'

defineOptions({
  name: 'SystemUserRecycleDialog',
})

const emits = defineEmits(['success'])
const { getDictItems } = useCommonHook()
useProvideOTablePageSize()

const isShow = ref(false)
const data = ref<any[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
}

function getRowId(row: Record<string, any> = {}) {
  return row.id ?? row.userId ?? row.userid ?? row.user_id ?? ''
}

const { selectedRows, selectedCount, selectedKeys, clearSelected } = useSelectionMap(undefined, getRowId)

const columns = [
  { label: '用户账号', prop: 'username', minWidth: 140 },
  { label: '用户姓名', prop: 'realname', minWidth: 140 },
  { label: '性别', prop: 'sex', minWidth: 100, useSlot: true, align: 'center' },
  { label: '手机号', prop: 'phone', minWidth: 140 },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    btns: [
      { content: '取回', type: 'primary', handler: handleRevert },
      {
        content: '彻底删除',
        type: 'danger',
        reConfirm: true,
        title: '彻底删除后不可恢复，确认继续吗？',
        handler: handleDelete,
      },
    ],
  },
]

const sexOptions = computed(() => getDictItems('sex') || [])

function resolveRecycleRows(res: any) {
  const rawRows = Array.isArray(res)
    ? res
    : Array.isArray(res?.records)
      ? res.records
      : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res?.list)
          ? res.list
          : Array.isArray(res?.result)
            ? res.result
            : Array.isArray(res?.result?.records)
              ? res.result.records
              : Array.isArray(res?.result?.rows)
                ? res.result.rows
                : Array.isArray(res?.result?.list)
                  ? res.result.list
                  : []

  return rawRows.map((row) => ({
    ...row,
    id: getRowId(row),
    username: row.username ?? row.userName ?? row.loginName ?? row.login_name ?? '',
    realname: row.realname ?? row.realName ?? row.name ?? '',
    phone: row.phone ?? row.mobile ?? row.mobilePhone ?? '',
    sex: row.sex ?? row.gender ?? '',
  }))
}

function resolveRecycleTotal(res: any, rows: any[]) {
  const rawTotal = Array.isArray(res)
    ? rows.length
    : (res?.total ?? res?.count ?? res?.totalCount ?? res?.result?.total ?? res?.result?.count ?? rows.length)

  const parsedTotal = Number(rawTotal)
  return Number.isFinite(parsedTotal) ? parsedTotal : rows.length
}

async function init() {
  const res = await getUserRecycleList(baseSearch)
  const rows = resolveRecycleRows(res)
  data.value = rows
  total.value = resolveRecycleTotal(res, rows)
}

const { handlePageUpdate: handleUpdate } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.pageNo = pageNo
  return init()
})

async function handleRevert({ row }) {
  await revertRecycleUser({
    userIds: String(getRowId(row)),
  })
  emits('success')
  init()
}

async function handleDelete({ row }) {
  await deleteRecycleUser(String(getRowId(row)))
  init()
}

async function handleBatchRevert() {
  await revertRecycleUser({
    userIds: selectedKeys.value.join(','),
  })
  clearSelected()
  emits('success')
  init()
}

async function handleBatchDelete() {
  await deleteRecycleUser(selectedKeys.value.join(','))
  clearSelected()
  init()
}

function open() {
  baseSearch.pageNo = 1
  isShow.value = true
  clearSelected()
  init()
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="用户回收站" width="1000px" fillSlot :showConfirm="false">
    <o-flex direction="column" class="h-100%">
      <div class="mb2 flex items-center gap-2">
        <gSelectedCount :count="selectedCount" @clear="clearSelected" />
        <el-button v-if="selectedCount > 0" type="primary" @click="handleBatchRevert">批量取回</el-button>
        <el-button v-if="selectedCount > 0" type="danger" @click="handleBatchDelete">批量彻底删除</el-button>
      </div>

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
        <template #sex="{ value }">
          {{ getDictLabel(sexOptions, value) }}
        </template>
      </o-table>
    </o-flex>
  </o-dialog>
</template>
