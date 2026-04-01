<script lang="ts">
const UPLOAD = 'UPLOAD'
const STANDARD_VIEW = 'STANDARD_VIEW'
const REPEATE_VIEW = 'REPEATE_VIEW'
</script>
<script setup lang="ts">
import { ref, getCurrentInstance, computed } from 'vue'
import { getCaseInfoById, getCommonDictionary } from '@/api/analysis.ts'
import UploadTable from '@/views/fund/cases/uploadTable/index.vue'
import StandardDataView from '@/views/fund/cases/standardDataView/index.vue'
import RepeatDataView from '@/views/fund/cases/repeatDataView/index.vue'
import { $toast, formatTime } from '@oeos-components/utils'
import { useRouter, useRoute } from 'vue-router'
import { useCommonHook } from '@/store'

const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()

const router = useRouter()
const route = useRoute()
const caseId = route.query.caseId
const caseDetails: any = ref({})
const caseStatusOptions: any = ref(getDictItems('fa_case_process_status') ?? [])

const init = async () => {
  Promise.allSettled([getCaseInfoById({ caseId: caseId }), getCommonDictionary('fa_case_process_status')]).then(
    (results) =>
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          if (idx === 0) {
            caseDetails.value = result.value
          }
          if (idx === 1) {
            caseStatusOptions.value = result.value
          }
        }
      }),
  )
}
init()

const descOptions = computed(() => {
  return [
    {
      label: '案件名称',
      value: caseDetails.value.caseName,
      attrs: {
        width: '150px',
      },
    },
    {
      label: '部门受案号',
      value: caseDetails.value.invoiceCount,
      attrs: {
        width: '150px',
      },
    },
    {
      label: '受理日期',
      value: caseDetails.value.acceptTime,
      attrs: {
        width: '100px',
      },
      filter: (val) => formatTime(val, '{y}/{m}/{d}'),
    },
    {
      label: '案由',
      value: caseDetails.value.caseReason,
    },
  ]
})

const currentTab = ref(UPLOAD)
const tabsOptions = [
  {
    label: '上传文件',
    value: UPLOAD,
  },
  {
    label: '标准数据查看',
    value: STANDARD_VIEW,
  },
  {
    label: '重复数据查看',
    value: REPEATE_VIEW,
  },
]

const activeStatus = computed(() => {
  return (
    caseStatusOptions.value.findIndex((v, i) => {
      return v.value === caseDetails.value.fileProcessStatus
    }) + 1
  )
})
</script>

<template>
  <div class="h-100%">
    <o-basic-layout class="h-100%">
      <div>
        <o-descriptions :options="descOptions" :column="4" />
        <!-- 'wait' | 'process' | 'finish' | 'error' | 'success' -->
        <el-steps :active="activeStatus" simple finish-status="finish" process-status="finish" class="mtb2">
          <el-step v-for="(v, i) in caseStatusOptions" :key="v.value" :title="v.label">
            <template #title>{{ Number(i) + 1 }} {{ v.label }}</template>
            <template #icon />
          </el-step>
        </el-steps>
      </div>

      <o-tabs v-model="currentTab" :options="tabsOptions" size="small">
        <template #[UPLOAD]>
          <UploadTable />
        </template>
        <template #[STANDARD_VIEW]>
          <StandardDataView />
        </template>
        <template #[REPEATE_VIEW]>
          <RepeatDataView />
        </template>
      </o-tabs>
      <!-- <UploadTable v-if="currentTab === UPLOAD" /> -->
      <!-- <StandardDataView v-if="currentTab === STANDARD_VIEW" /> -->
    </o-basic-layout>
  </div>
</template>
