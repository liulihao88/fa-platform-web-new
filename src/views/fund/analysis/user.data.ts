import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'username',
  },
  {
    title: '案件名称',
    dataIndex: 'realname',
  },
  {
    title: '案由',
    dataIndex: 'avatar',
    customRender: render.renderAvatar,
  },
  {
    title: '部门受案号',
    dataIndex: 'sex',
    width: 80,
    sorter: true,
    customRender: ({ text }) => {
      return render.renderDict(text, 'sex');
    },
  },
  {
    title: '卷宗是否同步',
    dataIndex: 'birthday',
  },
  {
    title: '文件数量',
    dataIndex: 'phone',
  },
  {
    title: '发票数量',
    dataIndex: 'orgCodeTxt',
  },
  {
    title: '文件处理状态',
    dataIndex: 'fff',
  },
  {
    title: '文件导入次数',
    dataIndex: 'ddd',
  },
  {
    title: '导入笔数',
    dataIndex: 'nnn',
  },
  {
    title: '去重次数',
    dataIndex: 'cbb',
  },
  {
    title: '受理时间',
    dataIndex: 'aaa',
    width: 80,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '案件名称',
    field: 'username',
    component: 'JInput',
    colProps: { span: 6 },
  },
  {
    label: '案由',
    field: 'realname',
    component: 'JInput',
   colProps: { span: 6 },
  },
  {
    label: '部门受理号',
    field: 'sex',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'sex',
      placeholder: '请选择性别',
      stringToNumber: true,
    },
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
    field: 'time',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'user_status',
      placeholder: '请选择状态',
      stringToNumber: true,
    },
    colProps: { span: 6 },
  },
];



