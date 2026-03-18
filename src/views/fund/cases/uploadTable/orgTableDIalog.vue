<script setup lang="ts">
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { $toast, notEmpty, isEmpty } from '@oeos-components/utils'
import { faOrgsConfigureAllList } from '@/api/analysis.ts'

const emits = defineEmits(['success'])

const isShow = ref(false)
const pageNo = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orgId = ref('')
const selectRow = ref({})
const tableRef = ref(null)

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
  let sendParams = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
  }
  const res = await faOrgsConfigureAllList(sendParams)
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
  if (data.value.length === 0) {
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

const open = async (sendOrgId = '') => {
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
    <o-dialog ref="dialogRef" v-model="isShow" title="银行机构选择" width="1000" @confirm="confirm">
      {{ orgId }}
      <o-table
        ref="tableRef"
        size="small"
        :columns="columns"
        :data="data"
        :total="total"
        highlight-current-row
        :showIndex="false"
        @current-change="handleCurrentChange"
      >
        <template #radio="{ value, row }">
          <div class="f-ct-ct w-100%">
            <el-radio v-model="selectRow.id" :value="row.id" />
          </div>
        </template>
      </o-table>
    </o-dialog>
  </div>
</template>
