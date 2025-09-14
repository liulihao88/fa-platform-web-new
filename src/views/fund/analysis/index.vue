<template>
  <!--引用表格-->
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
</template>

<script lang="ts" name="system-user" setup>
//ts语法
import {useRouter} from "vue-router";
const router = useRouter();
import { BasicTable, TableAction, ActionItem } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { columns, searchFormSchema } from './user.data';
import { listNoCareTenant } from './user.api';

// 列表页面公共参数、方法
const {tableContext } = useListPage({
  designScope: 'fund-list',
  tableProps: {
    title: '',
    api: listNoCareTenant,
    columns: columns,
    size: 'small',
    formConfig: {
      // labelWidth: 200,
      schemas: searchFormSchema,
    },
    actionColumn: {
      fixed: 'right',
      width: 180,
    },
    beforeFetch: (params) => {
      return Object.assign({ column: 'createTime', order: 'desc' }, params);
    },
  },
});

//注册table数据
const [registerTable] = tableContext;

/**
 * 资金事件处理
 */
async function handleEdit(record: Recordable) {
  router.push({ path: '/fund/cases', query: {caseId:record.id} });
}
/**
 * 资金分析
 */
async function handleDetail(record: Recordable) {

}

/**
 * 操作栏
 */
function getTableAction(record): ActionItem[] {
  return [
    {
      label: '数据文件处理',
      onClick: handleEdit.bind(null, record),
      // ifShow: () => hasPermission('system:user:edit'),
    },
    {
      label: '资金分析',
      onClick: handleDetail.bind(null, record),
      // ifShow: () => hasPermission('system:user:edit'),
    }
  ];
}
</script>

<style scoped></style>
