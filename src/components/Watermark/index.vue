<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '/@/store/modules/user'
import { useWatermark } from '/@/hooks/web/useWatermark'

const userStore = useUserStore()
const { setWatermark, clear } = useWatermark()

// 监听用户信息变化
watch(
  () => userStore.getUserInfo,
  (userInfo) => {
    if (userInfo && userInfo.realname) {
      // 设置水印，包含用户真实姓名
      setWatermark(`${userInfo.realname} ${new Date().getFullYear()}`)
    } else {
      // 清除水印
      clear()
    }
  },
  { immediate: true },
)

// 组件挂载时设置水印
onMounted(() => {
  const userInfo = userStore.getUserInfo
  if (userInfo && userInfo.realname) {
    setWatermark(`${userInfo.realname} ${new Date().getFullYear()}`)
  }
})

// 组件销毁时清除水印
onUnmounted(() => {
  clear()
})
</script>
