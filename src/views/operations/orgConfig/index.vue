<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { getFaOrgsConfigureList } from '@/api/analysis'
import OrgDialog from './orgDialog.vue'
import { useTablePagination } from '@/hooks'

type OrgRecord = {
  id: string
  orgName?: string
  names?: string
  alias?: string
  commonts?: string
  orgType?: number | string
}

const { proxy } = getCurrentInstance()

const headerRef = ref()
const dialogRef = ref()
const data = ref<OrgRecord[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  orgName: '',
}

const items = [{ label: '机构名称', prop: 'orgName', type: 'input', placeholder: '请输入机构名称' }]

const columns = [
  { label: '机构官方名称', prop: 'orgName', minWidth: 220, useSlot: true },
  { label: '通常叫法', prop: 'names', minWidth: 180 },
  { label: '别名', prop: 'alias', minWidth: 180, showOverflowTooltip: true },
  { label: '注释', prop: 'commonts', minWidth: 220, showOverflowTooltip: true },
  { label: '种类', prop: 'orgType', width: 100, align: 'center', useSlot: true },
  {
    key: 'operation',
    label: '操作',
    fixed: 'right',
    btns: [
      {
        handler: handleEdit,
        ...proxy.setEditAttrs(),
      },
    ],
  },
]

function getOrgTypeText(value?: number | string) {
  if (value === 1 || value === '1') return '银行'
  if (value === 2 || value === '2') return '非银行'
  return value || '-'
}

function getOrgTypeTag(value?: number | string) {
  if (value === 1 || value === '1') return 'success'
  if (value === 2 || value === '2') return 'warning'
  return 'info'
}

function handleAdd() {
  dialogRef.value?.open({}, '新增机构')
}

function handleEdit({ row }: { row: OrgRecord }) {
  dialogRef.value?.open(row, '编辑机构')
}

function handleDetail(row: OrgRecord) {
  dialogRef.value?.open(row, '机构详情')
}

function handleSearch(form) {
  baseSearch.pageNo = 1
  baseSearch.orgName = form?.orgName || ''
  init()
}

async function init() {
  const res = await getFaOrgsConfigureList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

const { handlePageUpdate: handleUpdate } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.pageNo = pageNo
  return init()
})

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">
      <o-flex class="w-100% mb2" justify="space-between" align="center" gap="12">
        <g-search-bar :items="items" :itemsPerRow="3" class="f-1" @search="handleSearch" @reset="handleSearch">
          <o-button type="primary" icon="el-icon-plus" @click="handleAdd">新增机构</o-button>
        </g-search-bar>
      </o-flex>
    </div>

    <o-table
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :pageNumber="baseSearch.pageNo"
      row-key="id"
      @update="handleUpdate"
    >
      <template #orgName="{ row }">
        <el-button type="text" @click="handleDetail(row)">{{ row.orgName || '-' }}</el-button>
      </template>
      <template #orgType="{ value }">
        <o-tag :type="getOrgTypeTag(value)">{{ getOrgTypeText(value) }}</o-tag>
      </template>
    </o-table>

    <org-dialog ref="dialogRef" @success="init" />
  </div>
</template>

<style scoped lang="scss"></style>
