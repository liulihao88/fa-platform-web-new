<template>
  <div class="`easyCron-config-list`">
    <a-radio-group v-model:value="type">
      <div class="item">
        <a-radio :value="TypeEnum.every" v-bind="beforeRadioAttrs"
          >每年</a-radio
        >
      </div>
      <div class="item">
        <a-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs"
          >区间</a-radio
        >
        <span> 从 </span>
        <InputNumber
          v-model:value="valueRange.start"
          class="w80"
          v-bind="typeRangeAttrs"
        />
        <span> 年 至 </span>
        <InputNumber
          v-model:value="valueRange.end"
          class="w80"
          v-bind="typeRangeAttrs"
        />
        <span> 年 </span>
      </div>
      <div class="item">
        <a-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</a-radio>
        <span> 从 </span>
        <InputNumber
          v-model:value="valueLoop.start"
          class="w80"
          v-bind="typeLoopAttrs"
        />
        <span> 年开始，间隔 </span>
        <InputNumber
          v-model:value="valueLoop.interval"
          class="w80"
          v-bind="typeLoopAttrs"
        />
        <span> 年 </span>
      </div>
    </a-radio-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { InputNumber } from "ant-design-vue";
import { useTabProps, useTabEmits, useTabSetup } from "./useTabMixin";

export default defineComponent({
  name: "YearUI",
  components: { InputNumber },
  props: useTabProps({
    defaultValue: "*"
  }),
  emits: useTabEmits(),
  setup(props, context) {
    const nowYear = new Date().getFullYear();
    return useTabSetup(props, context, {
      defaultValue: "*",
      minValue: 0,
      valueRange: { start: nowYear, end: nowYear + 100 },
      valueLoop: { start: nowYear, interval: 1 }
    });
  }
});
</script>
