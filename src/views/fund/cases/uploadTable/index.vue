<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import CaseUploadFile from '@/views/fund/cases/uploadTable/caseUploadFile.vue'
import TextMapping from '@/views/fund/cases/uploadTable/textMapping.vue'
import { getCasefileList, deleteCasefile } from '@/api/analysis.ts'
import { getStorage } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()

import { useDetail } from '@/hooks'
const { toDetail } = useDetail()

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

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
  // router.push({
  //   path: '/fund/textMapping',
  //   query: {
  //     fileId: row.id,
  //   },
  // })
  toDetail('TextMapping', { fileId: row.id })
}

async function deleteRow(row) {
  await deleteCasefile({ fileId: row.id })
  init()
}
</script>

<template>
  <CaseUploadFile class="mb" @close="init" />
  <o-table ref="tableRef" :columns="columns" :data="data" :total="total" />
</template>
