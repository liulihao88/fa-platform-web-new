import { message } from 'ant-design-vue';
import { useMethods } from "@/hooks/system/useMethods";
import { exportIntelligentPageData } from '../api';

const { handleExportXls } = useMethods();

// 导出数据公共函数
export const exportData = (
  caseId: string,
  ids: string[],
  fileName: string,
  conditionJson: any,
  pagination: any,
  exportAll = false
) => {
  const params = {
    caseId,
    ids,
    conditionJson,
    pageNo: exportAll ? 1 : pagination.current,
    pageSize: exportAll ? pagination.total : pagination.pageSize,
    ...(exportAll && { exportAll: true })
  };
  handleExportXls(fileName, exportIntelligentPageData, params, 'post');
};

// 导出本页数据
export const exportCurrentPage = (
  caseId: string,
  dataSource: any[],
  fileName: string,
  conditionJson: any,
  pagination: any
) => {
  exportData(caseId, dataSource.map(v => v.id), fileName, conditionJson, pagination);
};

// 导出选择数据
export const exportMarkedData = (
  caseId: string,
  selectedRowKeys: string[],
  fileName: string,
  conditionJson: any,
  pagination: any
) => {
  if (selectedRowKeys.length === 0) {
    message.warning('请先选择要导出的数据');
    return;
  }
  exportData(caseId, selectedRowKeys, fileName, conditionJson, pagination);
};

// 导出全部数据
export const exportAllData = (
  caseId: string,
  fileName: string,
  conditionJson: any,
  pagination: any
) => {
  exportData(caseId, [], fileName, conditionJson, pagination, true);
};
