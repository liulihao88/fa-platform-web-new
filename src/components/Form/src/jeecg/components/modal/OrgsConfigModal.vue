<template>
  <!-- 增加modalClassName解决弹窗层级问题 -->
  <BasicModal 
    :modalClassName="modalClassName" 
    @register="register" 
    :title="modalTitle" 
    width="800px"
    @ok="handleOk"
    destroyOnClose
  >
    <BasicTable
      ref="tableRef"
      :columns="columns"
      :api="list"
      v-bind="getBindValue"
      :searchInfo="searchInfo"
      :rowSelection="rowSelection"
      :formConfig="formConfig"
      :beforeFetch="beforeFetch"
      :handleSearchInfoFn="handleSearchInfoFn"
    >
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, computed, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useSelectBiz } from '/@/components/Form/src/jeecg/hooks/useSelectBiz';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { selectProps } from '/@/components/Form/src/jeecg/props/props';
  import { list } from '/@/views/operation/FaOrgsConfigure.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'OrgsConfigModal',
    components: {
      //此处需要异步加载BasicTable
      BasicModal,
      BasicTable: createAsyncComponent(() => import('/@/components/Table/src/BasicTable.vue'), {
        loading: true,
      }),
    },
    props: {
      ...selectProps,
      //选择框标题
      modalTitle: {
        type: String,
        default: '银行机构选择',
      },
    },
    emits: ['register', 'getSelectResult', 'close'],
    setup(props, { emit }) {
      const tableRef = ref();
      const { createMessage } = useMessage();
      
      //注册弹框
      const [register, { closeModal }] = useModalInner();
      const attrs = useAttrs();
      //表格配置
      const config = {
        canResize: false,
        bordered: true,
        size: 'small',
        //改成读取rowKey,自定义传递参数
        rowKey: props.rowKey,
        // 设置为单选模式
        rowSelection: {
          type: 'radio'
        },
        // 添加分页配置
        pagination: {
          pageSize: 10,
        },
        // 确保查询功能正常工作
        useSearchForm: true,
        showTableSetting: false,
        clickToRowSelect: true, // 改为true，允许点击行选择
        showIndexColumn: true,
        // 明确指定为单选模式
        isRadioSelection: true,
      };
      const getBindValue = Object.assign({}, unref(props), unref(attrs), config);
      // 显式传递emit参数以确保事件通信正常
      const [{ rowSelection, visibleChange, indexColumnProps, getSelectResult, handleDeleteSelected, selectRows }] = useSelectBiz(
        list,
        getBindValue,
        emit
      );
      const searchInfo = ref(props.params);
      
      // 解决弹窗层级问题
      const modalClassName = computed(() => {
        // 如果在字段映射模态框中打开，则添加higher层级类名
        if (document.querySelector('.title-config-modal')) {
          return 'higher-modal';
        }
        return '';
      });
      
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
          //{
          // label: '机构编码',
          //  field: 'orgCd',
          //  component: 'JInput',
          //  colProps: { span: 10 },
          //},
          {
            label: '机构名称',
            field: 'orgName',
            component: 'JInput',
            colProps: { span: 14 },
          }
          //{
          //  label: '别名',
          //  field: 'alias',
          //  component: 'JInput',
          //  colProps: { span: 10 },
          // },
        ],
      };
      //定义表格列
      const columns = [
        //{
        //  title: '机构编码',
        //  dataIndex: 'orgCd',
        //  width: 180,
        //  align: 'left',
        //},
        {
          title: '机构名称',
          dataIndex: 'orgName',
          width: 180,
          align: 'left',
        },
        //{
        //  title: '常用名称',
        //  dataIndex: 'names',
        //  width: 180,
        //},
        {
          title: '别名',
          dataIndex: 'alias',
          align: 'left',
          width: 180,
        },
      ];
      
      /**
       * 处理查询前的数据
       */
      function beforeFetch(params) {
        return params;
      }
      
      /**
       * 处理搜索信息
       */
      function handleSearchInfoFn(searchInfo) {
        return searchInfo;
      }

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
          
          if (!hasSelection) {
            // 没有选择数据，提示用户
            createMessage.warning(' 必须选择一个所属银行/支付公司');
            return;
          }
          
          // 直接使用返回的单个选项和值
          let resultOptions = options;
          let resultValues = values;
          console.log('resultOptions', resultOptions);
          console.log('resultValues', resultValues);
          //回传选项和已选择的值
          emit('getSelectResult', resultOptions, resultValues);
          //关闭弹窗
          closeModal();
        });
      }
      
      return {
        list,
        tableRef,
        handleOk,
        register,
        visibleChange,
        getBindValue,
        formConfig,
        indexColumnProps,
        columns,
        rowSelection,
        selectRows,
        handleDeleteSelected,
        searchInfo,
        beforeFetch,
        handleSearchInfoFn,
        modalClassName,
        createMessage
      };
    },
  });
</script>

<style lang="less" scoped>
// 解决弹窗层级问题的样式
:deep(.higher-modal) {
  z-index: 1060 !important;
}
</style>
