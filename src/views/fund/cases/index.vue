<script lang="ts">
const UPLOAD = 'UPLOAD'
const STANDARD_VIEW = 'STANDARD_VIEW'
const REPEATE_VIEW = 'REPEATE_VIEW'
</script>
<script setup lang="ts">
import { ref, getCurrentInstance, computed, onMounted, watch } from 'vue'
import { getCaseInfoById, getCommonDictionary } from '@/api/analysis.ts'
import UploadTable from '@/views/fund/cases/uploadTable/index.vue'
import StandardDataView from '@/views/fund/cases/standardDataView/index.vue'
import RepeatDataView from '@/views/fund/cases/repeatDataView/index.vue'
import { $toast, formatTime } from '@oeos-components/utils'
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router'
import { useCommonHook } from '@/store'

const { getDictItems } = useCommonHook()
const { proxy } = getCurrentInstance()

const router = useRouter()
const route = useRoute()
const caseId = route.query.caseId
const ACTIVE_TAB_CACHE_PREFIX = 'cases:active-tab:'
const routeCacheKey = `${ACTIVE_TAB_CACHE_PREFIX}${route.fullPath}`
const caseDetails: any = ref({})
const caseStatusOptions: any = ref(getDictItems('fa_case_process_status') ?? [])

const init = async () => {
  Promise.allSettled([getCaseInfoById({ caseId: caseId })]).then((results) =>
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        if (idx === 0) {
          caseDetails.value = result.value
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

onMounted(() => {
  const cachedTab = window.localStorage.getItem(routeCacheKey)
  if (tabsOptions.some((item) => item.value === cachedTab)) {
    currentTab.value = cachedTab
  }
})

watch(currentTab, () => {
  window.localStorage.setItem(routeCacheKey, currentTab.value)
})

onBeforeRouteLeave(() => {
  window.localStorage.removeItem(routeCacheKey)
})
</script>

<template>
  <div class="case-page h-100%">
    <o-basic-layout class="h-100%">
      <div class="case-page__header">
        <o-descriptions :options="descOptions" :column="4" />
      </div>

      <div class="case-page__nav">
        <div class="case-page__tabs" role="tablist" aria-label="案件数据页签">
          <button
            v-for="tab in tabsOptions"
            :key="tab.value"
            :class="['case-page__tab', { 'case-page__tab--active': currentTab === tab.value }]"
            type="button"
            role="tab"
            :aria-selected="currentTab === tab.value"
            @click="currentTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="case-page__steps-scroll">
          <el-steps
            :active="activeStatus"
            simple
            finish-status="finish"
            process-status="finish"
            class="case-page__steps"
            size="small"
          >
            <el-step v-for="(v, i) in caseStatusOptions" :key="v.value" :title="v.label">
              <template #title>{{ Number(i) + 1 }} {{ v.label }}</template>
              <template #icon />
            </el-step>
          </el-steps>
        </div>
      </div>

      <div v-if="currentTab === UPLOAD" class="case-page__content">
        <UploadTable />
      </div>
      <div v-else-if="currentTab === STANDARD_VIEW" class="case-page__content">
        <StandardDataView />
      </div>
      <div v-else class="case-page__content">
        <RepeatDataView />
      </div>
    </o-basic-layout>
  </div>
</template>

<style scoped lang="scss">
.case-page {
  height: 100%;
}

:deep(.o-basic-layout__body) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.case-page__header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.case-page__nav {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  min-width: 0;
  margin-bottom: 12px;
}

.case-page__tabs {
  display: flex;
  flex: 0 1 auto;
  align-items: stretch;
  border-bottom: 1px solid var(--el-border-color-light);
}

.case-page__tab {
  position: relative;
  padding: 8px 10px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.case-page__tab:hover,
.case-page__tab--active {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
}

.case-page__steps-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto hidden;
}

.case-page__steps {
  width: 100%;
  min-width: 0;
}

.case-page__steps :deep(.el-step.is-simple) {
  flex: 1 1 0;
  min-width: 0;
  padding: 0 2px;
}

.case-page__steps :deep(.el-step__title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-page__steps :deep(.el-step.is-simple .el-step__arrow) {
  margin: 0;
  transform: scale(0.72);
  transform-origin: center;
}

.case-page__steps :deep(.el-step__main) {
  min-width: 0;
}

.case-page__content {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

@media (width <= 1440px) {
  .case-page__tab {
    padding: 8px;
  }

  .case-page__steps :deep(.el-step.is-simple) {
    padding: 0 1px;
  }
}

@media (width <= 1200px) {
  .case-page__tab {
    padding: 6px;
  }

  .case-page__steps :deep(.el-step.is-simple) {
    padding: 0;
  }
}

:deep(.el-steps--simple) {
  padding: 6px 2px;
}

:deep(.el-step__title) {
  min-width: 100px;
}
</style>
