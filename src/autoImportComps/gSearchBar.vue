<template>
    <div class="search-bar" :style="{ '--items-per-row': itemsPerRow }">
        <a-form :model="form" class="search-form" @keyup.enter="handleSearch">
            <div v-for="(row, rowIndex) in formRows" :key="rowIndex" class="form-row">
                <a-form-item v-for="(item, index) in row" :key="index" :label="item.label" :name="item.prop"
                    class="form-item">
                    <a-input v-if="item.type === 'input'" v-model:value="form[item.prop]"
                        :placeholder="item.placeholder || `请输入${item.label}`" :allow-clear="item.clearable || true"
                        style="width: 100%" @keyup.enter="handleSearch" />
                    <a-select v-else-if="item.type === 'select'" style="width: 100%" v-model:value="form[item.prop]"
                        :placeholder="item.placeholder || `请选择${item.label}`" :allow-clear="item.clearable || true"
                        @change="handleSearch">
                        <a-select-option v-for="option in getItemOptions(item)" :key="option.value"
                            :value="option.value">
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <a-date-picker v-else-if="item.type === 'date'" v-model:value="form[item.prop]"
                        :value-format="item.valueFormat || 'YYYY-MM-DD'" :format="item.format || 'YYYY-MM-DD'"
                        :picker="item.dateType || 'date'" :placeholder="item.placeholder || `请选择${item.label}`"
                        style="width: 100%" @change="handleSearch" />
                </a-form-item>
                <div v-if="rowIndex === formRows.length - 1" class="form-actions">
                    <a-button type="primary" @click="handleSearch">搜索</a-button>
                    <a-button @click="handleReset">重置</a-button>
                </div>
            </div>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { initDictOptions } from '/@/utils/dict/index';

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

// 响应式字典数据存储
const dictOptions = ref<Record<string, any[]>>({})

// 加载字典数据
const loadDictData = async () => {
    const dictCodes = props.items
        .filter(item => item.type === 'select' && item.dict)
        .map(item => item.dict!)

    for (const code of dictCodes) {
        if (!dictOptions.value[code]) {
            try {
                const options = await initDictOptions(code)
                dictOptions.value[code] = options
            } catch (error) {
                console.error(`Failed to load dict: ${code}`, error)
                dictOptions.value[code] = []
            }
        }
    }
}

// 组件挂载时加载字典数据
onMounted(() => {
    loadDictData()
})

// 获取选项数据
const getItemOptions = (item: FormItem) => {
    if (item.dict) {
        return dictOptions.value[item.dict] || []
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
.search-form {
    display: flex;
    flex-direction: column;
}

.form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    margin-bottom: 0;
}

.form-item {
    margin-bottom: 0 !important;
    flex: 0 0 calc((100% - (var(--items-per-row, 3) - 1) * 20px) / var(--items-per-row, 3));
    min-width: 250px;
}

/* 调整标签宽度 */
:deep(.ant-form-item-label) {
    width: 100px;
    min-width: 100px;
    text-align: left;
    padding-right: 8px;
}

:deep(.ant-form-item-control) {
    flex: 1;
    min-width: 0;
}

.form-actions {
    display: flex;
    gap: 12px;
    padding-bottom: 4px;
    margin-left: auto;
    align-items: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
    .form-item {
        flex: 0 0 calc((100% - 20px) / 2);
    }
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .form-item {
        flex: 0 0 100%;
        min-width: auto;
    }

    .form-actions {
        margin-left: 0;
        justify-content: flex-start;
        margin-top: 8px;
    }

    :deep(.ant-form-item-label) {
        width: 80px;
        min-width: 80px;
    }
}
</style>