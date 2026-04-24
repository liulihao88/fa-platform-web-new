<template>
  <div />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

import { useWatermark } from '@/hooks/useWatermark'
import { useCommonHook } from '@/store/common'
import { useUserStoreHook } from '@/store/modules/user'

defineOptions({
  name: 'GlobalWatermark',
})

const commonStore = useCommonHook()
const userStore = useUserStoreHook()
const { setWatermark, clear } = useWatermark()

const userInfo = computed<Record<string, any>>(() => {
  return commonStore.userInfo as Record<string, any>
})

const displayName = computed(() => {
  return userInfo.value.realname || userStore.nickname || userStore.username || ''
})

watch(
  displayName,
  (name) => {
    if (!name) {
      clear()
      return
    }

    setWatermark(`${name} ${new Date().getFullYear()}`)
  },
  { immediate: true },
)
</script>
