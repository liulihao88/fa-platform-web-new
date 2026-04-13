<script setup lang="ts">
import dictItemDialog from './dictItemDialog.vue'
import { getDictItemList, deleteDictItem } from '@/api/analysis'
import { ref, getCurrentInstance, watch } from 'vue'
import { useGlobalTablePageSize } from '@/hooks'
import { useCommonHook } from '@/store'
const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()

const { syncPageSize, updatePageSize } = useGlobalTablePageSize()
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
syncPageSize(baseSearch)
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
    icon: 'el-icon-plus',
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
    label: '状态',
    prop: 'status',
    width: 100,
    align: 'center',
    filter: (value) => {
      console.log(`56 value`, value)
      console.log(`53 getDictItems('dict_item_status')`, getDictItems('dict_item_status'))
      return getDictItems('dict_item_status')?.find((item) => item.value == value)?.label
    },
  },
  {
    label: '字典颜色',
    prop: 'itemColor',
    useSlot: true,
  },
  {
    label: '操作',
    prop: 'action',
    fixed: 'right',
    btns: [
      {
        handler: async (value, row) => {
          edit(value)
        },
        ...proxy.setEditAttrs(),
      },
      {
        ...proxy.setDeleteAttrs(),
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
  dictItemDialogRef.value.open(row, row.id ? '编辑' : '新增')
}
const handleSearch = (form) => {
  baseSearch.itemText = form?.itemText
  baseSearch.status = form?.status
  baseSearch.dictId = dictId.value
  init()
}
const handleUpdate = (pageNo, pageSize) => {
  baseSearch.pageNo = pageNo
  updatePageSize(baseSearch, pageSize)
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
  <o-dialog
    ref="dialogRef"
    v-model="isShow"
    title="字典列表"
    size="800"
    fillSlot
    :showConfirm="false"
    width="1000"
    :enableConfirm="false"
  >
    <o-flex direction="column" class="h-100%">
      <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch" />
      <g-more-button :btns="btns" mode="opt" trigger="hover" class="mb-2" :showNum="1" />
      <o-table
        ref="tableRef"
        class="f-1"
        style="min-height: 0"
        height="100%"
        :columns="columns"
        :data="data"
        :page-size="baseSearch.pageSize"
        :pageNumber="baseSearch.pageNo"
        @update="handleUpdate"
      >
        <template #itemColor="{ row }">
          <g-color-picker v-model="row.itemColor" mode="view" />
        </template>
      </o-table>
      <dictItemDialog ref="dictItemDialogRef" @success="handleSearch" />
    </o-flex>
  </o-dialog>
</template>
