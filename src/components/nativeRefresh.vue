<script setup lang="ts">
/**
 * @描述
 * 本地按钮进行刷新, 不用按ctrl+r就能直接在浏览器刷新.  方便调试和开发
 * 快捷键 cmd + return
 */
import Mousetrap from 'mousetrap'
import { ref, getCurrentInstance, nextTick, onMounted } from 'vue'
import { $toast, setStorage } from '@oeos-components/utils'
import useNativeRefresh from '@/store/nativeRefresh'
import { useNav } from '@/layout/hooks/useNav'

const { logout } = useNav()

const { proxy } = getCurrentInstance()
const instance = getCurrentInstance()
const useRefresh = useNativeRefresh()

onMounted(() => {
  Mousetrap.bind(['command+enter', 'ctrl+enter'], function () {
    // 执行你想要的操作
    nativeRefresh()
  })
})

function nativeRefresh() {
  console.clear()
  useRefresh.refreshHandler()
}
const isDev = ref(proxy.$dev)
function changeMode() {
  isDev.value = !isDev.value
  setStorage('fa-$dev', isDev.value)
  instance.appContext.app.config.globalProperties.$dev = isDev.value
  nativeRefresh()
}
defineExpose({
  nativeRefresh,
})
</script>

<template>
  <o-tooltip content="ctrl+enter" class="po-f r-500 t-8" style="right: calc(50% - 50px); z-index: 999">
    <el-button id="nativeRefreshBtn" type="primary" class="o-6" size="small" @click="nativeRefresh">刷新</el-button>
  </o-tooltip>

  <o-tooltip
    content="开发环境有测试数据;没有二次确认"
    class="po-f t-8 r-550"
    style="right: calc(50% - 100px); z-index: 999"
  >
    <el-button id="nativeRefreshBtn " :type="isDev ? 'danger' : 'primary'" class="o-6" size="small" @click="changeMode">
      {{ isDev ? '开发' : '生产' }}
    </el-button>
  </o-tooltip>

  <o-tooltip class="po-f t-8 r-550" style="right: calc(50% - 150px); z-index: 999">
    <el-button id="nativeRefreshBtn " type="primary" class="o-6" size="small" @click="logout">退出</el-button>
  </o-tooltip>
</template>
