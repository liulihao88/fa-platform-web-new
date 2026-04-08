import { computed, watch } from 'vue'
import { DEFAULT_PAGE_SIZE, useTablePageStoreHook } from '@/store/modules/tablePage'

export function useGlobalTablePageSize(defaultSize = DEFAULT_PAGE_SIZE) {
  const tablePageStore = useTablePageStoreHook()

  function getPageSize() {
    return tablePageStore.pageSize || defaultSize
  }

  function syncPageSize(target: Record<string, any>, key = 'pageSize') {
    if (!target) return
    watch(
      () => tablePageStore.pageSize,
      () => {
        target[key] = getPageSize()
      },
      { immediate: true },
    )
  }

  function updatePageSize(target: Record<string, any>, size: number, key = 'pageSize') {
    tablePageStore.setPageSize(size)
    if (target) target[key] = getPageSize()
  }

  return {
    globalPageSize: computed(() => getPageSize()),
    syncPageSize,
    updatePageSize,
  }
}
