<script setup lang="ts">
import {
  getAllRecycleList,
  backDict,
  deleteDictPermanently,
  deleteBatchDictPermanently,
  backBatchDict,
} from '@/api/analysis'
import { computed, ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['refresh'])
const isShow = ref(false)

async function backRow({ row }) {
  await backDict(row.id)
  handleSearch()
  emits('refresh')
}

async function deleteRow({ row }) {
  await deleteDictPermanently(row.id)
  handleSearch()
  emits('refresh')
}

async function backSelected() {
  const ids = selectIds.value.join(',')
  await backBatchDict(ids)
  clearSelected()
  handleSearch()
  emits('refresh')
}

async function deleteSelected() {
  const ids = selectIds.value.join(',')
  await deleteBatchDictPermanently(ids)
  clearSelected()
  handleSearch()
}
const columns = [
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
    label: '操作',
    prop: 'action',
    fixed: 'right',
    btns: [
      {
        content: '取回',
        type: 'primary',
        title: '确认取回吗？',
        reConfirm: !proxy.$dev,
        handler: backRow,
      },
      {
        content: '彻底删除',
        type: 'danger',
        title: '确认彻底删除吗？',
        ...proxy.setDeleteAttrs(),
        handler: deleteRow,
      },
    ],
  },
]

const data = ref([])
const selectedRows = ref<any[]>([])
const selectIds = computed(() => selectedRows.value.map((item) => item.id))
const btns = [
  {
    content: '批量取回',
    type: 'primary',
    reConfirm: !proxy.$dev,
    handler: backSelected,
    isShow: () => selectIds.value.length > 0,
  },
  {
    content: '批量删除',
    ...proxy.setDeleteAttrs(),
    handler: deleteSelected,
    isShow: () => selectIds.value.length > 0,
  },
]
const clearSelected = () => {
  selectedRows.value = []
}
const handleSearch = async () => {
  const res = await getAllRecycleList()
  if (res.code === 0) {
    data.value = res.result
  }
}

const open = async () => {
  isShow.value = true
  clearSelected()
  handleSearch()
}
defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" title="字典回收站" width="800px" fillSlot :showConfirm="false">
    <o-flex direction="column" class="h-100%">
      <g-more-button :btns="btns" mode="opt" trigger="hover" class="mb-2" />
      <o-table
        v-model="selectedRows"
        selection-type="multiple"
        class="f-1"
        style="min-height: 0"
        height="100%"
        :columns="columns"
        :data="data"
        :showPage="false"
        :showIndex="false"
        row-key="id"
      />
    </o-flex>
  </o-dialog>
</template>
