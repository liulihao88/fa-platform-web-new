<script setup lang="ts">
import { getAllRecycleList } from '@/api/analysis'
import { ref } from 'vue'
const baseSearch = {
  pageNo: 1,
  pageSize: 30,
}
const isShow = ref(false)
const dialogRef = ref()
const tableRef = ref()
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
    width: 200,
    fixed: 'right',
    btns: [
      {
        content: '取回',
      },
      {
        content: '彻底删除',
      },
    ],
  },
]
const data = ref([])
const total = ref(0)
const handleSelectionChange = (val) => {
  data.value = val
}
const handleSearch = async () => {
  const res = await getAllRecycleList()
  console.log(res)

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
    <o-table
      ref="tableRef"
      height="300px"
      :columns="columns"
      :data="data"
      :showPage="false"
      :showIndex="false"
      @selection-change="handleSelectionChange"
    ></o-table>
  </o-dialog>
</template>

<style lang="scss" scoped></style>
