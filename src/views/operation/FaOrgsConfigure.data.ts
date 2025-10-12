import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '机构编码',
    align:"center",
    resizable: true,
    dataIndex: 'orgCd'
   },
   {
    title: '名称',
    align:"center",
    resizable: true,
    dataIndex: 'orgName'
   },
   {
    title: '简称',
    align:"center",
    resizable: true,
    dataIndex: 'names'
   },
   {
    title: '别名',
    align:"center",
    resizable: true,
    dataIndex: 'alias'
   },
   {
    title: '注释',
    align:"center",
    resizable: true,
    dataIndex: 'commonts'
   },
   {
    title: '种类',
    align:"center",
    resizable: true,
    dataIndex: 'orgType'
   },
   {
    title: '启用标志',
    align:"center",
    resizable: true,
    dataIndex: 'ifToUse'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "机构编码",
      field: 'orgCd',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "名称",
      field: 'orgName',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "别名",
      field: 'alias',
      component: 'Input',
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '机构编码',
    field: 'orgCd',
    component: 'Input',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
  {
    label: '名称',
    field: 'orgName',
    component: 'Input',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
  {
    label: '简称',
    field: 'names',
    component: 'Input',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
  {
    label: '别名',
    field: 'alias',
    component: 'Input',
  },
  {
    label: '注释',
    field: 'commonts',
    component: 'Input',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
  {
    label: '种类',
    field: 'orgType',
    component: 'InputNumber',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
  {
    label: '启用标志',
    field: 'ifToUse',
    component: 'InputNumber',
    //动态禁用，values代表当前表单的值，返回 true或false
    dynamicDisabled: ({ values }) => {
      return values.id != ''&& values.id != undefined;
    },
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];

// 高级查询数据
export const superQuerySchema = {
  orgCd: {title: '机构编码',order: 0,view: 'text', type: 'string',},
  orgName: {title: '名称',order: 1,view: 'text', type: 'string',},
  names: {title: '简称',order: 2,view: 'text', type: 'string',},
  alias: {title: '别名',order: 3,view: 'text', type: 'string',},
  commonts: {title: '注释',order: 4,view: 'text', type: 'string',},
  orgType: {title: '种类',order: 5,view: 'number', type: 'number',},
  ifToUse: {title: '启用标志',order: 6,view: 'number', type: 'number',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
