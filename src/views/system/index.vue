<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import addDictDialog from '../fund/addDictDialog.vue'
import dictRecycleDialog from '../fund/dictRecycleDialog.vue'
import {
  getDictLits,
  refreshDict,
  getAllDictItems,
  resumeQuartzJob,
  pauseQuartzJob,
  deleteDict,
  runQuartzJob,
  refreshDragCache,
} from '@/api/analysis'
import { getType, $toast } from '@oeos-components/utils'
import { exportDict } from '@/api/analysis'
import { uploadFile } from '@/utils/request'
// import { removeAuthCache, setAuthCache } from '@/utils/auth';
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
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
  },
  {
    label: '字典编码',
    prop: 'dictCode',
  },
  {
    label: '描述',
    prop: 'description',
  },
  {
    key: 'operation',
    label: '操作',
    width: 240,
    btns: [
      {
        content: '编辑',
        handler: editRow,
      },
      {
        content: '字典配置',
      },
      {
        content: '删除',
        type: 'danger',
        handler: (value, row) => {
          proxy.confirm('确定删除吗?').then(() => {
            deleteDict({ id: value.id }).then((res) => {
              if (res?.code == 200) {
                $toast.success('操作成功')
                init()
              }
            })
          })
        },
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
  // const result = await refreshDict()
  // const dragRes = await refreshDragCache()
  // console.log('dragRes', dragRes)
  // console.log('result', result)
  // if (result.success) {
  //   const res = await getAllDictItems();
  //   const DB_DICT_DATA_KEY = 'UI_CACHE_DB_DICT_DATA';
  //   removeAuthCache(DB_DICT_DATA_KEY);
  //   setAuthCache(DB_DICT_DATA_KEY, res.result);
  //   // update-begin--author:liaozhiyang---date:20240124---for：【QQYUN-7970】国际化
  //   $toast.success('刷新缓存成功')
  //   // update-end--author:liaozhiyang---date:20240124---for：【QQYUN-7970】国际化
  //   // update-begin--author:wangshuai---date:20241112---for：【issues/7433】vue3 数据字典优化建议
  //   userStore.setAllDictItems(res.result);
  //   // update-end--author:wangshuai---date:20241112---for：【issues/7433】vue3 数据字典优化建议
  // } else {
  // }
}

const recycleBin = async () => {
  dictRecycleDialogRef.value.open()
}

const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  handleSearch({})
}
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
    <div ref="headerRef">
      <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
      <div class="mb-2">
        <el-button type="primary" icon="el-icon-plus" @click="editRow({})">新增</el-button>
        <el-button type="primary" icon="el-icon-upload" @click="onImportXls">导入</el-button>
        <el-button type="primary" icon="el-icon-download" @click="onExportXls">导出</el-button>
        <el-button type="primary" icon="el-icon-refresh" @click="refreshCache">刷新缓存</el-button>
        <el-button type="primary" icon="el-icon-folder-delete" @click="recycleBin">回收站</el-button>
      </div>
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
    <dictRecycleDialog ref="dictRecycleDialogRef" @success="init" />
  </div>
</template>
