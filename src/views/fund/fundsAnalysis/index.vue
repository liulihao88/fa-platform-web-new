<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import smartSearch from './smartSearch.vue'
import { ref, getCurrentInstance, reactive } from 'vue'
import { exportTransListData, getCaseInfoById, getTransList } from '@/api/analysis'
import { isEmpty } from '@oeos-components/utils'
const { proxy } = getCurrentInstance()
const route = useRoute()
const detail = reactive<Record<string, any>>({})
const headerRef = ref<HTMLDivElement>()
const columns = [
  { label: '关系', prop: 'operate', type: 'select', dict: 'fa_trans_query_operate' },
  { label: '字段', prop: 'field', type: 'select', dict: 'fa_trans_query_rule_str' },
  { label: '逻辑', prop: 'condition', type: 'select', dict: 'fa_trans_query_rule_nostr' },
  { label: '值', prop: 'value', type: 'input' },
] as any[]

const tableColumns = [
  {
    type: 'selection',
  },
  {
    label: '文件名称',
    prop: '',
    width: 100,
  },
  {
    label: '行号',
    prop: '',
    width: 100,
  },
  {
    label: '机构名称',
    prop: '',
    width: 100,
  },
  {
    label: '客户号',
    prop: '',
    width: 100,
  },
  {
    label: '客户名称',
    prop: '',
    width: 100,
  },
  {
    label: '交易账号',
    prop: '',
    width: 100,
  },
  {
    label: '相关账号',
    prop: '',
    width: 100,
  },
  {
    label: '户名',
    prop: '',
  },
  {
    label: '币种',
    prop: '',
  },
  {
    label: '交易状态',
    prop: '',
  },
  {
    label: '交易方向',
    prop: '',
  },
  {
    label: '交易金额',
    prop: '',
  },
  {
    label: '交易种类',
    prop: '',
  },
  {
    label: '业务日期',
    prop: '',
  },
  {
    label: '交易时间',
    prop: '',
    width: 100,
  },
  {
    label: '金额',
    prop: '',
    width: 100,
  },
  {
    label: '对方机构名称',
    prop: '',
    width: 100,
  },
  {
    label: '对方账号',
    prop: '',
    width: 100,
  },
  {
    label: '对方户名',
    prop: '',
    width: 100,
  },
  {
    label: '操作',
    prop: '',
    width: 220,
    fixed: 'right',
    btns: [
      {
        content: '查看原信息',
        type: 'primary',
        handler: () => {},
      },
      {
        content: '查看详情',
        type: 'primary',
        handler: () => {},
      },
    ],
  },
]
const data = ref([])
const total = ref(0)
const selectIds = ref([])
const conditionJson = ref(null)
const handleSelectionChange = (val) => {
  console.log(val)
  selectIds.value = val.map((item) => item.id)
}
const handleUpdate = (pageNo, pageSize) => {
  baseQuery.value.pageNo = pageNo
  baseQuery.value.pageSize = pageSize
  handleSearch(null)
}
const exportCurrentPage = async () => {
  await exportTransListData({
    caseId,
    conditionJson: conditionJson.value,
    ...baseQuery.value,
  })
}
const exportMarkedData = () => {}
const exportAllData = async () => {
  await exportTransListData({
    caseId,
    conditionJson: conditionJson.value,
    ...baseQuery.value,
    exportAll: true,
  })
}
const showArchiveModal = () => {}
const moreBtns = [
  {
    content: '导出本页数据',
    type: 'primary',
    handler: exportCurrentPage,
  },
  {
    content: '导出选择数据',
    type: 'primary',
    handler: exportMarkedData,
  },
  {
    content: '导出全部数据',
    type: 'primary',
    handler: exportAllData,
  },
  {
    content: '生成卷宗信息',
    type: 'primary',
    handler: showArchiveModal,
  },
]
const caseId = route.query.caseId as string
const getCaseInfo = async () => {
  const res = await getCaseInfoById({ caseId })
  Object.assign(detail, res)
}
const baseQuery = ref({
  pageNo: 1,
  pageSize: 10,
})
const handleSearch = async (params) => {
  console.log(params)
  if (!isEmpty(params)) {
    conditionJson.value = JSON.stringify({ grouproot: params })
  }
  const obj = {
    caseId,
    conditionJson: conditionJson.value,
    ...baseQuery.value,
  }
  const res = await getTransList(obj)
  total.value = res.total
  data.value = res.records
}
getCaseInfo()
proxy.$initTableHeight(headerRef, true)
</script>

<template>
  <div class="h-100%">
    <o-basic-layout class="h-100%">
      <div ref="headerRef" class="mb-2">
        <el-descriptions :column="4" border>
          <el-descriptions-item label="案件名称">{{ detail.caseName }}</el-descriptions-item>
          <el-descriptions-item label="部门受案号">{{ detail.departmentCaseNumber }}</el-descriptions-item>
          <el-descriptions-item label="受理日期">{{ detail.acceptTime }}</el-descriptions-item>
          <el-descriptions-item label="案由">{{ detail.caseReason }}</el-descriptions-item>
        </el-descriptions>
        <smartSearch class="mt-2" :columns="columns" :caseId="caseId" @query="handleSearch" />
        <g-more-button :btns="moreBtns" mode="opt" showNum="4" />
      </div>
      <o-table
        ref="tableRef"
        :height="$tableHeight.value"
        :columns="tableColumns"
        :data="data"
        :total="total"
        :showIndex="false"
        :page-size="30"
        @selection-change="handleSelectionChange"
        @update="handleUpdate"
      ></o-table>
    </o-basic-layout>
  </div>
</template>
