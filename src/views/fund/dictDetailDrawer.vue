<script setup lang="ts">
import dictItemDialog from './dictItemDialog.vue'
import { getDictItemList, deleteDictItem } from '@/api/analysis'
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
const emits = defineEmits(['refresh'])
const total = ref(0)
const isShow = ref(false)
const dictId = ref('')
const baseSearch = {
  pageNo: 1,
  pageSize: 30,
  dictId: dictId.value,
  itemText: '',
  status: '',
}
const items = [
  {
    label: '名称',
    prop: 'itemText',
    type: 'input',
    placeholder: '请输入名称',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择状态',
    dict: 'dict_item_status',
  },
]
const btns = [
  {
    content: '新增',
    type: 'primary',
    handler: async () => {
      edit({ dictId: dictId.value })
    },
  },
]
const columns = [
  {
    label: '名称',
    prop: 'itemText',
  },
  {
    label: '数据值',
    prop: 'itemValue',
  },
  {
    label: '字典颜色',
    prop: 'itemColor',
    useSlot: true,
  },
  {
    label: '操作',
    prop: 'action',
    width: 200,
    fixed: 'right',
    btns: [
      {
        content: '编辑',
        type: 'primary',
        handler: async (value, row) => {
          edit(value)
        },
      },
      {
        content: '删除',
        type: 'danger',
        reConfirm: !proxy.$dev,
        handler: async (value, row) => {
          await deleteDictItem(value.id)
          handleSearch({})
          emits('refresh')
        },
      },
    ],
  },
]
const data = ref([])
const dictItemDialogRef = ref(null)
const edit = (row) => {
  dictItemDialogRef.value.open(row, row.dictId ? '编辑' : '新增')
}
const handleSearch = (form) => {
  baseSearch.itemText = form?.itemText
  baseSearch.status = form?.status
  baseSearch.dictId = dictId.value
  init()
}
const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  baseSearch.pageSize = pageSize
  handleSearch({})
}
const init = async () => {
  const res = await getDictItemList(baseSearch)
  data.value = res?.records
  total.value = res?.total
}

const open = async (value) => {
  isShow.value = true
  dictId.value = value.id
  handleSearch({})
}
defineExpose({
  open,
})
</script>

<template>
  <o-dialog ref="dialogRef" v-model="isShow" type="drawer" title="字典列表" size="800" :showConfirm="false">
    <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
    <g-more-button :btns="btns" mode="opt" trigger="hover" class="mb-2" :showNum="1"></g-more-button>
    <o-table ref="tableRef" height="300px" :columns="columns" :data="data" :showIndex="false" @update="handleUpdate">
      <template #itemColor="{ row }">
        <g-color-picker mode="view" v-model="row.itemColor" />
      </template>
    </o-table>
    <dictItemDialog ref="dictItemDialogRef" @success="handleSearch" />
  </o-dialog>
</template>

<style lang="scss" scoped></style>
