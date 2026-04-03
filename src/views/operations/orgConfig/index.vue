<script setup lang="ts">
const pageTitle = '机构配置'
</script>

<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">{{ pageTitle }}</div>
      </template>
      <div class="page-content">{{ pageTitle }}页面已创建，后续可在这里接入具体业务功能。</div>
    </el-card>
  </div>
</template>

<style scoped>
.page-container {
  padding: 16px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.page-content {
  min-height: 120px;
  font-size: 14px;
  line-height: 22px;
  color: #606266;
}
</style>
