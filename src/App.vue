<template>
  <el-config-provider :locale="currentLocale">
    <router-view v-if="useRefresh.refresh" />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { ReDialog } from '@/components/ReDialog'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { useCommonHook } from '@/store'
import useNativeRefresh from '@/store/nativeRefresh'
const useRefresh = useNativeRefresh()

const currentLocale = computed(() => {
  return zhCn
})
</script>
