import { defineStore } from 'pinia'
import { store } from '@/store'

const DEFAULT_PAGE_SIZE = 10

export const useTablePageStore = defineStore('table-page', {
  state: () => ({
    pageSize: DEFAULT_PAGE_SIZE,
  }),
  actions: {
    setPageSize(size: number) {
      const next = Number(size)
      this.pageSize = Number.isFinite(next) && next > 0 ? next : DEFAULT_PAGE_SIZE
    },
    resetPageSize() {
      this.pageSize = DEFAULT_PAGE_SIZE
    },
    clearPersistedPageSize() {
      localStorage.removeItem(this.$id)
    },
  },
  persist: true,
})

export function useTablePageStoreHook() {
  return useTablePageStore(store)
}

export { DEFAULT_PAGE_SIZE }
