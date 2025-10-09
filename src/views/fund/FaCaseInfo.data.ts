import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
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
    dataIndex: 'caseReason',
       customRender: ({ text }) => {
           return text ||'--'
       },
   },
   {
    title: '部门受案号',
    align:"center",
    dataIndex: 'deptCaseCode',
       customRender: ({ text }) => {
           return text ||'--'
       },
   },
  {
    title: '受理时间',
    align:"center",
    dataIndex: 'processDate',
      customRender: ({ text }) => {
          return text ||'--'
      },
  },
  {
    title: '文件处理状态',
    align:"center",
    dataIndex: 'processStatus',
    customRender: ({ text }) => {
      return render.renderDict(text, 'fa_case_process_status');
    },
  },
   {
    title: '文件数量',
    align:"center",
    dataIndex: 'fileNum',
    customRender: ({ text }) => {
      return text ||'0'
    },
   },
   {
    title: '文件导入次数',
    align:"center",
    dataIndex: 'fileImportNum',
       customRender: ({ text }) => {
           return text ||'0'
       },
   },
   {
    title: '导入笔数',
    align:"center",
    dataIndex: 'importDataNum',
       customRender: ({ text }) => {
           return text ||'0'
       },
   },
   {
    title: '去重笔数',
    align:"center",
    dataIndex: 'repeatDataNum',
       customRender: ({ text }) => {
           return text ||'0'
       },
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
      label: "案件处理状态",
      field: 'processStatus',
      component: 'JDictSelectTag',
      componentProps: {
        //字典code配置，比如通过性别字典编码：sex，也可以使用demo,name,id 表名,名称,值的方式
        dictCode:'fa_case_process_status',
        //支持radio(单选按钮)、radioButton(单选按钮 btn风格)、select(下拉框)
        type:'select'
  },
 	},
	{
      label: "受理时间",
      field: 'processDate',
      component: 'DatePicker',
      componentProps: {
         showTime:false,
         valueFormat: 'YYYY-MM-DD'
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
  {
    label: '受理时间',
    field: 'processDate',
    component: 'DatePicker',
    componentProps: {
      showTime:false,
      valueFormat: 'YYYY-MM-DD'
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
  caseCode: {title: '案件名称',order: 0,view: 'text', type: 'string',},
  caseReason: {title: '案由',order: 1,view: 'text', type: 'string',},
  deptCaseCode: {title: '部门受案号',order: 2,view: 'text', type: 'string',},
  processDate: {title: '受理时间',order: 8,view: 'datetime', type: 'string',},
  processStatus: {title: '案件处理状态',order: 4,view: 'text', type: 'string',},
  fileNum: {title: '文件数量',order: 3,view: 'number', type: 'number',},
  fileImportNum: {title: '文件导入次数',order: 5,view: 'number', type: 'number',},
  importDataNum: {title: '导入笔数',order: 6,view: 'number', type: 'number',},
  repeatDataNum: {title: '去重笔数',order: 7,view: 'text', type: 'string',},

};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
