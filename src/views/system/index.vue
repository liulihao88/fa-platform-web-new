<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import addDictDialog from '../fund/addDictDialog.vue'
import dictRecycleDialog from '../fund/dictRecycleDialog.vue'
import dictDetailDrawer from '../fund/dictDetailDrawer.vue'
import { getDictLits, deleteDict, refreshDict, refreshDragCache, getAllDictItems } from '@/api/analysis'
import { $toast } from '@oeos-components/utils'
import { exportDict, deleteBatchDict } from '@/api/analysis'
import { uploadFile } from '@/utils/request'
// import { removeAuthCache, setAuthCache } from '@/utils/auth';
import { useUserStore } from '@/store/modules/user'
// const userStore = useUserStore()
import { useCommonHook } from '@/store'
import { useGlobalTablePageSize } from '@/hooks'
const { setCommonItems } = useCommonHook()
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()
const items = [
  {
    label: '字典名称',
    prop: 'dictName',
    type: 'input',
    placeholder: '请输入字典名称',
  },
  {
    label: '字典编码',
    prop: 'dictCode',
    type: 'input',
    placeholder: '请输入字典编码',
  },
]
const dictDetailDrawerRef = ref()
const { proxy } = getCurrentInstance()
const headerRef = ref()
const selectedRows = ref<any[]>([])
const handleSearch = (form) => {
  baseSearch.pageNo = 1
  baseSearch.dictName = form?.dictName || ''
  baseSearch.dictCode = form?.dictCode || ''
  init()
}
const dictDialogRef = ref()
const dictRecycleDialogRef = ref()
const baseSearch = {
  order: 'desc',
  pageNo: 1,
  pageSize: 30,
  column: 'createTime',
  dictName: '',
  dictCode: '',
}
syncPageSize(baseSearch)
const data = ref([])
const total = ref(0)
const selectedCount = computed(() => selectedRows.value.length)

function openDictConfig(row) {
  dictDetailDrawerRef.value.open(row)
}

async function deleteRow(row) {
  await deleteDict({ id: row.id })
  init()
}

const columns = [
  {
    label: '字典名称',
    prop: 'dictName',
    width: 300,
  },
  {
    label: '字典编码',
    prop: 'dictCode',
    width: 300,
  },
  {
    label: '描述',
    prop: 'description',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '字典配置',
        handler: openDictConfig,
      },
      {
        handler: editRow,
        ...proxy.setEditAttrs(),
      },
      {
        handler: deleteRow,
        ...proxy.setDeleteAttrs(),
      },
    ],
  },
]
/**
 * 编辑
 */
function editRow(row) {
  dictDialogRef.value.open(row, row.id ? '编辑字典' : '新增字典')
}

function addRow() {
  editRow({})
}

function clearSelected() {
  selectedRows.value = []
}
/**
 * 导入
 */
const onImportXls = async () => {
  uploadFile({
    url: '/sys/dict/importExcel',
    multiple: false,
    callback: {
      isReturnResponse: true,
      success: (res) => {
        console.log(res)
        init()
      },
    },
  })
}
/**
 * 导出
 */
const onExportXls = async () => {
  const params = {
    selections: selectedCount.value > 0 ? selectedRows.value.map((item) => item.id).join(',') : '',
    column: 'createTime',
    order: 'desc',
  }
  let res = await exportDict(params)
}

const refreshCache = async () => {
  const result = await refreshDict()
  const dragRes = await refreshDragCache()
  console.log('dragRes', dragRes)
  console.log('result', result)
  if (result?.code == 0) {
    const res = await getAllDictItems()
    if (res?.code == 200) {
      setCommonItems('sysAllDictItems', res?.result)
      $toast.success('刷新缓存成功')
    }
  }
}

const recycleBin = async () => {
  dictRecycleDialogRef.value.open()
}

async function deleteBatchRows() {
  const ids = selectedRows.value.map((item) => item.id).join(',')
  await deleteBatchDict(ids)
  clearSelected()
  handleSearch({})
}

const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
  init()
}
const moreBtns = [
  {
    content: '新增',
    type: 'primary',
    icon: 'el-icon-plus',
    handler: addRow,
  },
  {
    content: '导入',
    type: 'primary',
    icon: 'el-icon-upload',
    handler: onImportXls,
  },
  {
    content: '导出',
    type: 'primary',
    icon: 'el-icon-download',
    handler: onExportXls,
  },
  {
    content: '刷新缓存',
    type: 'primary',
    icon: 'el-icon-refresh',
    handler: refreshCache,
  },
  {
    content: '回收站',
    type: 'primary',
    icon: 'el-icon-delete-filled',
    handler: recycleBin,
  },
  {
    content: '批量删除',
    type: 'primary',
    reConfirm: !proxy.$dev,
    icon: 'el-icon-delete',
    handler: deleteBatchRows,
    disabled: () => selectedCount.value === 0,
    isShow: () => selectedCount.value !== 0,
  },
]
const init = async () => {
  let res = await getDictLits(baseSearch)
  data.value = res?.records
  total.value = res?.total
}
init()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div>
    <div ref="headerRef" class="mb2">
      <g-search-bar :items="items" :itemsPerRow="4" @search="handleSearch" @reset="handleSearch">
        <gSelectedCount :count="selectedCount" class="mr" @clear="clearSelected" />
        <g-more-button :btns="moreBtns" mode="opt" trigger="hover" />
      </g-search-bar>
    </div>
    <o-table
      v-model="selectedRows"
      selection-type="multiple"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :showIndex="false"
      :page-size="baseSearch.pageSize"
      :pageNumber="baseSearch.pageNo"
      row-key="id"
      @update="handleUpdate"
    >
      <template #status="{ row }">
        <el-tag :type="row.status == '0' ? 'success' : 'danger'">{{ row.status == '0' ? '正常' : '停止' }}</el-tag>
      </template>
    </o-table>
    <addDictDialog ref="dictDialogRef" @success="init" />
    <dictRecycleDialog ref="dictRecycleDialogRef" @refresh="init" />
    <dictDetailDrawer ref="dictDetailDrawerRef" @refresh="init" />
  </div>
</template>
