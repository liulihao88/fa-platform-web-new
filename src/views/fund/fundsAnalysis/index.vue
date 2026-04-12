<script setup lang="ts">
import { isEqual } from '@/store/utils'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SmartSearchDetail from './smartSearchDetail.vue'
import CaseManage from './caseManage.vue'
import CaseDealSearch from './caseDealSearch.vue'

const route = useRoute()
const multiTagsStore = useMultiTagsStoreHook()
const ACTIVE_TAB_CACHE_PREFIX = 'funds-analysis:active-tab:'
const PAGE_RELOAD_FLAG_PREFIX = 'funds-analysis:page-reload:'
const routePath = route.path
const routeQuery = { ...route.query }
const routeParams = { ...route.params }
const routeCacheKey = `${ACTIVE_TAB_CACHE_PREFIX}${route.fullPath}`
const routeReloadFlagKey = `${PAGE_RELOAD_FLAG_PREFIX}${route.fullPath}`
const activeTab = ref('smartSearchDetail')

const tabs = [
  { label: '智能筛查', value: 'smartSearchDetail' },
  { label: '涉案人管理', value: 'caseManage' },
  { label: '涉案人交易查询', value: 'caseDealSearch' },
]

const componentMap: Record<string, any> = {
  smartSearchDetail: SmartSearchDetail,
  caseManage: CaseManage,
  caseDealSearch: CaseDealSearch,
}

const isValidTab = (tab?: string | null): tab is string => tabs.some((item) => item.value === tab)

const restoreActiveTab = () => {
  const cachedTab = window.localStorage.getItem(routeCacheKey)
  if (isValidTab(cachedTab)) {
    activeTab.value = cachedTab
  }
}

const persistActiveTab = () => {
  window.localStorage.setItem(routeCacheKey, activeTab.value)
}

const markPageReload = () => {
  persistActiveTab()
  window.sessionStorage.setItem(routeReloadFlagKey, '1')
}

const clearCachedActiveTab = () => {
  window.localStorage.removeItem(routeCacheKey)
}

const isCurrentRouteTagStillOpen = () => {
  return multiTagsStore.multiTags.some((tag: any) => {
    return tag.path === routePath && isEqual(tag.query ?? {}, routeQuery) && isEqual(tag.params ?? {}, routeParams)
  })
}

const currentComponent = computed(() => componentMap[activeTab.value] || SmartSearchDetail)

onMounted(() => {
  restoreActiveTab()
  persistActiveTab()
  window.addEventListener('beforeunload', markPageReload)
})

watch(activeTab, () => {
  persistActiveTab()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', markPageReload)

  if (window.sessionStorage.getItem(routeReloadFlagKey)) {
    window.sessionStorage.removeItem(routeReloadFlagKey)
    return
  }

  if (!isCurrentRouteTagStillOpen()) {
    clearCachedActiveTab()
  }
})
</script>

<template>
  <div class="funds-analysis-page">
    <aside class="funds-analysis-page__aside">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="['funds-analysis-page__tab', { 'is-active': activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </aside>

    <section class="funds-analysis-page__content">
      <component :is="currentComponent" class="funds-analysis-page__view" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.funds-analysis-page {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.funds-analysis-page__aside {
  display: flex;
  flex: 0 0 180px;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.funds-analysis-page__tab {
  padding: 10px 12px;
  color: #606266;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.funds-analysis-page__tab:hover {
  color: var(--el-color-primary);
  background: #f5f9ff;
}

.funds-analysis-page__tab.is-active {
  color: var(--el-color-primary);
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.funds-analysis-page__content {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.funds-analysis-page__view {
  flex: 1;
  min-width: 0;
  min-height: 0;
}
</style>
