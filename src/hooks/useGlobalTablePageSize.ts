import { computed, isRef, watch, type Ref } from 'vue'
import { DEFAULT_PAGE_SIZE, useTablePageStoreHook } from '@/store/modules/tablePage'

type PaginationTarget = Record<string, any> | Ref<Record<string, any>>

type TablePaginationOptions = {
  pageSizeKey?: string
}

function resolveTarget(target?: PaginationTarget | null) {
  if (!target) return undefined
  return isRef(target) ? target.value : target
}

export function useGlobalTablePageSize(defaultSize = DEFAULT_PAGE_SIZE) {
  const tablePageStore = useTablePageStoreHook()

  function getPageSize() {
    return tablePageStore.pageSize || defaultSize
  }

  function syncPageSize(target: PaginationTarget, key = 'pageSize') {
    if (!resolveTarget(target)) return
    watch(
      () => tablePageStore.pageSize,
      () => {
        const currentTarget = resolveTarget(target)
        if (currentTarget) currentTarget[key] = getPageSize()
      },
      { immediate: true },
    )
  }

  function updatePageSize(target: PaginationTarget, size: number, key = 'pageSize') {
    tablePageStore.setPageSize(size)
    const currentTarget = resolveTarget(target)
    if (currentTarget) currentTarget[key] = getPageSize()
  }

  function createPageSizeUpdateHandler(
    target: PaginationTarget,
    callback?: (pageNo: number, pageSize: number) => void | Promise<void>,
    key = 'pageSize',
  ) {
    return (pageNo: number, pageSize: number) => {
      updatePageSize(target, pageSize, key)
      return callback?.(pageNo, getPageSize())
    }
  }

  return {
    globalPageSize: computed(() => getPageSize()),
    syncPageSize,
    updatePageSize,
    createPageSizeUpdateHandler,
  }
}

export function useTablePagination(
  target: PaginationTarget,
  callback?: (pageNo: number, pageSize: number) => void | Promise<void>,
  options: TablePaginationOptions = {},
) {
  const { pageSizeKey = 'pageSize' } = options
  const { syncPageSize, createPageSizeUpdateHandler } = useGlobalTablePageSize()

  syncPageSize(target, pageSizeKey)

  return {
    handlePageUpdate: createPageSizeUpdateHandler(target, callback, pageSizeKey),
  }
}

export const useTablePageSize = useTablePagination
