<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNav } from '@/layout/hooks/useNav'
import { useCommonHook } from '@/store/common'
import { useUserStoreHook } from '@/store/modules/user'
import { logoutApi } from '@/api/account'
import { refreshDict, refreshDragCache, getAllDictItems } from '@/api/analysis'
import PasswordDialog from './PasswordDialog.vue'
import EditPenLine from '~icons/ri/edit-2-line'
import RefreshLine from '~icons/ri/refresh-line'
import LogoutCircleRLine from '~icons/ri/logout-circle-r-line'

withDefaults(
  defineProps<{
    showName?: boolean
  }>(),
  {
    showName: true,
  },
)

const { username, userAvatar, avatarsStyle } = useNav()
const { setCommonItems } = useCommonHook()
const userStore = useUserStoreHook()
const passwordDialogRef = ref<InstanceType<typeof PasswordDialog>>()

async function handleCommand(command: 'password' | 'cache' | 'logout') {
  switch (command) {
    case 'password':
      if (!username.value) {
        ElMessage.warning('当前系统无登录用户')
        return
      }
      passwordDialogRef.value?.open({
        username: userStore.username,
      })
      break
    case 'cache':
      await refreshCache()
      break
    case 'logout':
      await handleLogout()
      break
  }
}

async function refreshCache() {
  try {
    const [dictRes] = await Promise.all([refreshDict(), refreshDragCache()])
    if (dictRes?.code === 0) {
      const allDictRes = await getAllDictItems()
      if (allDictRes?.code === 200) {
        setCommonItems('sysAllDictItems', allDictRes.result || {})
      }
      ElMessage.success('刷新缓存完成！')
      return
    }
    ElMessage.error('刷新缓存失败！')
  } catch (error) {
    console.error('refresh cache failed', error)
    ElMessage.error('刷新缓存失败！')
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('是否确认退出系统?', '温馨提醒', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
    try {
      await logoutApi()
    } catch (error) {
      console.warn('logout api failed', error)
    } finally {
      userStore.logOut()
    }
  } catch {
    return
  }
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="el-dropdown-link navbar-bg-hover select-none">
      <img src="https://q1.qlogo.cn/g?b=qq&nk=190848757&s=640" :style="avatarsStyle" />
      <p v-if="showName && username" class="dark:text-white">{{ username }}</p>
    </span>
    <template #dropdown>
      <el-dropdown-menu class="logout-dropdown">
        <el-dropdown-item command="password">
          <IconifyIconOffline :icon="EditPenLine" style="margin: 5px" />
          密码修改
        </el-dropdown-item>
        <el-dropdown-item command="cache">
          <IconifyIconOffline :icon="RefreshLine" style="margin: 5px" />
          刷新缓存
        </el-dropdown-item>
        <el-dropdown-item command="logout">
          <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
          退出系统
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <PasswordDialog ref="passwordDialogRef" />
</template>

<style scoped lang="scss">
.el-dropdown-link {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 48px;
  padding: 10px;
  color: #000000d9;
  cursor: pointer;

  p {
    font-size: 14px;
  }

  img {
    width: 22px;
    height: 22px;
    border-radius: 50%;
  }
}
</style>

<style lang="scss">
.logout-dropdown {
  width: 120px;

  .el-dropdown-menu__item {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
