<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'

import { casefileFileConfigData } from '@/api/analysis'

const { proxy } = getCurrentInstance()
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const props = defineProps({
  orgCode: {
    type: String,
    required: true,
  },
  pageId: {
    type: String,
    required: true,
  },
})

const data = ref([])
const editRow = (row) => {}
const columns = [
  {
    label: '名字',
    prop: 'name',
  },
  {
    key: 'operation',
    label: '操作',
    btns: [
      {
        content: '编辑',
        comp: 'o-icon',
        attrs: {
          name: 'edit',
          type: 'svg',
          content: '编辑',
        },
      },
    ],
  },
]

const init = async () => {
  let sendParams = {
    pageId: props.pageId,
    orgCode: props.orgCode,
  }
  let res = await casefileFileConfigData(sendParams)
  data.value = res
}

defineExpose({
  init,
})
</script>

<template>
  <div>
    <o-table ref="tableRef" :columns="columns" :data="data" :showPage="false" />
  </div>
</template>
