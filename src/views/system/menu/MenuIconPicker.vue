<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import MenuIconPreview from './MenuIconPreview.vue'
import allIcons from './menu-icon-data'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disabled?: boolean
    placeholder?: string
    allowClear?: boolean
  }>(),
  {
    modelValue: '',
    disabled: false,
    placeholder: '请选择菜单图标',
    allowClear: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const commonIcons = [
  'ant-design:appstore-outlined',
  'ant-design:dashboard-outlined',
  'ant-design:setting-outlined',
  'ant-design:menu-outlined',
  'ant-design:home-outlined',
  'ant-design:folder-outlined',
  'ant-design:profile-outlined',
  'ant-design:database-outlined',
  'ant-design:credit-card-outlined',
  'ant-design:wallet-outlined',
  'ant-design:bank-outlined',
  'ant-design:file-text-outlined',
  'ant-design:container-outlined',
  'ant-design:team-outlined',
  'ant-design:user-outlined',
  'ant-design:cluster-outlined',
  'ant-design:deployment-unit-outlined',
  'ant-design:api-outlined',
  'ant-design:control-outlined',
  'ant-design:tool-outlined',
  'ant-design:book-outlined',
  'ant-design:message-outlined',
  'ant-design:notification-outlined',
  'ant-design:safety-outlined',
  'ant-design:lock-outlined',
  'ant-design:experiment-outlined',
  'ant-design:desktop-outlined',
  'ant-design:cloud-server-outlined',
  'ant-design:cloud-outlined',
  'ant-design:bar-chart-outlined',
  'ant-design:pie-chart-outlined',
  'ant-design:line-chart-outlined',
  'ant-design:funnel-plot-outlined',
  'ant-design:fund-outlined',
  'ant-design:schedule-outlined',
  'ant-design:unordered-list-outlined',
]

const dialogVisible = ref(false)
const activeTab = ref('common')
const keyword = ref('')
const pageNo = ref(1)
const pageSize = ref(96)
const pendingValue = ref(props.modelValue || '')

const filteredIcons = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) {
    return allIcons
  }
  return allIcons.filter((item) => item.toLowerCase().includes(text))
})

const pagedIcons = computed(() => {
  const start = (pageNo.value - 1) * pageSize.value
  return filteredIcons.value.slice(start, start + pageSize.value)
})

watch(
  () => props.modelValue,
  (value) => {
    pendingValue.value = value || ''
  },
)

watch(keyword, () => {
  pageNo.value = 1
})

function openDialog() {
  if (props.disabled) return
  activeTab.value = 'common'
  keyword.value = ''
  pageNo.value = 1
  pendingValue.value = props.modelValue || ''
  dialogVisible.value = true
}

function selectIcon(icon: string) {
  pendingValue.value = icon
}

function clearValue() {
  if (props.disabled) return
  pendingValue.value = ''
  emit('update:modelValue', '')
}

function handleConfirm() {
  emit('update:modelValue', pendingValue.value || '')
  dialogVisible.value = false
}
</script>

<template>
  <div class="menu-icon-picker">
    <el-input :model-value="modelValue" readonly :disabled="disabled" :placeholder="placeholder" @click="openDialog">
      <template #prepend>
        <div class="menu-icon-picker__trigger" @click.stop="openDialog">
          <MenuIconPreview :icon="modelValue || 'ant-design:appstore-outlined'" :size="18" />
        </div>
      </template>
      <template #suffix>
        <el-icon v-if="allowClear && modelValue && !disabled" class="cursor-pointer" @click.stop="clearValue">
          <Close />
        </el-icon>
      </template>
    </el-input>

    <el-dialog v-model="dialogVisible" title="选择菜单图标" width="860px" append-to-body>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="常用图标" name="common">
          <div class="menu-icon-picker__grid">
            <button
              v-for="icon in commonIcons"
              :key="icon"
              type="button"
              class="menu-icon-picker__item"
              :class="{ 'is-active': pendingValue === icon }"
              :title="icon"
              @click="selectIcon(icon)"
            >
              <MenuIconPreview :icon="icon" :size="20" />
            </button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="全部图标" name="all">
          <el-input v-model="keyword" clearable placeholder="搜索图标" class="mb3" />
          <div class="menu-icon-picker__grid">
            <button
              v-for="icon in pagedIcons"
              :key="icon"
              type="button"
              class="menu-icon-picker__item"
              :class="{ 'is-active': pendingValue === icon }"
              :title="icon"
              @click="selectIcon(icon)"
            >
              <MenuIconPreview :icon="icon" :size="20" />
            </button>
          </div>

          <div class="mt3 flex justify-end">
            <el-pagination
              v-model:current-page="pageNo"
              v-model:page-size="pageSize"
              background
              layout="total, sizes, prev, pager, next"
              :page-sizes="[48, 96, 144]"
              :total="filteredIcons.length"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-sm text-[var(--el-text-color-secondary)]">
            {{ pendingValue || '未选择图标' }}
          </div>
          <div>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.menu-icon-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
}

.menu-icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 10px;
  max-height: 420px;
  padding: 4px 2px;
  overflow: auto;
}

.menu-icon-picker__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.menu-icon-picker__item:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-1px);
}

.menu-icon-picker__item.is-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgb(64 158 255 / 16%);
}
</style>
