<script setup lang="ts">
import { ref } from 'vue'
import { $toast, isEmpty } from '@oeos-components/utils'
import { faOrgsConfigureAllList } from '@/api/analysis.ts'
import { useGlobalTablePageSize } from '@/hooks'
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const emits = defineEmits(['success'])

const isShow = ref(false)
const total = ref(0)
const selectedOrgCode = ref('')
const selectedRow = ref<Record<string, any> | null>(null)

const originBaseSearch = {
  pageNo: 1,
  pageSize: 10,
  orgName: '',
}
const baseSearch = ref({ ...originBaseSearch })
syncPageSize(baseSearch.value)

const indexMethod = (index) => {
  // 如果当前页是最后一页（数据量不足 pageSize），则基于实际数据量计算
  return (baseSearch.value.pageNo - 1) * baseSearch.value.pageSize + index + 1
}

const items = [
  {
    label: '机构名称',
    prop: 'orgName',
    type: 'input',
  },
]

const columns = [
  {
    type: 'index',
    width: 70,
    label: '序号',
    index: indexMethod,
  },
  {
    label: '机构名称',
    prop: 'orgName',
  },
  {
    label: '别名',
    prop: 'alias',
  },
]

const data = ref([])

const init = async () => {
  const res = await faOrgsConfigureAllList(baseSearch.value)
  data.value = res.records
  total.value = res.total
  selectedRow.value =
    data.value.find((item) => item.orgCd === selectedOrgCode.value || item.id === selectedOrgCode.value) || null
}
const handleSearch = (form) => {
  baseSearch.value.orgName = form?.orgName
  init()
}

const update = async (no, size) => {
  console.log(`47 no`, no)
  baseSearch.value.pageNo = no
  updatePageSize(baseSearch.value, size)
  init()
}

const open = async (sendOrgId = '') => {
  const currentPageSize = baseSearch.value.pageSize
  Object.assign(baseSearch.value, originBaseSearch, {
    pageSize: currentPageSize,
  })
  selectedOrgCode.value = sendOrgId
  selectedRow.value = null
  init()
  isShow.value = true
}

const confirm = async () => {
  const orgId = selectedRow.value?.id || selectedOrgCode.value
  if (isEmpty(orgId)) {
    return $toast('必须选择一个所属银行/支付公司', 'e')
  }
  isShow.value = false
  emits('success', orgId)
}

defineExpose({
  open,
})
</script>

<template>
  <div>
    <o-dialog
      ref="dialogRef"
      v-model="isShow"
      title="银行机构选择"
      width="1000"
      :enableConfirm="false"
      fillSlot
      :confirm="confirm"
    >
      <o-flex direction="column" class="h-100%">
        <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
        <o-table
          v-model="selectedRow"
          selection-type="single"
          class="f-1"
          style="min-height: 0"
          size="small"
          :columns="columns"
          :data="data"
          :total="total"
          height="100%"
          row-key="id"
          :page-size="baseSearch.pageSize"
          :pageNumber="baseSearch.pageNo"
          :showIndex="false"
          @update="update"
        />
      </o-flex>
    </o-dialog>
  </div>
</template>
