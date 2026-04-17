<script setup lang="ts">
import { computed, ref } from 'vue'
import { $toast } from '@oeos-components/utils'
import { useCommonHook } from '@/store'
import { getUserList } from '@/api/system'
import { getDictLabel, ensureArray } from '@/views/system/utils'
import { useSelectionMap } from '@/views/system/useSelectionMap'
import { useGlobalTablePageSize } from '@/hooks'

defineOptions({
  name: 'SystemUserSelectDialog',
})

const emits = defineEmits<{
  (e: 'select', rows: any[]): void
}>()

const { getDictItems } = useCommonHook()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const isShow = ref(false)
const title = ref('选择用户')
const multiple = ref(true)
const excludedUserIds = ref<Array<string | number>>([])
const excludedUsernames = ref<string[]>([])
const data = ref<any[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  column: 'createTime',
  order: 'desc',
  username: '',
  realname: '',
}
syncPageSize(baseSearch)

const { tableRef, selectedCount, selectedKeys, selectedRows, handleSelectionChange, syncSelection, clearSelected } =
  useSelectionMap(data)

const items = [
  { label: '账号', prop: 'username', type: 'input', placeholder: '请输入用户账号' },
  { label: '姓名', prop: 'realname', type: 'input', placeholder: '请输入用户姓名' },
]

const columns = [
  { type: 'selection', width: 55 },
  { label: '用户账号', prop: 'username', minWidth: 140 },
  { label: '用户姓名', prop: 'realname', minWidth: 140 },
  { label: '手机号', prop: 'phone', minWidth: 140 },
  { label: '状态', prop: 'status', width: 100, useSlot: true, align: 'center' },
]

const statusOptions = computed(() => getDictItems('user_status') || [])

function normalizeRows(rows: any[]) {
  return (rows || []).filter((row) => {
    const id = row.id ?? row.userId
    if (excludedUserIds.value.some((item) => String(item) === String(id))) {
      return false
    }
    if (excludedUsernames.value.includes(row.username)) {
      return false
    }
    return true
  })
}

function handleSearch(form?) {
  baseSearch.pageNo = 1
  baseSearch.username = form?.username || ''
  baseSearch.realname = form?.realname || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}

async function init() {
  const res = await getUserList(baseSearch)
  data.value = normalizeRows(res?.records || [])
  total.value = res?.total || 0
  await syncSelection()
}

function handleConfirm() {
  if (multiple.value && selectedCount.value === 0) {
    $toast.warning('请至少选择一位用户')
    return
  }
  if (!multiple.value && selectedCount.value !== 1) {
    $toast.warning('请选择一位用户')
    return
  }
  emits('select', selectedRows.value)
  isShow.value = false
}

function open(
  options: {
    title?: string
    multiple?: boolean
    excludedUserIds?: Array<string | number> | string
    excludedUsernames?: string[]
  } = {},
) {
  title.value = options.title || '选择用户'
  multiple.value = options.multiple ?? true
  excludedUserIds.value = ensureArray(options.excludedUserIds)
  excludedUsernames.value = options.excludedUsernames || []
  clearSelected()
  handleSearch({})
  isShow.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" :title="title" width="1000px" fillSlot :confirm="handleConfirm">
    <o-flex direction="column" class="h-100%">
      <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
      </g-search-bar>

      <o-table
        ref="tableRef"
        class="f-1"
        style="min-height: 0"
        height="100%"
        row-key="id"
        :columns="columns"
        :data="data"
        :total="total"
        :page-size="baseSearch.pageSize"
        :pageNumber="baseSearch.pageNo"
        @selectionChange="handleSelectionChange"
        @update="handleUpdate"
      >
        <template #status="{ value }">
          <o-tag :type="String(value) === '1' ? 'success' : 'danger'">
            {{ getDictLabel(statusOptions, value) }}
          </o-tag>
        </template>
      </o-table>
    </o-flex>
  </o-dialog>
</template>
