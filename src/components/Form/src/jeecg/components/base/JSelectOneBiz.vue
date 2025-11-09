<template>
  <div>
    <div v-if="isDetailsMode">
      <p class="detailStr" :title="detailStr">{{ detailStr }}</p>
    </div>
    <a-row v-else class="j-select-row" type="flex" :gutter="8">
      <a-col class="left" :class="{ full: !showButton }">
        <!-- 显示加载效果 -->
        <a-input v-if="loading" readOnly placeholder="加载中…">
          <template #prefix>
            <LoadingOutlined />
          </template>
        </a-input>
        <a-select
          v-else
          ref="select"
          :value="getValue(selectValue)"
          :placeholder="placeholder"
          :open="false"
          :disabled="disabled"
          :options="getOptions()"
          @change="handleChange"
          style="width: 100%"
          @click="!disabled && openModal(false)"
          v-bind="attrs"
        ></a-select>
      </a-col>
      <a-col v-if="showButton" class="right">
        <a-button v-if="buttonIcon" :preIcon="buttonIcon" type="primary" @click="openModal(true)" :disabled="disabled">
          {{ buttonText }}
        </a-button>
        <a-button v-else type="primary" @click="openModal(true)" :disabled="disabled">
          {{ buttonText }}
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, inject, watch, computed } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { LoadingOutlined } from '@ant-design/icons-vue';

  export default defineComponent({
    name: 'JSelectOneBiz',
    components: { LoadingOutlined },
    inheritAttrs: false,
    props: {
      showButton: propTypes.bool.def(true),
      buttonText: propTypes.string.def('选择'),
      disabled: propTypes.bool.def(false),
      placeholder: {
        type: String,
        default: '请选择',
      },
      // 是否正在加载
      loading: propTypes.bool.def(false),
      // buttonIcon
      buttonIcon: propTypes.string.def(''),
      // 【TV360X-1002】是否是详情模式
      isDetailsMode: propTypes.bool.def(false),
    },
    emits: ['handleOpen', 'change'],
    setup(props, { emit }) {
      //接收下拉框选项
      const options: any = inject('selectOptions', ref([]));
      //接收选择的值（单个对象）
      const selectValue: any = inject('selectValue', ref(null));
      const attrs = useAttrs();
      const detailStr = ref('');

      /**
       * 计算属性：确保每次selectValue变化时都能正确更新
       */
      const computedSelectValue = computed(() => {
        return selectValue.value;
      });

      /**
       * 获取实际用于显示的值
       */
      function getValue(val) {
        if (!val) return undefined;
        
        // 添加调试信息
        console.log('getValue val:', val);
        
        // 如果是对象，提取value属性
        if (typeof val === 'object') {
          return val.value || val.key || val.id || val.orgCd || undefined;
        }
        
        // 如果是基本类型，直接返回
        return val;
      }

      /**
       * 获取选项列表
       */
      function getOptions() {
        // 确保返回的是一个数组
        return Array.isArray(options.value) ? options.value : [];
      }

      /**
       * 打开弹出框
       */
      function openModal(isButton) {
        if (props.showButton && isButton) {
          emit('handleOpen');
        }
        if (!props.showButton && !isButton) {
          emit('handleOpen');
        }
      }

      /**
       * 下拉框值改变事件
       */
      function handleChange(value) {
        selectValue.value = value;
        emit('change', value);
      }

      // -update-begin--author:liaozhiyang---date:20240617---for：【TV360X-1002】详情页面行编辑用户组件和部门组件显示方式优化
      watch(
        [computedSelectValue, options],
        () => {
          if (props.isDetailsMode) {
            if (selectValue.value && typeof selectValue.value === 'object' && options.value && Array.isArray(options.value)) {
              const selectedOption = options.value.find((option: any) => option.value === selectValue.value);
              detailStr.value = selectedOption ? selectedOption.label : '';
            } else if (typeof selectValue.value === 'string' && options.value && Array.isArray(options.value)) {
              const selectedOption = options.value.find((option: any) => option.value === selectValue.value);
              detailStr.value = selectedOption ? selectedOption.label : selectValue.value;
            } else {
              detailStr.value = '';
            }
          }
        },
        { immediate: true }
      );
      // -update-end--author:liaozhiyang---date:20240617---for：【TV360X-1002】详情页面行编辑用户组件和部门组件显示方式优化

      return {
        attrs,
        selectValue,
        options,
        getValue,
        getOptions,
        handleChange,
        openModal,
        detailStr,
      };
    },
  });
</script>
<style lang="less" scoped>
  .j-select-row {
    @width: 82px;

    .left {
      width: calc(100% - @width - 8px);
    }

    .right {
      width: @width;
    }

    .full {
      width: 100%;
    }

    :deep(.ant-select-search__field) {
      display: none !important;
    }
  }
  .detailStr {
    margin: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>