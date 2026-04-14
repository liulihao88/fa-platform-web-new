<template>
  <div class="inline-block">
    <!-- 基础按钮 -->
    <template v-for="(btn, index) in baseButtons" :key="index">
      <el-button
        v-if="typeof btn === 'object'"
        :type="btn.type"
        :size="btn.size"
        :icon="btn.icon"
        :disabled="isDisabled(btn)"
        @click="handleButtonClick(btn)"
      >
        {{ btn.content }}
      </el-button>
      <component :is="btn" v-else />
    </template>

    <!-- 更多按钮 -->
    <el-dropdown v-if="moreButtons.length > 0 || appendDom.length > 0" :trigger="trigger" class="ml-2">
      <el-button v-if="mode == 'opt'" icon="el-icon-arrow-down" type="primary" plain>批量操作</el-button>
      <el-button v-else icon="el-icon-more" type="text" />
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 从btns配置生成的按钮 -->
          <el-dropdown-item v-for="(btn, index) in moreButtons" :key="index" :class="{ hidden: !btn.content }">
            <el-button type="text" :disabled="isDisabled(btn)" class="w-full text-left" @click="handleButtonClick(btn)">
              {{ btn.content }}
            </el-button>
          </el-dropdown-item>

          <!-- 从插槽生成的按钮 -->
          <el-dropdown-item
            v-for="(item, index) in moreSlotButtons"
            :key="`slot-${index}`"
            :class="{ hidden: !item.text }"
          >
            <component :is="item" />
          </el-dropdown-item>

          <!-- 追加内容 -->
          <template v-for="(item, index) in appendDom" :key="`append-${index}`">
            <component :is="item" />
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'

interface ButtonConfig {
  content: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  icon?: string
  disabled?: boolean | ((...args: any[]) => boolean)
  handler?: (...args: any[]) => void
  tag?: boolean
  isShow?: boolean | (() => boolean)
  reConfirm?: boolean | (() => boolean)
  confirmMsg?: string
}

const props = defineProps<{
  showNum?: number // 最多显示的基础按钮数量
  showIndex?: number[] // 显示的基础按钮索引数组
  trigger?: 'hover' | 'click' | 'contextmenu' // 触发方式
  btns?: ButtonConfig[] // 按钮配置数组
  mode?: 'opt' | 'more' // 模式（opt：批量操作，more：列表更多操作）
}>()

const slots = defineSlots()

function isShow(btn: ButtonConfig): boolean {
  if (typeof btn.isShow === 'function') {
    return btn.isShow()
  }
  return btn.isShow !== false
}

// 计算基础按钮和更多按钮
const baseButtons = computed(() => {
  const allButtons = (props.btns || []).filter((btn) => isShow(btn))
  if (props.showNum === undefined) {
    return allButtons
  } else if (props.showNum && props.showNum > 0) {
    return allButtons.slice(0, props.showNum)
  } else if (props.showIndex && props.showIndex.length > 0) {
    return props.showIndex.map((index) => allButtons[index]).filter(Boolean)
  }
  return []
})

const moreButtons = computed(() => {
  const allButtons = (props.btns || []).filter((btn) => isShow(btn))
  return allButtons.filter((btn) => !baseButtons.value.includes(btn))
})

// 处理插槽内容
const moreSlotButtons = computed(() => {
  const slotButtons = slots.default ? slots.default() : []
  return slotButtons.filter((btn) => !baseButtons.value.includes(btn))
})

const appendDom = computed(() => {
  return slots.append ? slots.append() : []
})

// 检查是否需要确认
function shouldConfirm(btn: ButtonConfig): boolean {
  if (typeof btn.reConfirm === 'function') {
    return btn.reConfirm()
  }
  return btn.reConfirm === true
}

function isDisabled(btn: ButtonConfig, ...args: any[]): boolean {
  if (typeof btn.disabled === 'function') {
    return btn.disabled(...args)
  }
  return btn.disabled === true
}

// 处理按钮点击
async function handleButtonClick(btn: ButtonConfig, ...args: any[]) {
  if (isDisabled(btn, ...args)) return

  if (shouldConfirm(btn)) {
    try {
      await ElMessageBox.confirm(btn.confirmMsg || `您确定${btn.content}吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      // 用户确认后执行
      if (btn.handler) {
        btn.handler(...args)
      }
    } catch (error) {
      // 用户取消，不执行操作
    }
  } else {
    // 不需要确认，直接执行
    if (btn.handler) {
      btn.handler(...args)
    }
  }
}
</script>

<style scoped></style>
