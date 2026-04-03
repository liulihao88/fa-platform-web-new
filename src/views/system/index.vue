<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
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
const { setCommonItems } = useCommonHook()
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
const selectIds = ref([])
const { proxy } = getCurrentInstance()
const headerRef = ref()
const handleSearch = (form) => {
  baseSearch.dictName = form?.dictName
  baseSearch.dictCode = form?.dictCode
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
const data = ref([])
const total = ref(0)

const columns = [
  {
    type: 'selection',
  },
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
        handler: editRow,
        ...proxy.EDIT_ATTRS,
      },
      {
        content: '字典配置',
        handler: (value, row) => {
          dictDetailDrawerRef.value.open(value)
        },
      },
      {
        handler: (value, row) => {
          deleteDict({ id: value.id }).then((res) => {
            init()
          })
        },
        ...proxy.getDeleteAttrs(),
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
    selections: selectIds.value.length > 0 ? selectIds.value.join(',') : '',
    column: 'createTime',
    order: 'desc',
  }
  let res = await exportDict(params)
}
/**
 * 选中
 */
const handleSelectionChange = (val) => {
  console.log(val)
  selectIds.value = val.map((item) => item.id)
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

const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  handleSearch({})
}
const moreBtns = [
  {
    content: '新增',
    type: 'primary',
    icon: 'el-icon-plus',
    handler: () => editRow({}),
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
    handler: async () => {
      const ids = selectIds.value.join(',')
      await deleteBatchDict(ids)
      handleSearch({})
    },
    isShow: () => selectIds.value.length > 0,
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
        <g-more-button :btns="moreBtns" mode="opt" trigger="hover" />
      </g-search-bar>
    </div>
    <o-table
      ref="tableRef"
      :height="$tableHeight.value"
      :columns="columns"
      :data="data"
      :total="total"
      :showIndex="false"
      :page-size="30"
      @selection-change="handleSelectionChange"
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
