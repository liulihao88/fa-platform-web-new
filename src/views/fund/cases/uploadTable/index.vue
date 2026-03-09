<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getCasefileList } from '@/api/analysis.ts'
import { getStorage } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()

const total = ref(0)
const data = ref([])
const init = async () => {
  let params = {
    pageNo: 1,
    pageSize: 10,
    caseId: getStorage('caseId'),
    folder: '',
    fileName: '',
  }
  let res = await getCasefileList(params)
  data.value = res.records ?? []
  total.value = res.total
}
init()

const editRow = (row) => {}
const columns = [
  {
    label: '源文件',
    prop: 'sourceFile',
  },
  {
    label: '文件夹',
    prop: 'folder',
  },
  {
    label: '状态',
    prop: 'status',
  },
  {
    key: 'operation',
    label: '操作',
    width: 200,
    btns: [
      {
        content: '字段映射',
        handler: textRow,
      },
      {
        content: '转换查看',
        handler: translateRow,
      },
      {
        content: '删除',
        handler: deleteRow,
        comp: 'o-icon',
        attrs: {
          name: 'delete',
          type: 'svg',
          content: '删除',
        },
      },
    ],
  },
]

function translateRow(row) {
  console.log(`37 row`, row)
}
function textRow(row) {
  console.log(`97 row`, row)
}

function deleteRow(row) {
  console.log(`46 row`, row)
}
</script>

<template>
  <o-table ref="tableRef" :columns="columns" :data="data" :total="total" />
</template>
