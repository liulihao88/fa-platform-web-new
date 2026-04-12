<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { getFileConfigPageList } from '@/api/analysis'
import { $toast, notEmpty } from '@oeos-components/utils'
import { useGlobalTablePageSize } from '@/hooks'
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const emits = defineEmits(['success'])

const props = defineProps({
  orgCode: {
    type: String,
    required: true,
  },
  mappingTitle: {
    type: String,
    required: true,
  },
})

const isShow = ref(false)
const total = ref(0)
const data = ref([])
const baseSearch = ref({
  pageNo: 1,
  pageSize: 10,
  metaData: '',
  orgCode: props.orgCode,
  mappingTitle: props.mappingTitle,
})
syncPageSize(baseSearch.value)

const pageNo = ref(1)
const pageSize = ref(baseSearch.value.pageSize)

const items = [
  {
    label: '案件名称',
    prop: 'metaData',
    type: 'input',
  },
]

const editRow = (row) => {}
const tableRef = ref(null)
const selectRow = ref({})
const oriMetaData = ref('')
const originFieldName = ref('')
const outIdx = ref(-1)

const indexMethod = (index) => {
  // 如果当前页是最后一页（数据量不足 pageSize），则基于实际数据量计算
  return (pageNo.value - 1) * pageSize.value + index + 1
}
const columns = [
  {
    prop: 'radio', // 添加radio类型列
    width: 50,
    align: 'center',
    useSlot: true,
  },
  {
    type: 'index',
    width: 70,
    label: '序号',
    index: indexMethod,
  },
  {
    label: '标准数据',
    width: 150,
    prop: 'metaData',
  },
  {
    label: '别名',
    prop: 'alias',
  },
]

const _handleRowClick = () => {
  let clickIdx = -1
  if (data.value.length === 0) {
    reset()
    return
  }
  if (oriMetaData.value) {
    console.log(`42 data.value`, data.value)
    let taskNameIdx = data.value.findIndex((item) => {
      return item.metaData === oriMetaData.value
    })
    clickIdx = taskNameIdx
  }
  console.log(`89 clickIdx`, clickIdx)
  if (clickIdx === -1) {
    selectRow.value = {}
    tableRef.value.$refs.tableRef.setCurrentRow(null)
  } else {
    tableRef.value.$refs.tableRef.setCurrentRow(data.value[clickIdx])
  }
}

const reset = () => {
  oriMetaData.value = ''
  selectRow.value = {}
  tableRef.value.$refs.tableRef.setCurrentRow(null)
}

const init = async () => {
  pageNo.value = baseSearch.value.pageNo
  pageSize.value = baseSearch.value.pageSize
  let res = await getFileConfigPageList(baseSearch.value)
  data.value = res.records
  total.value = res.total
  _handleRowClick()
}

const handleCurrentChange = async (currentRow, oldCurrentRow) => {
  console.log(`86 currentRow`, currentRow)
  if (notEmpty(currentRow)) {
    selectRow.value = currentRow
    oriMetaData.value = currentRow.metaData
  }
}

const open = async (sendOriMetaData, idx, titleColName = '') => {
  oriMetaData.value = sendOriMetaData
  originFieldName.value = titleColName
  isShow.value = true
  outIdx.value = idx
  await init()
}

const confirm = () => {
  console.log(`oriMetaData.value`, oriMetaData.value)
  emits('success', oriMetaData.value, outIdx.value)
  isShow.value = false
}

const handleSearch = (form) => {
  baseSearch.value.metaData = form?.metaData
  init()
}
const update = async (no, size) => {
  console.log(`47 no`, no)
  baseSearch.value.pageNo = no
  updatePageSize(baseSearch.value, size)
  pageNo.value = no
  pageSize.value = baseSearch.value.pageSize
  init()
}

watch(
  () => props.mappingTitle,
  (val) => {
    baseSearch.value.mappingTitle = val
  },
  {
    deep: true,
    immediate: true,
  },
)

defineExpose({
  open,
})
</script>

<template>
  <o-dialog
    ref="dialogRef"
    v-model="isShow"
    title="修改配置列"
    width="1000"
    :enableConfirm="false"
    :destroy-on-close="true"
    @confirm="confirm"
  >
    <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
      <o-flex align="center" class="h-100%">
        <span class="origin-field__label">原字段:</span>
        <span class="origin-field__value">{{ originFieldName || '-' }}</span>
        <el-button type="primary" link @click="reset">清除选择</el-button>
      </o-flex>
    </g-search-bar>
    <o-table
      ref="tableRef"
      size="small"
      :columns="columns"
      :data="data"
      :total="total"
      highlight-current-row
      :showIndex="false"
      height="400"
      :page-size="baseSearch.pageSize"
      :pageNumber="baseSearch.pageNo"
      @current-change="handleCurrentChange"
      @update="update"
    >
      <template #radio="{ value, row }">
        <div class="f-ct-ct w-100%">
          <el-radio v-model="selectRow.id" :value="row.id" />
        </div>
      </template>
    </o-table>
  </o-dialog>
</template>
