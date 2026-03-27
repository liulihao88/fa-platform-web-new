import { message } from 'ant-design-vue';
import { copyTextToClipboard } from '@/hooks/web/useCopyToClipboard';
import { fileContextInfo } from '../api';

// 复制卷宗信息
export const sendArchive = (archiveModalPreviewData: any) => {
  const success = copyTextToClipboard(archiveModalPreviewData.value);
  message[success ? 'success' : 'error'](success ? '复制成功！' : '复制失败！');
};

// 显示卷宗信息弹窗
export const showArchiveModal = async (
  caseId: string,
  selectedRowKeys: string[],
  conditionJson: any,
  pagination: any,
  archiveModalVisible: any,
  archiveModalPreviewData: any
) => {
  if (selectedRowKeys.length === 0) {
    message.warning('请先选择要生成的数据');
    return;
  }
  
  try {
    const params = {
      caseId,
      ids: selectedRowKeys,
      conditionJson,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };
    
    const response = await fileContextInfo(params);
    archiveModalVisible.value = true;
    archiveModalPreviewData.value = typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error) {
    console.error('生成卷宗信息失败:', error);
    message.error('生成卷宗信息失败，请稍后重试');
  }
};

// 重置所有分页参数
export const resetAllPagination = (
  bankCustomerPagination: any,
  bankTransactionPagination: any,
  nonBankCustomerPagination: any,
  nonBankTransactionPagination: any
) => {
  bankCustomerPagination.current = 1;
  bankCustomerPagination.total = 0;
  bankTransactionPagination.current = 1;
  bankTransactionPagination.total = 0;
  nonBankCustomerPagination.current = 1;
  nonBankCustomerPagination.total = 0;
  nonBankTransactionPagination.current = 1;
  nonBankTransactionPagination.total = 0;
};

// 关闭查看原信息弹窗
export const closeDetailModal = (
  detailModalVisible: any,
  bankCustomerPagination: any,
  bankTransactionPagination: any,
  nonBankCustomerPagination: any,
  nonBankTransactionPagination: any,
  bankCustomerDataSource: any,
  bankTransactionDataSource: any,
  nonBankCustomerDataSource: any,
  nonBankTransactionDataSource: any
) => {
  detailModalVisible.value = false;
  // 重置所有分页
  resetAllPagination(
    bankCustomerPagination,
    bankTransactionPagination,
    nonBankCustomerPagination,
    nonBankTransactionPagination
  );
  // 清空所有数据
  bankCustomerDataSource.value = [];
  bankTransactionDataSource.value = [];
  nonBankCustomerDataSource.value = [];
  nonBankTransactionDataSource.value = [];
};

// 显示查看原信息弹窗
export const showDetailModal = (
  record: any,
  detailModalVisible: any,
  activeTab: any,
  currentRecord: any,
  loadTabData: Function
) => {
  currentRecord.value = record;
  activeTab.value = 'bankCustomer';
  detailModalVisible.value = true;
  // 默认加载第一个页签数据
  loadTabData('bankCustomer');
};

// 选项卡切换处理
export const handleTabChange = (key: string, loadTabData: Function) => {
  loadTabData(key);
};
