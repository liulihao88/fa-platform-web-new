<template>
  <div class="search-bar" :style="{ '--items-per-row': itemsPerRow }">
    <div class="search-layout">
      <div class="search-scroll">
        <div class="search-scroll-inner">
          <div v-if="hasDefaultSlot" class="search-extra">
            <slot />
          </div>

          <el-form :model="form" :inline="false" class="search-form" label-suffix=":" @keyup.enter="handleSearch">
            <div class="form-grid">
              <el-form-item v-for="(item, index) in row" :key="index" label="" :prop="item.prop">
                <o-input
                  v-if="item.type === 'input'"
                  v-model="form[item.prop]"
                  :placeholder="item.placeholder || `请输入${item.label}`"
                  :clearable="item.clearable || true"
                  style="width: 100%"
                  :title="item.label"
                  @clear="handleSearch"
                />
                <o-select
                  v-else-if="item.type === 'select'"
                  v-model="form[item.prop]"
                  style="width: 100%"
                  :placeholder="item.placeholder || `请选择${item.label}`"
                  :clearable="item.clearable || true"
                  :title="item.label"
                  :options="getItemOptions(item)"
                  @change="handleSearch"
                />
                <o-date-range
                  v-else-if="item.type === 'date'"
                  v-model="form[item.prop]"
                  :title="item.label"
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
        </div>
      </div>

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
.search-form {
  flex: 1 0 auto;
  min-width: 0;
}

.search-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: stretch;
}

.search-scroll {
  flex: 1 1 0;
  min-width: 0;
}

.search-scroll-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
}

.search-extra {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 16px;
  width: 100%;
  min-width: 0;
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

@media (width <= 900px) {
  .search-scroll {
    flex-basis: 100%;
  }

  .form-actions {
    justify-content: flex-end;
    width: 100%;
    padding-bottom: 0;
  }
}

.search-form[data-items-per-row='1'] .form-grid {
  grid-template-columns: 1fr;
}
</style>
