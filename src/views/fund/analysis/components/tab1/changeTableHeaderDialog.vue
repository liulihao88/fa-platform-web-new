<script setup lang="ts">
import { ref, getCurrentInstance, computed, unref, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { useAttrs } from '/@/hooks/core/useAttrs';
import BasicTable from '/@/components/Table/src/BasicTable.vue'
import { BasicModal, useModalInner } from '/@/components/Modal';
import { useSelectBiz } from '/@/components/Form/src/jeecg/hooks/useSelectBiz';
import { getFileConfigPageListApi } from '/@/views/fund/analysis/user.api';

const props = defineProps({
 headerDialogObject: {
    type: Object,
    required: true
 }
})
const attrs = useAttrs();
const ROW_KEY= 'metaData'

const emits = defineEmits(['register', 'getSelectResult']);
const [register, { closeModal }] = useModalInner()

//定义表格列
const columns = [
  {
    title: '标准数据',
    dataIndex: 'metaData',
    width: 120,
    align: 'left',
  },
  {
    title: '别名',
    dataIndex: 'alias',
    align: 'left',
  },
];
const searchInfo = ref({
  orgCode: '',
  mappingTitle: '',
})
//查询form
const formConfig = {
  baseColProps: {
    xs: 24,
    sm: 10,
    md: 10,
    lg: 10,
    xl: 10,
    xxl: 10,
  },
  //update-begin-author:liusq date:2023-10-30 for: [issues/5514]组件页面显示错位
  actionColOptions: {
      xs: 24,
      sm: 8,
      md: 8,
      lg: 8,
      xl: 8,
      xxl: 8,
  },
  //update-end-author:liusq date:2023-10-30 for: [issues/5514]组件页面显示错位
  schemas: [
    {
      label: '标准数据',
      field: 'metaData',
      component: 'JInput',
      colProps: { span: 14 },
    }
  ],
};
//表格配置
const config = {
  canResize: false,
  bordered: true,
  size: 'small',
  // 设置为单选模式
  rowSelection: {
    type: 'radio'
  },
  rowKey: ROW_KEY,
  // 添加分页配置
  pagination: {
    pageSize: 10,
  },
  // 确保查询功能正常工作
  useSearchForm: true,
  showTableSetting: false,
  clickToRowSelect: true, // 改为true，允许点击行选择
  showIndexColumn: true,
  showSelected: true,
  // 明确指定为单选模式
  isRadioSelection: true,
};
const getBindValue = Object.assign({}, unref(props), unref(attrs), config);
console.log(`96 getBindValue`, getBindValue);
// 显式传递emit参数以确保事件通信正常
const [{ rowSelection, indexColumnProps, getSelectResult, handleDeleteSelected, selectRows, reset, onSelectChange, selectValues }] = useSelectBiz(
  getFileConfigPageListApi,
  getBindValue,
  emits
);

const dataSource = ref([
  
])

watch(()=>props.headerDialogObject, (val)=>{
  searchInfo.value.orgCode = val.orgCode;
  searchInfo.value.mappingTitle = val.mappingTitle;
  selectValues.value = [val.colText];
  selectValues.change = true;
}, {
  deep: true,
  immediate: true
})



 /**
 * 确定选择
 */
function handleOk() {
  getSelectResult((options, values) => {
      // 添加调试信息
      console.log('options:', options);
      console.log('values:', values);
      // 检查是否选择了数据 - 更全面的检查
      const hasSelection = values && (
        (Array.isArray(values) && values.length > 0) || 
        (typeof values === 'string' && values.trim() !== '') ||
        (typeof values === 'number') ||
        (typeof values === 'object' && values !== null && Object.keys(values).length > 0)
      );
      
      // 直接使用返回的单个选项和值
      let resultOptions = options;
      let resultValues = values;
      console.log('resultOptions', resultOptions);
      console.log('resultValues', resultValues);
      //回传选项和已选择的值
      //关闭弹窗
      emits('getSelectResult', resultValues, props.headerDialogObject)
      closeModal();
    });
}
/**
   * 处理搜索信息
   */
  function handleSearchInfoFn(searchInfo) {
    console.log(`27 searchInfo`, searchInfo);
    return searchInfo;
  }

// 解决弹窗层级问题
const modalClassName = computed(() => {
  // 如果在字段映射模态框中打开，则添加higher层级类名
  if (document.querySelector('.title-config-modal')) {
    return 'higher-modal';
  }
  return '';
});


</script>

<template>
  <div>
  <BasicModal 
    :modalClassName="modalClassName" 
    @register="register" 
    title="修改配置列" 
    width="800px"
    @ok="handleOk"
    destroyOnClose
  >
    <g-title title="原字段:" type="simple" l="24">
        <span>{{ props.headerDialogObject?.originColText }}</span>
          <a-button size="small" type="primary" @click="reset()" style="margin-left: 10px">清除选择</a-button>
      </g-title>
      <!-- :dataSource="props.headerDialogObject.titleConfigOptions" -->
       <!-- {{ dataSource }} -->
    <BasicTable
      ref="tableRef"
      :dataSource="dataSource"
      :api="getFileConfigPageListApi"
      :columns="columns"
      v-bind="getBindValue"
      :searchInfo="searchInfo"
      :rowSelection="rowSelection"
      :formConfig="formConfig"
      :handleSearchInfoFn="handleSearchInfoFn"
    >
    </BasicTable>
  </BasicModal>
  </div>
</template>
