import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
   {
    title: '案件名称',
    align:"center",
    dataIndex: 'caseCode'
   },
   {
    title: '案由',
    align:"center",
    dataIndex: 'caseReason'
   },
   {
    title: '部门受案号',
    align:"center",
    dataIndex: 'deptCaseCode'
   },
   {
    title: '文件数量',
    align:"center",
    dataIndex: 'fileNum'
   },
   {
    title: '文件处理状态',
    align:"center",
    dataIndex: 'processStatus'
   },
   {
    title: '文件导入次数',
    align:"center",
    dataIndex: 'fileImportNum'
   },
   {
    title: '导入笔数',
    align:"center",
    dataIndex: 'importDataNum'
   },
   {
    title: '去重笔数',
    align:"center",
    dataIndex: 'repeatDataNum'
   },
   {
    title: '受理时间',
    align:"center",
    dataIndex: 'processDate'
   },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
	{
      label: "案件名称",
      field: 'caseCode',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "案由",
      field: 'caseReason',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "部门受案号",
      field: 'deptCaseCode',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "文件处理状态",
      field: 'processStatus',
      component: 'Input',
      //colProps: {span: 6},
 	},
	{
      label: "受理时间",
      field: 'processDate',
      component: 'DatePicker',
      componentProps: {
         showTime:true,
         valueFormat: 'YYYY-MM-DD HH:mm:ss'
       },
      //colProps: {span: 6},
 	},
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '案件名称',
    field: 'caseCode',
    component: 'Input',
  },
  {
    label: '案由',
    field: 'caseReason',
    component: 'Input',
  },
  {
    label: '部门受案号',
    field: 'deptCaseCode',
    component: 'Input',
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
  caseCode: {title: '案件名称',order: 0,view: 'text', type: 'string',},
  caseReason: {title: '案由',order: 1,view: 'text', type: 'string',},
  deptCaseCode: {title: '部门受案号',order: 2,view: 'text', type: 'string',},
  fileNum: {title: '文件数量',order: 3,view: 'number', type: 'number',},
  processStatus: {title: '文件处理状态',order: 4,view: 'text', type: 'string',},
  fileImportNum: {title: '文件导入次数',order: 5,view: 'number', type: 'number',},
  importDataNum: {title: '导入笔数',order: 6,view: 'number', type: 'number',},
  repeatDataNum: {title: '去重笔数',order: 7,view: 'text', type: 'string',},
  processDate: {title: '受理时间',order: 8,view: 'datetime', type: 'string',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}