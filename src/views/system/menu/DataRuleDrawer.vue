<script setup lang="ts">
import { ref } from 'vue'
import { getMenuRuleList, deleteMenuRule } from '@/api/system'
import DataRuleDialog from './DataRuleDialog.vue'
import { useGlobalTablePageSize } from '@/hooks'

defineOptions({
  name: 'SystemMenuDataRuleDrawer',
})

const isShow = ref(false)
const permissionId = ref('')
const dialogRef = ref()
const total = ref(0)
const data = ref<any[]>([])

const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  permissionId: '',
  ruleName: '',
  ruleValue: '',
}
syncPageSize(baseSearch)

const items = [
  { label: '规则名称', prop: 'ruleName', type: 'input', placeholder: '请输入规则名称' },
  { label: '规则值', prop: 'ruleValue', type: 'input', placeholder: '请输入规则值' },
]

const columns = [
  { label: '规则名称', prop: 'ruleName', minWidth: 180 },
  { label: '规则字段', prop: 'ruleColumn', minWidth: 140 },
  { label: '规则值', prop: 'ruleValue', minWidth: 200, showOverflowTooltip: true },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    btns: [
      {
        content: '编辑',
        type: 'primary',
        handler: handleEdit,
      },
      {
        content: '删除',
        type: 'danger',
        reConfirm: true,
        title: '确认删除当前规则吗？',
        handler: handleDelete,
      },
    ],
  },
]

function handleSearch(form?) {
  baseSearch.pageNo = 1
  baseSearch.ruleName = form?.ruleName || ''
  baseSearch.ruleValue = form?.ruleValue || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}

function handleCreate() {
  dialogRef.value?.open({}, '新增规则')
}

function handleEdit({ row }) {
  dialogRef.value?.open(row, '编辑规则')
}

async function handleDelete({ row }) {
  await deleteMenuRule(row.id)
  init()
}

async function init() {
  const res = await getMenuRuleList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

function open(id: string | number) {
  permissionId.value = String(id)
  baseSearch.permissionId = String(id)
  isShow.value = true
  handleSearch({})
}

defineExpose({
  open,
})
</script>

<template>
  <o-dialog v-model="isShow" title="数据权限规则" width="1000px" fillSlot :showConfirm="false">
    <o-flex direction="column" class="h-100%">
      <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增规则</el-button>
      </g-search-bar>

      <o-table
        class="f-1"
        style="min-height: 0"
        height="100%"
        row-key="id"
        :columns="columns"
        :data="data"
        :total="total"
        :page-size="baseSearch.pageSize"
        :pageNumber="baseSearch.pageNo"
        @update="handleUpdate"
      />
    </o-flex>

    <DataRuleDialog ref="dialogRef" :permissionId="permissionId" @success="init" />
  </o-dialog>
</template>
