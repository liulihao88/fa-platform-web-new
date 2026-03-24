<script setup lang="ts">
const fileName = '2/光大银行 - 脱敏.xlsx'
</script>

<template>
  <div class="origin-translate">
    <div class="panel-header">源文件视图</div>

    <div class="toolbar">
      <div class="file-info">
        <span class="label">文件名称:</span>
        <span class="value">{{ fileName }}</span>
      </div>

      <div class="actions">
        <el-button type="primary">预览文件</el-button>
        <el-button type="primary">快速预览文件</el-button>
      </div>
    </div>

    <div class="preview-area">
      <div class="preview-placeholder">点击"预览文件"按钮加载文件内容</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.origin-translate {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid #e5e6eb;
}

.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.file-info {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  color: #303133;
}

.label {
  flex-shrink: 0;
  font-weight: 500;
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: center;
}

.preview-area {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 520px;
  padding: 24px;
  color: #909399;
  background: linear-gradient(0deg, rgb(0 0 0 / 1%), rgb(0 0 0 / 1%)), #fff;
}

.preview-placeholder {
  font-size: 14px;
}
</style>
