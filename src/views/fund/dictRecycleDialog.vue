<script setup lang="ts">
import {
  getAllRecycleList,
  backDict,
  deleteDictPermanently,
  deleteBatchDictPermanently,
  backBatchDict,
} from '@/api/analysis'
import { ref, getCurrentInstance, useTemplateRef } from 'vue'
import { useRelativeHeight } from '@/hooks'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['refresh'])
const isShow = ref(false)
const dialogBodyRef = useTemplateRef('dialogBodyRef')
const tableSectionRef = useTemplateRef('tableSectionRef')
const { height: tableHeight } = useRelativeHeight(tableSectionRef, dialogBodyRef, { minHeight: 220, offset: 12 })
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
    label: '操作',
    prop: 'action',
    fixed: 'right',
    btns: [
      {
        content: '取回',
        type: 'primary',
        title: '确认取回吗？',
        reConfirm: !proxy.$dev,
        handler: async (value, row) => {
          await backDict(value.id)
          handleSearch()
          emits('refresh')
        },
      },
      {
        content: '彻底删除',
        type: 'danger',
        title: '确认彻底删除吗？',
        reConfirm: !proxy.$dev,
        handler: async (value, row) => {
          await deleteDictPermanently(value.id)
          handleSearch()
          emits('refresh')
        },
      },
    ],
  },
]

const data = ref([])
const selectIds = ref([])
const btns = [
  {
    content: '批量取回',
    type: 'primary',
    reConfirm: !proxy.$dev,
    handler: async () => {
      const ids = selectIds.value.join(',')
      await backBatchDict(ids)
      handleSearch()
      emits('refresh')
    },
    isShow: () => selectIds.value.length > 0,
  },
  {
    content: '批量删除',
    type: 'danger',
    reConfirm: !proxy.$dev,
    handler: async () => {
      const ids = selectIds.value.join(',')
      await deleteBatchDictPermanently(ids)
      handleSearch()
    },
    isShow: () => selectIds.value.length > 0,
  },
]
const handleSelectionChange = (val) => {
  selectIds.value = val.map((item) => item.id)
}
const handleSearch = async () => {
  const res = await getAllRecycleList()
  if (res.code === 0) {
    data.value = res.result
  }
}

const open = async () => {
  isShow.value = true
  handleSearch()
}
defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" title="字典回收站" width="800px" :showConfirm="false">
    <div ref="dialogBodyRef" class="dict-recycle-dialog">
      <g-more-button :btns="btns" mode="opt" trigger="hover" class="mb-2" />
      <div ref="tableSectionRef" class="dict-recycle-dialog__table">
        <o-table
          ref="tableRef"
          :height="tableHeight"
          :columns="columns"
          :data="data"
          :showPage="false"
          :showIndex="false"
          @selection-change="handleSelectionChange"
        />
      </div>
    </div>
  </o-dialog>
</template>

<style lang="scss" scoped>
.dict-recycle-dialog {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dict-recycle-dialog__table {
  min-height: 0;
}
</style>
