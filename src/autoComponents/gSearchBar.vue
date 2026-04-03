<template>
  <div class="search-bar" :style="{ '--items-per-row': itemsPerRow }">
    <div class="search-layout">
      <div v-if="hasDefaultSlot" class="search-extra">
        <slot />
      </div>

      <el-form :model="form" :inline="false" class="search-form" label-suffix=":" @keyup.enter="handleSearch">
        <div class="form-grid">
          <el-form-item v-for="(item, index) in row" :key="index" :label="item.label" :prop="item.prop">
            <o-input
              v-if="item.type === 'input'"
              v-model="form[item.prop]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :clearable="item.clearable || true"
              style="width: 100%"
              @clear="handleSearch"
            />
            <o-select
              v-else-if="item.type === 'select'"
              v-model="form[item.prop]"
              style="width: 100%"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable || true"
              :options="getItemOptions(item)"
              @change="handleSearch"
            />
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="form[item.prop]"
              :value-format="item.valueFormat || 'YYYY-MM-DD'"
              :format="item.format || 'YYYY-MM-DD'"
              :type="item.dateType || 'date'"
              :placeholder="item.placeholder || `请选择${item.label}`"
              style="width: 100%"
              @change="handleSearch"
            />
          </el-form-item>
        </div>
      </el-form>

      <div class="form-actions">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
import { useCommonHook } from '@/store'

const { getDictItems } = useCommonHook()
const slots = useSlots()

interface FormItem {
  prop: string
  label: string
  type: 'input' | 'select' | 'date'
  placeholder?: string
  clearable?: boolean
  options?: { label: string; value: any }[]
  dateType?: 'date' | 'datetime' | 'daterange' | 'datetimerange'
  valueFormat?: 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'x'
  format?: 'YYYY/MM/DD'
  dict?: string
  stringToNumber?: boolean
}

interface SearchBarProps {
  items: FormItem[]
  itemsPerRow?: number
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  itemsPerRow: 3,
})

const { itemsPerRow } = props

const getItemOptions = (item: FormItem) => {
  if (item.dict) {
    return getDictItems(item.dict) || []
  }
  return item.options || []
}

const emit = defineEmits<{
  (e: 'search', form: Record<string, any>): void
  (e: 'reset'): void
}>()

const form = ref<Record<string, any>>({})
const hasDefaultSlot = computed(() => !!slots.default)

const row = computed(() => props.items)

const handleSearch = () => {
  emit('search', form.value)
}

const handleReset = () => {
  form.value = {}
  emit('reset')
}
</script>

<style scoped>

@media (width <= 1200px) {
  .form-row .el-form-item {
    flex: 0 0 calc((100% - 16px) / 2);
  }
}

@media (width <= 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-row .el-form-item {
    flex: 0 0 100%;
  }

  .form-actions {
    align-self: flex-end;
    margin-top: 8px;
    margin-left: 0;
  }
}

@media (width <= 1600px) {
  .form-grid {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
}

@media (width <= 1280px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (width <= 900px) {
  .search-layout {
    flex-direction: column;
  }

  .search-extra,
  .search-form,
  .form-actions {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: flex-end;
    padding-bottom: 0;
  }
}

@media (width <= 768px) {
  .form-actions {
    margin-left: 0;
  }
}

.search-form {
  flex: 1;
  min-width: 0;
}

.search-layout {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.search-extra {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(var(--items-per-row, 3), minmax(220px, 1fr));
  gap: 16px;
}

.form-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  align-self: flex-end;
  justify-content: flex-end;
  min-width: max-content;
  padding-bottom: 2px;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-form-item__content) {
  width: 100%;
}

.search-bar {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.search-extra :deep(.el-button),
.form-actions :deep(.el-button) {
  flex: 0 0 auto;
}

/* 响应式调整 */
</style>
