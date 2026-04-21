import { computed, ref, type Ref } from 'vue'

export function useSelectionMap<T extends Record<string, any>>(
  _data?: Ref<T[]>,
  getKey: (row: T) => string | number = (row) => row.id,
) {
  const selectedRows = ref<T[]>([])
  const selectedCount = computed(() => selectedRows.value.length)
  const selectedKeys = computed(() => selectedRows.value.map((row) => getKey(row as T)))

  function clearSelected() {
    selectedRows.value = []
  }

  return {
    selectedRows,
    selectedCount,
    selectedKeys,
    clearSelected,
  }
}
