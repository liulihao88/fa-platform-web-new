<template>
  <div class="search-bar" :style="{ '--items-per-row': itemsPerRow }">
    <el-form :model="form" :inline="false" class="search-form" label-suffix=":" @keyup.enter="handleSearch">
      <div v-for="(row, rowIndex) in formRows" :key="rowIndex" class="form-row">
        <slot />
        <el-form-item v-for="(item, index) in row" :key="index" :label="item.label" :prop="item.prop">
          <o-input
            v-if="item.type === 'input'"
            v-model="form[item.prop]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            :clearable="item.clearable || true"
            style="width: 100%"
            @keyup.enter="handleSearch"
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
        <div v-if="rowIndex === formRows.length - 1" class="form-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommonHook } from '@/store'

const { getDictItems } = useCommonHook()

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

// 计算表单行数据
const formRows = computed(() => {
  const rows: FormItem[][] = []

  for (let i = 0; i < props.items.length; i += props.itemsPerRow) {
    const row = props.items.slice(i, i + props.itemsPerRow)
    rows.push(row)
  }

  return rows
})

const handleSearch = () => {
  emit('search', form.value)
}

const handleReset = () => {
  form.value = {}
  emit('reset')
}
</script>

<style scoped>
/* 响应式调整 */
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

.search-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-center;
}

.form-row .el-form-item {
  flex: 0 0 calc((100% - (var(--items-per-row, 3) - 1) * 16px) / var(--items-per-row, 3));
  min-width: 200px;
}

.form-actions {
  display: flex;
  margin-left: auto;
}

.search-bar {
  padding: 16px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.search-bar :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
