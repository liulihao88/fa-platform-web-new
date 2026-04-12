<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { $toast, notEmpty, isEmpty } from '@oeos-components/utils'
import { faOrgsConfigureAllList } from '@/api/analysis.ts'
import { useGlobalTablePageSize } from '@/hooks'
const { syncPageSize, updatePageSize } = useGlobalTablePageSize()

const emits = defineEmits(['success'])

const isShow = ref(false)
const total = ref(0)
const orgId = ref('')
const selectRow = ref({})
const tableRef = ref(null)

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
  _handleRowClick()
}

const handleCurrentChange = async (currentRow, oldCurrentRow) => {
  if (notEmpty(currentRow)) {
    selectRow.value = currentRow
    orgId.value = currentRow.id
  }
}

const _handleRowClick = () => {
  if (data.value.length === 0 || isEmpty(orgId.value)) {
    reset()
    return
  }
  if (orgId.value) {
    let taskNameIdx = data.value.findIndex((item) => {
      return item.orgCd === orgId.value
    })
    tableRef.value.$refs.tableRef.setCurrentRow(data.value[taskNameIdx])
  }
}

const reset = () => {
  selectRow.value = {}
  tableRef.value.$refs.tableRef.setCurrentRow(null)
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
  orgId.value = sendOrgId
  init()
  isShow.value = true
}

const confirm = () => {
  if (isEmpty(orgId.value)) {
    return $toast('必须选择一个所属银行/支付公司', 'e')
  }
  isShow.value = false
  emits('success', orgId.value)
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
      fillSlot
      :enableConfirm="false"
      :confirm="confirm"
    >
      <o-flex direction="column" class="h-100%">
        <g-search-bar :items="items" @search="handleSearch" @reset="handleSearch" />
        <o-table
          ref="tableRef"
          class="f-1"
          style="min-height: 0"
          size="small"
          :columns="columns"
          :data="data"
          :total="total"
          height="100%"
          highlight-current-row
          :page-size="baseSearch.pageSize"
          :pageNumber="baseSearch.pageNo"
          :showIndex="false"
          @update="update"
          @current-change="handleCurrentChange"
        >
          <template #radio="{ value, row }">
            <div class="f-ct-ct w-100%">
              <el-radio v-model="selectRow.id" :value="row.id" />
            </div>
          </template>
        </o-table>
      </o-flex>
    </o-dialog>
  </div>
</template>
