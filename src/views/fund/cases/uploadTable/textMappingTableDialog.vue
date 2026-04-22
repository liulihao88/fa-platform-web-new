<script setup lang="ts">
import { ref, watch } from 'vue'
import { getFileConfigPageList } from '@/api/analysis'
import { useProvideOTablePageSize, useTablePagination } from '@/hooks'
useProvideOTablePageSize()

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
const ORIIGIN_BASE_SAERCH = {
  pageNo: 1,
  pageSize: 10,
  metaData: '',
  orgCode: props.orgCode,
  mappingTitle: props.mappingTitle,
}
const baseSearch = ref({
  ...ORIIGIN_BASE_SAERCH,
})

const items = [
  {
    label: '案件名称',
    prop: 'metaData',
    type: 'input',
  },
]

const editRow = (row) => {}
const selectedRow = ref<Record<string, any> | null>(null)
const oriMetaData = ref('')
const originFieldName = ref('')
const outIdx = ref(-1)

const indexMethod = (index) => {
  // 如果当前页是最后一页（数据量不足 pageSize），则基于实际数据量计算
  return (baseSearch.value.pageNo - 1) * baseSearch.value.pageSize + index + 1
}
const columns = [
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

const reset = () => {
  oriMetaData.value = ''
  selectedRow.value = null
}

async function init() {
  let res = await getFileConfigPageList(baseSearch.value)
  data.value = res.records
  total.value = res.total
  selectedRow.value = data.value.find((item) => item.metaData === oriMetaData.value) || null
}

const { handlePageUpdate: update } = useTablePagination(baseSearch, (pageNo) => {
  baseSearch.value.pageNo = pageNo
  return init()
})

const open = async (sendOriMetaData, idx, titleColName = '') => {
  const currentPageSize = baseSearch.value.pageSize
  Object.assign(baseSearch.value, ORIIGIN_BASE_SAERCH, {
    pageSize: currentPageSize,
    orgCode: props.orgCode,
    mappingTitle: props.mappingTitle,
  })
  oriMetaData.value = sendOriMetaData
  originFieldName.value = titleColName
  isShow.value = true
  outIdx.value = idx
  selectedRow.value = null
  await init()
}

const confirm = async () => {
  emits('success', selectedRow.value?.metaData || oriMetaData.value, outIdx.value)
  isShow.value = false
}

const handleSearch = (form) => {
  baseSearch.value.pageNo = 1
  baseSearch.value.metaData = form?.metaData
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
    fillSlot
    :enableConfirm="false"
    :destroy-on-close="true"
    :confirm="confirm"
  >
    <o-flex direction="column" class="h-100%">
      <g-search-bar :items="items" class="mb2" @search="handleSearch" @reset="handleSearch">
        <o-flex align="center" class="h-100%">
          <span class="origin-field__label">原字段:</span>
          <span class="origin-field__value">{{ originFieldName || '-' }}</span>
          <el-button type="primary" link @click="reset">清除选择</el-button>
        </o-flex>
      </g-search-bar>
      <o-table
        v-model="selectedRow"
        selection-type="single"
        class="f-1"
        style="min-height: 0"
        size="small"
        :columns="columns"
        :data="data"
        :total="total"
        row-key="metaData"
        :showIndex="false"
        height="100%"
        :pageNumber="baseSearch.pageNo"
        @update="update"
      />
    </o-flex>
  </o-dialog>
</template>
