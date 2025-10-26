import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'id',
    resizable: true
  },
  {
    title: '案件名称',
    dataIndex: 'caseName',
    resizable: true
  },
  {
    title: '案由',
    dataIndex: 'caseReason',
    resizable: true
  },
  {
    title: '部门受案号',
    dataIndex: 'departmentCaseNumber',
    width: 80,
    resizable: true
  },
  {
    title: '卷宗是否同步',
    dataIndex: 'dossierSync',
    resizable: true
  },
  {
    title: '文件数量',
    dataIndex: 'fileCount',
    resizable: true
  },
  {
    title: '发票数量',
    dataIndex: 'invoiceCount',
    resizable: true
  },
  {
    title: '文件处理状态',
    dataIndex: 'fileProcessStatus',
    resizable: true
  },
  {
    title: '文件导入次数',
    dataIndex: 'fileImportCount',
    resizable: true
  },
  {
    title: '导入笔数',
    dataIndex: 'importCount',
    resizable: true
  },
  {
    title: '去重次数',
    dataIndex: 'deduplicationCount',
    resizable: true
  },
  {
    title: '受理时间',
    dataIndex: 'acceptTime',
    width: 80,
    resizable: true
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '案件名称',
    field: 'caseName',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    label: '案由',
    field: 'caseReason',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    label: '部门受案号',
    field: 'departmentCaseNumber',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'user_status',
      placeholder: '请选择状态',
      stringToNumber: true,
    },
   colProps: { span: 6 },
  },
  {
    label: '受理时间',
    field: 'fieldTime',
    component: 'RangeDate',
    componentProps: {
      datetime:true,
      valueType: 'Date',
    },
    colProps: { span: 6 },
  },
];



