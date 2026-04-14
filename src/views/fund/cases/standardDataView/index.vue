<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import ResultTranslate from '@/views/fund/cases/translateView/resultTranslate.vue'
import { getStorage } from '@oeos-components/utils'
import { getStandardDataFileList, getStandardDataPageList } from '@/api/analysis.ts'
import { use } from 'echarts'

const route = useRoute()
const resultTranslateRef = useTemplateRef('resultTranslateRef')

const searchParams = ref({
  caseId: String(route.query.caseId || getStorage('caseId') || ''),
  fileName: '',
  pageNo: 1,
  pageSize: 10,
})

const loading = ref(false)
const lists = ref<any[]>([])
const total = ref(0)
const activeId = ref('')

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(total.value / searchParams.value.pageSize))
})

const getPage = async () => {
  resultTranslateRef.value.init(activeId.value)
}

const setActiveRow = (row) => {
  activeId.value = row?.id || row?.fileId || row?.fileName || ''
  getPage()
}

const init = async () => {
  loading.value = true
  try {
    const res = await getStandardDataFileList(searchParams.value)
    lists.value = res?.records ?? []
    total.value = res?.total ?? 0

    if (!lists.value.length) {
      activeId.value = ''
      return
    }

    const currentActive = lists.value.find((item) => (item.id || item.fileId || item.fileName) === activeId.value)
    if (!currentActive) {
      setActiveRow(lists.value[0])
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchParams.value.pageNo = 1
  init()
}

const changePage = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && searchParams.value.pageNo > 1) {
    searchParams.value.pageNo -= 1
    init()
  }

  if (direction === 'next' && searchParams.value.pageNo < totalPages.value) {
    searchParams.value.pageNo += 1
    init()
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="standard-data-layout">
    <div v-loading="loading" class="standard-data-view">
      <o-input
        v-model="searchParams.fileName"
        placeholder="请输入文件名称"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </o-input>

      <div class="standard-data-view__pagination fs-12">
        <el-button :disabled="searchParams.pageNo <= 1" size="small" type="primary" @click="changePage('prev')">
          上一页
        </el-button>
        <div class="standard-data-view__page-text">{{ searchParams.pageNo }}/{{ totalPages }}</div>
        <el-button
          :disabled="searchParams.pageNo >= totalPages"
          size="small"
          type="primary"
          @click="changePage('next')"
        >
          下一页
        </el-button>
      </div>

      <div class="standard-data-view__list">
        <div
          v-for="item in lists"
          :key="item.id || item.fileId || item.fileName"
          :class="[
            'standard-data-view__item',
            {
              'is-active': (item.id || item.fileId || item.fileName) === activeId,
            },
          ]"
          @click="setActiveRow(item)"
        >
          <div class="standard-data-view__item-name">{{ item.fileOriginName || item.fileName || '-' }}</div>
          <div v-if="(item.id || item.fileId || item.fileName) === activeId" class="standard-data-view__watermark">
            <!-- 管理员 -->
          </div>
        </div>

        <el-empty v-if="!lists.length && !loading" description="暂无标准数据文件" />
      </div>
    </div>

    <div class="standard-data-layout__result">
      <ResultTranslate ref="resultTranslateRef" type="standard" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.standard-data-layout {
  display: flex;
  gap: 20px;
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  &__result {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}

.standard-data-view {
  display: flex;
  flex: 0 0 240px;
  flex-direction: column;
  min-width: 240px;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background: #fff;

  &__panel {
    height: 100%;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: none;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;
  }

  &__page-text {
    flex: 1 1 auto;
    font-size: 14px;
    font-weight: 600;
    color: #606774;
    text-align: center;
    white-space: nowrap;
  }

  &__list {
    flex: 1;
    min-height: 0;
    padding-top: 0;
    overflow: hidden;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 0 18px 0 44px;
    font-size: 14px;
    font-weight: 400;
    color: #313743;
    cursor: pointer;
    border-bottom: 1px solid #edf1f6;
    transition:
      background-color 0.2s ease,
      border-radius 0.2s ease;

    &:hover {
      background: #f7fbff;
    }

    &.is-active {
      margin-top: 0;
      background: #ecf5ff;
      border-bottom-color: transparent;
      border-radius: 0;

      &::after {
        position: absolute;
        top: 0;
        right: 0;
        width: 6px;
        height: 100%;
        content: '';
        background: #409eff;
        border-radius: 0;
      }
    }
  }

  &__item-name {
    position: relative;
    z-index: 1;
    word-break: break-all;
  }

  &__watermark {
    position: absolute;
    top: 50%;
    right: 36px;
    font-size: 16px;
    font-weight: 600;
    color: rgb(119 156 198 / 26%);
    pointer-events: none;
    transform: translateY(-50%) rotate(-28deg);
  }

  :deep(.o-input .el-input-group__append) {
    padding: 0;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-left: 0;
    border-radius: 0 4px 4px 0;
    box-shadow: none;
  }

  :deep(.o-input .el-input__inner) {
    font-size: 14px;
    color: #303133;
  }

  :deep(.o-input .el-input__inner::placeholder) {
    color: #c4c9d3;
  }

  :deep(.o-input .el-button) {
    width: 40px;
    margin: 0;
    background: #409eff;
    border: 0;
    border-radius: 0 2px 2px 0;
  }

  :deep(.o-input .el-button .el-icon) {
    color: #fff;
  }
}
</style>
