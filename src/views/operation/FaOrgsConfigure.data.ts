import { BasicColumn } from '/@/components/Table'
import { FormSchema } from '/@/components/Table'
import { rules } from '/@/utils/helper/validator'
import { render } from '/@/utils/common/renderUtils'
import { getWeekMonthQuarterYear } from '/@/utils'
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '机构官方名称',
    align: 'center',
    resizable: true,
    dataIndex: 'orgName',
  },
  {
    title: '通常叫法',
    align: 'center',
    resizable: true,
    dataIndex: 'names',
  },
  {
    title: '别名',
    align: 'center',
    resizable: true,
    dataIndex: 'alias',
  },
  {
    title: '注释',
    align: 'center',
    resizable: true,
    dataIndex: 'commonts',
  },
  {
    title: '种类',
    align: 'center',
    resizable: true,
    dataIndex: 'orgType',
    customRender: ({ text }) => {
      if (text === 1) {
        return '银行'
      } else if (text === 2) {
        return '非银行'
      } else {
        return text
      }
    },
  },
]
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '机构名称',
    field: 'orgName',
    component: 'Input',
    //colProps: {span: 6},
  },
]
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '机构官方名称',
    field: 'orgName',
    component: 'Input',
    rules: [{ required: true }],
    //动态禁用，values代表当前表单的值，返回 true或false
    // dynamicDisabled: ({ values }) => {
    //   return values.id != ''&& values.id != undefined;
    // },
  },
  {
    label: '通常叫法',
    field: 'names',
    component: 'Input',
    rules: [{ required: true }],
    //动态禁用，values代表当前表单的值，返回 true或false
    // dynamicDisabled: ({ values }) => {
    //   return values.id != ''&& values.id != undefined;
    // },
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
    // dynamicDisabled: ({ values }) => {
    //   return values.id != ''&& values.id != undefined;
    // },
  },
  {
    label: '种类',
    field: 'orgType',
    component: 'Select',
    componentProps: {
      options: [
        { label: '银行', value: 1 },
        { label: '非银行', value: 2 },
      ],
    },
    defaultValue: '',
    rules: [{ required: true }],
    //动态禁用，values代表当前表单的值，返回 true或false
    // dynamicDisabled: ({ values }) => {
    //   return values.id != ''&& values.id != undefined;
    // },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
]

// 高级查询数据
export const superQuerySchema = {
  orgName: { title: '机构官方名称', order: 1, view: 'text', type: 'string' },
  names: { title: '通常叫法', order: 2, view: 'text', type: 'string' },
  alias: { title: '别名', order: 3, view: 'text', type: 'string' },
  commonts: { title: '注释', order: 4, view: 'text', type: 'string' },
  orgType: { title: '种类', order: 5, view: 'number', type: 'number' },
}

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema
}
