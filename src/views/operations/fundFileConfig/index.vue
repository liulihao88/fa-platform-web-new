<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { getFaFilesConfigureList } from '@/api/analysis'
import ConfigDialog from './configDialog.vue'

type FileConfigRecord = {
  id: string
  metaData?: string
  alias?: string
  regionFld?: number | string
  owner?: string
  dataType?: string
  dataFlag?: string
  isSpecialModel?: number
  isSpecialOrg?: number
  isSpecialFile?: number
  dataNameEng?: string
  ifToUse?: number
}

const { proxy } = getCurrentInstance()

const headerRef = ref()
const tableRef = ref()
const dialogRef = ref()
const data = ref<FileConfigRecord[]>([])
const total = ref(0)

const baseSearch = {
  pageNo: 1,
  pageSize: 10,
  metaData: '',
  alias: '',
  owner: '',
}

const items = [
  { label: '标准数据', prop: 'metaData', type: 'input', placeholder: '请输入标准数据' },
  { label: '别名', prop: 'alias', type: 'input', placeholder: '请输入别名' },
  { label: '拥有者', prop: 'owner', type: 'input', placeholder: '请输入拥有者' },
]

const columns = [
  { label: '标准数据', prop: 'metaData', minWidth: 180 },
  { label: '别名', prop: 'alias', minWidth: 220, showOverflowTooltip: true },
  { label: '区域字段', prop: 'regionFld', width: 100, align: 'center' },
  { label: '拥有者', prop: 'owner', width: 100 },
  { label: '数据类型', prop: 'dataType', width: 100 },
  { label: '标志位', prop: 'dataFlag', width: 100 },
  { label: '特定类型', prop: 'isSpecialModel', width: 100, align: 'center', useSlot: true },
  { label: '特定银行', prop: 'isSpecialOrg', width: 100, align: 'center', useSlot: true },
  { label: '特定文件', prop: 'isSpecialFile', width: 100, align: 'center', useSlot: true },
  { label: '字段名称', prop: 'dataNameEng', width: 160 },
  { label: '启用标志', prop: 'ifToUse', width: 100, align: 'center', useSlot: true },
  {
    key: 'operation',
    label: '操作',
    width: 100,
    fixed: 'right',
    btns: [
      {
        handler: handleEdit,
        ...proxy.EDIT_ATTRS,
      },
    ],
  },
]

function getYesNoTagType(value?: number) {
  return value === 1 ? 'success' : 'danger'
}

function getYesNoText(value?: number) {
  return value === 1 ? '是' : '否'
}

function handleAdd() {
  dialogRef.value?.open({}, '新增配置')
}

function handleEdit(row: FileConfigRecord) {
  dialogRef.value?.open(row, '编辑别名')
}

function handleSearch(form) {
  baseSearch.pageNo = 1
  baseSearch.metaData = form?.metaData || ''
  baseSearch.alias = form?.alias || ''
  baseSearch.owner = form?.owner || ''
  init()
}

function handleUpdate(pageNo, pageSize) {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  init()
}

async function init() {
  const res = await getFaFilesConfigureList(baseSearch)
  data.value = res?.records || []
  total.value = res?.total || 0
}

init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef">
      <o-flex class="w-100% mb2" justify="space-between" align="center" gap="12">
        <g-search-bar :items="items" :itemsPerRow="4" class="f-1" @search="handleSearch" @reset="handleSearch">
          <o-button type="primary" @click="handleAdd">新增配置</o-button>
        </g-search-bar>
      </o-flex>
    </div>

    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :page-size="baseSearch.pageSize"
      row-key="id"
      @update="handleUpdate"
    >
      <template #isSpecialModel="{ value }">
        <o-tag>{{ value }}</o-tag>
      </template>
      <template #isSpecialOrg="{ value }">
        <o-tag :type="getYesNoTagType(value)">{{ getYesNoText(value) }}</o-tag>
      </template>
      <template #isSpecialFile="{ value }">
        <o-tag :type="getYesNoTagType(value)">{{ getYesNoText(value) }}</o-tag>
      </template>
      <template #ifToUse="{ value }">
        <o-tag :type="getYesNoTagType(value)">{{ getYesNoText(value) }}</o-tag>
      </template>
    </o-table>

    <config-dialog ref="dialogRef" @success="init" />
  </div>
</template>

<style scoped lang="scss"></style>
