<template>
  <div>
    <template v-if="mode === 'edit'">
      <div class="item-tool">
        <div
          v-for="(item, index) in Colors"
          :key="index"
          :style="{ color: item[0] }"
          :class="modelValue === item[0] ? 'item-active' : ''"
          class="item-color"
          @click="handleColorClick(item)"
        >
          <div class="item-color-border" />
          <div class="item-back" :style="{ background: item[0] }" />
        </div>
      </div>
    </template>
    <template v-else>
      <div v-if="modelValue" class="item-view" :style="{ background: modelValue }" />
    </template>
  </div>
</template>

<script lang="ts" setup>
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
  emit('update:modelValue', props.modelValue === item[0] ? '' : item[0])
}
</script>

<style scoped>
.item-tool {
  display: flex;
  flex-wrap: wrap;
}

.item-color {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  margin-right: 10px;
  cursor: pointer;
}

.item-back {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.item-color-border {
  visibility: hidden;
}

.item-active .item-color-border {
  position: absolute;
  visibility: visible;
  width: 24px;
  height: 24px;
  border: 1px solid;
  border-radius: 50%;
}

.item-view {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
</style>
