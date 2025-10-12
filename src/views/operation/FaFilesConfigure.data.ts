import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    resizable: true,
    customRender: ({ record,index }) => {
      return index+1
    },
  },
  {
    title: '案件名称',
    dataIndex: 'caseName',
    width: 200,
    resizable: true,
  },
  {
    title: '源文件',
    dataIndex: 'sourceFile',
    width: 200,
    resizable: true,
  },
  {
    title: '文件夹',
    dataIndex: 'folder',
    key: 'folder',
    width: 150,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    resizable: true,
    customRender: ({ text }) => {
      return render.renderDict(text, 'fa_file_process_status');
    },
  },
  {
    title: '所属机构',
    dataIndex: 'organization',
    width: 80,
    resizable: true,
    customRender: ({ record }) => {
      return record.organization || '--'
    },
  },
  {
    title: '返回信息',
    dataIndex: 'returnInfo',
    width: 150,
    resizable: true,
    customRender: ({ record }) => {
      return record.returnInfo || '--'
    },
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    width: 150,
    resizable: true,
  },
  {
    title: '成功时间',
    dataIndex: 'successTime',
    width: 150,
    resizable: true,
    customRender: ({ record }) => {
      return record.successTime || '--'
    },
  },
];

// 高级查询数据
export const superQuerySchema = {
  regionFld: {title: '数据类别',order: 0,view: 'number', type: 'number',},
  metaData: {title: '标准数据',order: 1,view: 'text', type: 'string',},
  dataFlag: {title: '标志位',order: 2,view: 'text', type: 'string',},
  isSpecialModel: {title: '特定模型',order: 3,view: 'number', type: 'number',},
  isSpecialOrg: {title: '特定机构',order: 4,view: 'number', type: 'number',},
  isSpecialFile: {title: '特定文件',order: 5,view: 'number', type: 'number',},
  dataType: {title: '数据类型',order: 6,view: 'text', type: 'string',},
  dataNameEng: {title: '字段名称',order: 7,view: 'text', type: 'string',},
  ifToUnify: {title: '是否需统一',order: 8,view: 'number', type: 'number',},
  ifToUse: {title: '启用标志',order: 9,view: 'number', type: 'number',},
  alias: {title: '别名',order: 10,view: 'text', type: 'string',},
  deleteStatus: {title: '删除状态',order: 11,view: 'text', type: 'string',},
  deleteTime: {title: '删除时间',order: 12,view: 'date', type: 'string',},
};
