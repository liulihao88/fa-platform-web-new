import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';

//列表数据
export const columns: BasicColumn[] = [
   {
    title: '案件名称',
    align:"center",
    dataIndex: 'caseCode',
     resizable: true
   },
   {
    title: '案由',
    align:"center",
    resizable: true,
    dataIndex: 'caseReason',
       customRender: ({ text }) => {
           return text ||'--'
       },
   },
   {
    title: '部门受案号',
    align:"center",
    resizable: true,
    dataIndex: 'deptCaseCode',
       customRender: ({ text }) => {
           return text ||'--'
       },
   },
  {
    title: '受理时间',
    align:"center",
    resizable: true,
    dataIndex: 'processDate',
      customRender: ({ text }) => {
          return text ||'--'
      },
  },
  {
    title: '文件处理状态',
    align:"center",
    resizable: true,
    dataIndex: 'processStatus',
    customRender: ({ text }) => {
      return render.renderDict(text, 'fa_case_process_status');
    },
  },
  {
    title: '处理进度',
    align:"center",
    resizable: true,
    dataIndex: 'processStatus',
    customRender: ({ text }) => {
      // 进度条显示规则
      const progressMap = {
        '000': 0,
        '001': 20,
        '010': 40,
        '002': 60,
        '003': 80,
        '004': 100
      };
      
      const percent = progressMap[text] || 0;
      
      return h('div', { style: 'display: flex; align-items: center;' }, [
        h('div', { 
          style: 'width: 100%; background-color: #f5f5f5; border-radius: 10px; overflow: hidden;'
        }, [
          h('div', {
            style: `width: ${percent}%; height: 20px; background: linear-gradient(90deg, #1890ff, #40a9ff); transition: width 0.3s; text-align: center; line-height: 20px; color: white; font-size: 12px;`,
          }, `${percent}%`)
        ])
      ]);
    }
  },
   {
    title: '文件数量',
    align:"center",
    resizable: true,
    dataIndex: 'fileNum',
    customRender: ({ text }) => {
      return text ||'0'
    },
   },
    {
      title: '成功数量',
      align:"center",
      resizable: true,
      dataIndex: 'succFileNum',
      customRender: ({ text }) => {
        return text ||'0'
      },
    },
   {
    title: '失败数量',
    align:"center",
    resizable: true,
    dataIndex: 'errorFileNum',
       customRender: ({ text }) => {
           return text ||'0'
       },
   },
   {
    title: '导入笔数',
    align:"center",
    resizable: true,
    dataIndex: 'importDataNum',
       customRender: ({ text }) => {
           return text ||'0'
       },
   },
   {
    title: '去重笔数',
    align:"center",
    resizable: true,
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
    label: '受理时间',
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
