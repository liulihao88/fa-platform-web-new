import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'id',
  },
  {
    title: '案件名称',
    dataIndex: 'caseName',
  },
  {
    title: '案由',
    dataIndex: 'caseReason',
  },
  {
    title: '部门受案号',
    dataIndex: 'departmentCaseNumber',
    width: 80,
  },
  {
    title: '卷宗是否同步',
    dataIndex: 'dossierSync',
  },
  {
    title: '文件数量',
    dataIndex: 'fileCount',
  },
  {
    title: '发票数量',
    dataIndex: 'invoiceCount',
  },
  {
    title: '文件处理状态',
    dataIndex: 'fileProcessStatus',
  },
  {
    title: '文件导入次数',
    dataIndex: 'fileImportCount',
  },
  {
    title: '导入笔数',
    dataIndex: 'importCount',
  },
  {
    title: '去重次数',
    dataIndex: 'deduplicationCount',
  },
  {
    title: '受理时间',
    dataIndex: 'acceptTime',
    width: 80,
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
    label: '部门受理号',
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



