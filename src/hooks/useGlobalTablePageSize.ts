import { computed, inject, isRef, provide, reactive, watch, watchEffect, type Ref } from 'vue'
import { DEFAULT_PAGE_SIZE, useTablePageStoreHook } from '@/store/modules/tablePage'

type PaginationTarget = Record<string, any> | Ref<Record<string, any>>
type PageSizeSource = number | Ref<number> | PaginationTarget

type TablePaginationOptions = {
  pageSizeKey?: string
}

const GLOBAL_COMPONENT_CONFIG_KEY = 'GLOBAL_COMPONENT_CONFIG'

function resolveTarget(target?: PaginationTarget | null) {
  if (!target) return undefined
  return isRef(target) ? target.value : target
}

function resolvePageSizeSource(source?: PageSizeSource | null, key = 'pageSize') {
  console.log(`89 source`, source)
  if (source == null) return undefined
  if (typeof source === 'number') return source
  if (isRef(source)) {
    const current = source.value
    return typeof current === 'number' ? current : current?.[key]
  }
  return source?.[key]
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

export function useProvideOTablePageSize(source?: PageSizeSource, key = 'pageSize') {
  const parentConfig = inject<Record<string, any>>(GLOBAL_COMPONENT_CONFIG_KEY, {})
  console.log(`54 parentConfig`, parentConfig)
  const { globalPageSize } = useGlobalTablePageSize()
  const componentConfig = reactive({
    ...parentConfig,
    oTable: {
      ...(parentConfig?.oTable || {}),
    },
  })

  watchEffect(() => {
    const currentPageSize = resolvePageSizeSource(source, key) ?? globalPageSize.value
    console.log(`27 resolvePageSizeSource(source, key)`, resolvePageSizeSource(source, key))
    console.log(`11 globalPageSize.value`, globalPageSize.value)
    componentConfig.oTable.pageSize = currentPageSize
  })

  provide(GLOBAL_COMPONENT_CONFIG_KEY, componentConfig)

  console.log(`06 componentConfig`, componentConfig)
  return componentConfig
}
