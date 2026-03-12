<template>
  <div>
    <template v-if="mode === 'edit'">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(item, index) in Colors"
          :key="index"
          :style="{ color: item[0] }"
          :class="modelValue === item[0] ? 'item-active' : ''"
          class="w-4.5 flex justify-center items-center cursor-pointer relative"
          @click="handleColorClick(item)"
        >
          <div class="hidden item-color-border" :style="{ color: item[0] }"></div>
          <div class="w-4.5 h-4.5 rounded-full" :style="{ background: item[0] }"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div v-if="modelValue" class="w-4.5 h-4.5 rounded-full" :style="{ background: modelValue }"></div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
const whiteColor = '#ffffff'
const blackColor = '#666666'
const Colors = [
  // 背景颜色，文字颜色
  ['#2196F3', whiteColor],
  ['#08C9C9', whiteColor],
  ['#00C345', whiteColor],
  ['#FAD714', whiteColor],
  ['#FF9300', whiteColor],
  ['#F52222', whiteColor],
  ['#EB2F96', whiteColor],
  ['#7500EA', whiteColor],
  ['#2D46C4', whiteColor],
  ['#484848', whiteColor],
  // --------------------
  ['#C9E6FC', blackColor],
  ['#C3F2F2', blackColor],
  ['#C2F1D2', blackColor],
  ['#FEF6C6', blackColor],
  ['#FFE5C2', blackColor],
  ['#FDCACA', blackColor],
  ['#FACDE6', blackColor],
  ['#DEC2FA', blackColor],
  ['#CCD2F1', blackColor],
  ['#D3D3D3', blackColor],
]

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  mode: {
    type: String,
    default: 'edit',
    validator: (value: string) => ['edit', 'view'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

function handleColorClick(item) {
  emit('update:modelValue', item[0])
}
</script>

<style scoped>
.item-active .item-color-border {
  display: block;
  position: absolute;
  border: 1px solid;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>
