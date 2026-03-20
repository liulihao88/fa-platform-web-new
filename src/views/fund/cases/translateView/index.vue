<script setup lang="ts">
import { ref, watch } from 'vue'
import splitpane from '@/components/ReSplitPane'

defineOptions({
  name: 'SplitPane',
})

const showWhich = ref([1, 2])

const settingLR = ref({
  minPercent: 1,
  defaultPercent: 50,
  split: 'vertical',
})

watch(
  showWhich,
  (val) => {
    if (val.length === 2) {
      settingLR.value.defaultPercent = 50
    } else if (val.length === 1) {
      val[0] === 1
        ? (settingLR.value.defaultPercent = settingLR.value.minPercent)
        : (settingLR.value.defaultPercent = 100 - settingLR.value.minPercent)
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
    <o-basic-layout class="h-100%">
      <template #header>
        <o-title title="文件转换相亲">
          <o-checkbox
            v-model="showWhich"
            :showAll="false"
            :options="[
              { label: '显示源文件试图', value: 1 },
              { label: '显示转换结果', value: 2 },
            ]"
          />

          <template #right />
        </o-title>
      </template>
      <div class="split-pane h-100%">
        <splitpane :splitSet="settingLR" @resize="handleResize">
          <!-- #paneL 表示指定该组件为左侧面板 -->
          <template #paneL>
            <!-- 自定义左侧面板的内容 -->
            <el-scrollbar class="pane-scrollbar">
              <div class="pane-content f-ct-ct">A</div>
            </el-scrollbar>
          </template>
          <!-- #paneR 表示指定该组件为右侧面板 -->
          <template #paneR>
            <!-- 再次将右侧面板进行拆分 -->
            <el-scrollbar class="pane-scrollbar">
              <div class="pane-content f-ct-ct">B</div>
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
