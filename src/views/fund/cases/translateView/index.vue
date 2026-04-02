<script setup lang="ts">
import { ref, watch, h } from 'vue'
import splitpane from '@/components/ReSplitPane'
import OriginTranslate from '@/views/fund/cases/translateView/originTranslate.vue'
import ResultTranslate from '@/views/fund/cases/translateView/resultTranslate.vue'
import { $toast, getStorage } from '@oeos-components/utils'
import { useDetail } from '@/hooks'
const { toDetail } = useDetail()

defineOptions({
  name: 'SplitPane',
})

const showWhich = ref([])
const fileInfo = ref('')

const settingLR = ref({
  minPercent: 0,
  defaultPercent: 50,
  split: 'vertical',
})

const handleClose = () => {
  toDetail('Cases', { caseId: getStorage('caseId') })
}
const initFileInfo = (val) => {
  fileInfo.value = val
}

const translateResultInfo = `
<div>关于导入行数：</div>
<div>1、每个文件的导入行数，对应文件的每一行，包括空行都会导入到系统；每个文件的导入行数相加，则是本案件的导入行数</div>
<div>2、纵表导入时，每个数据段，只导入一行数据</div>
<div>3、在生成标准数据的时候，空行会被排除，所以标准数据的导入行数可能小于文件的导入行数</div>
`

watch(
  showWhich,
  (val) => {
    if (val.length === 2) {
      settingLR.value.defaultPercent = 50
    } else if (val.length === 1) {
      val[0] === 1
        ? (settingLR.value.defaultPercent = 100 - settingLR.value.minPercent)
        : (settingLR.value.defaultPercent = settingLR.value.minPercent)
    } else {
      settingLR.value.defaultPercent = 50
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

const handleResize = (percent: number) => {
  settingLR.value.defaultPercent = percent
}
</script>

<template>
  <div class="h-100%">
    <g-close @click="handleClose" />
    <o-basic-layout class="h-100%">
      <template #header>
        <o-title title="文件转换详情" class="w-100%">
          <o-checkbox
            v-model="showWhich"
            :showAll="false"
            :options="[
              { label: '显示源文件视图', value: 1 },
              { label: '显示转换结果', value: 2 },
            ]"
          />

          <template #right>
            <o-tooltip :content="translateResultInfo" trigger="click" raw-content>
              <el-button type="primary">转换结果说明</el-button>
            </o-tooltip>
          </template>
        </o-title>
      </template>
      <div class="split-pane h-100%">
        <splitpane :splitSet="settingLR" @resize="handleResize">
          <!-- #paneL 表示指定该组件为左侧面板 -->
          <template #paneL>
            <!-- 自定义左侧面板的内容 -->
            <el-scrollbar class="pane-scrollbar">
              <OriginTranslate :pFileInfo="fileInfo" />
            </el-scrollbar>
          </template>
          <!-- #paneR 表示指定该组件为右侧面板 -->
          <template #paneR>
            <!-- 再次将右侧面板进行拆分 -->
            <el-scrollbar class="pane-scrollbar">
              <ResultTranslate @initFileInfo="initFileInfo" />
            </el-scrollbar>
          </template>
        </splitpane>
      </div>
    </o-basic-layout>
  </div>
</template>

<style lang="scss" scoped>
.split-pane {
  height: 100%;
  // width: 100%;
  // height: calc(100vh - 300px);
  // font-size: 50px;
  // text-align: center;
  // border: 1px solid #e5e6eb;
  border: 1px solid var(--line);
}

.width-input {
  margin-left: 12px;
}

.pane-scrollbar {
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    height: 100%;
  }

  :deep(.el-scrollbar__view) {
    height: 100%;
  }
}

.pane-content {
  height: 100%;
}
</style>
