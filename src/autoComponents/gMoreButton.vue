<template>
  <div class="inline-block ml-2">
    <!-- 基础按钮 -->
    <template v-for="(btn, index) in baseButtons" :key="index">
      <el-button
        v-if="typeof btn === 'object'"
        :type="btn.type"
        :size="btn.size"
        :icon="btn.icon"
        :disabled="btn.disabled"
        @click="btn.handler && btn.handler()"
        class="mr-2"
      >
        {{ btn.content }}
      </el-button>
      <component :is="btn" v-else />
    </template>

    <!-- 更多按钮 -->
    <el-dropdown v-if="moreButtons.length > 0 || appendDom.length > 0" :trigger="trigger" class="ml-2">
      <el-button icon="el-icon-arrow-down" type="primary" plain v-if="mode == 'opt'">批量操作</el-button>
      <el-button icon="el-icon-more" type="text" v-else></el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 从btns配置生成的按钮 -->
          <el-dropdown-item v-for="(btn, index) in moreButtons" :key="index" :class="{ hidden: !btn.content }">
            <el-button
              type="text"
              :disabled="btn.disabled"
              @click="btn.handler && btn.handler()"
              class="w-full text-left"
            >
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

interface ButtonConfig {
  content: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  icon?: string
  disabled?: boolean
  handler?: () => void
  tag?: boolean
}

const props = defineProps<{
  showNum?: number
  showIndex?: number[]
  trigger?: 'hover' | 'click' | 'contextmenu'
  btns?: ButtonConfig[]
  mode?: 'opt' | 'more'
}>()

const slots = defineSlots()

// 计算基础按钮和更多按钮
const baseButtons = computed(() => {
  const allButtons = props.btns || []

  if (props.showNum && props.showNum > 0) {
    return allButtons.slice(0, props.showNum)
  } else if (props.showIndex && props.showIndex.length > 0) {
    return props.showIndex.map((index) => allButtons[index]).filter(Boolean)
  }
  return []
})

const moreButtons = computed(() => {
  const allButtons = props.btns || []
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
</script>

<style scoped></style>
