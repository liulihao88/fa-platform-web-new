<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
</script>

<template>
  <div>
    <o-row class="w-100%" :col="6">
      <div>1</div>
      <div>1</div>
      <div>1</div>
      <div>1</div>
      <!-- <o-input :value="fileInfo.fileName" title="文件名称" disabled />
        <o-select v-model="orgCode" title="所属银行/支付公司" disabled :options="payOptions" label="orgName" value="id">
          <template #suffix>
            <el-button type="primary" @click="selectOrg" :disabled="orgDisabled">选择</el-button>
          </template>
        </o-select>
        <o-tooltip content="1111111">
          <el-button type="primary">字段映射说明</el-button>
        </o-tooltip> -->
    </o-row>
  </div>
</template>
