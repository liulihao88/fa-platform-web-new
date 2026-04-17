import { computed, nextTick, ref, type Ref } from 'vue'

export function useSelectionMap<T extends Record<string, any>>(
  data: Ref<T[]>,
  getKey: (row: T) => string | number = (row) => row.id,
) {
  const tableRef = ref()
  const syncingSelection = ref(false)
  const selectedMap = ref(new Map<string | number, T>())

  const selectedCount = computed(() => selectedMap.value.size)
  const selectedKeys = computed(() => Array.from(selectedMap.value.keys()))
  const selectedRows = computed(() => Array.from(selectedMap.value.values()))

  function handleSelectionChange(rows: T[]) {
    if (syncingSelection.value) return

    const currentKeys = new Set((data.value || []).map((item) => getKey(item)))
    currentKeys.forEach((key) => selectedMap.value.delete(key))
    ;(rows || []).forEach((row) => {
      selectedMap.value.set(getKey(row), row as any)
    })
  }

  async function syncSelection() {
    await nextTick()
    const table = tableRef.value?.$refs?.tableRef
    if (!table) return

    syncingSelection.value = true
    try {
      table.clearSelection()
      ;(data.value || []).forEach((row) => {
        if (selectedMap.value.has(getKey(row))) {
          table.toggleRowSelection(row, true)
        }
      })
    } finally {
      await nextTick()
      syncingSelection.value = false
    }
  }

  function clearSelected() {
    selectedMap.value.clear()
    tableRef.value?.$refs?.tableRef?.clearSelection()
  }

  return {
    tableRef,
    selectedMap,
    selectedCount,
    selectedKeys,
    selectedRows,
    handleSelectionChange,
    syncSelection,
    clearSelected,
  }
}
