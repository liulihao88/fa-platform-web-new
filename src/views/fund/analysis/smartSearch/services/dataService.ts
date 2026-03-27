import { message } from 'ant-design-vue';
import { 
  getCaseInfoById, 
  intelligentTableListApi, 
  standardCustomerApi,
  standardTransApi,
  standardNonBankCustomerApi,
  standardNonBankTransApi 
} from '../api';

// 获取案件信息
export const fetchCaseInfo = async (caseId: string, detail: Record<string, any>) => {
  try {
    const res = await getCaseInfoById({ caseId });
    Object.assign(detail, res);
  } catch (error) {
    console.error('获取案件信息失败:', error);
    message.error('获取案件信息失败，请稍后重试');
  }
};

// 获取智能筛选数据
export const fetchIntelligentList = async (
  caseId: string,
  selectedRowKeys: string[],
  conditionJson: any,
  pagination: any,
  dataSource: any,
  tableLoading: any,
  setPagination: Function
) => {
  try {
    tableLoading.value = true;
    const params = {
      caseId,
      ids: selectedRowKeys,
      conditionJson,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const response = await intelligentTableListApi(params);

    if (response && response.records) {
      dataSource.value = response.records;
      pagination.total = response.total || 0;
      setPagination({ total: response.total || 0 });
    } else {
      dataSource.value = [];
      pagination.total = 0;
      setPagination({ total: 0 });
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    setPagination({ total: 0 });
    message.error('获取数据失败，请稍后重试');
  } finally {
    tableLoading.value = false;
  }
};

// 加载选项卡数据
export const loadTabData = async (
  tabKey: string,
  caseId: string,
  currentRecord: any,
  bankCustomerDataSource: any,
  bankCustomerLoading: any,
  bankCustomerPagination: any,
  bankTransactionDataSource: any,
  bankTransactionLoading: any,
  bankTransactionPagination: any,
  nonBankCustomerDataSource: any,
  nonBankCustomerLoading: any,
  nonBankCustomerPagination: any,
  nonBankTransactionDataSource: any,
  nonBankTransactionLoading: any,
  nonBankTransactionPagination: any
) => {
  if (!currentRecord.value) return;

  try {
    let response;
    const params: any = {
      caseId,
      filePageId: currentRecord.value.caseFilePageId,
      rowNum: currentRecord.value.rowNum,
      pageNo: 1,
      pageSize: 10
    };

    // 设置loading状态
    switch (tabKey) {
      case 'bankCustomer':
        bankCustomerLoading.value = true;
        break;
      case 'bankTransaction':
        bankTransactionLoading.value = true;
        break;
      case 'nonBankCustomer':
        nonBankCustomerLoading.value = true;
        break;
      case 'nonBankTransaction':
        nonBankTransactionLoading.value = true;
        break;
    }

    // 加载数据
    switch (tabKey) { 
      case 'bankCustomer':
        // 银行客户信息需要客户号查询条件
        if (!currentRecord.value.customerCd) {
          message.warning('客户号为空，数据不完整');
          return;
        }
        params.customerCd = currentRecord.value.customerCd;
        response = await standardCustomerApi(params);
        bankCustomerDataSource.value = response.records || [];
        bankCustomerPagination.total = response.total || 0;
        break;

      case 'bankTransaction':
        if (!currentRecord.value.rowNum) {
          message.warning('行号为空，数据不完整');
          return;
        }
        response = await standardTransApi(params);
        bankTransactionDataSource.value = response.records || [];
        bankTransactionPagination.total = response.total || 0;
        break;

      case 'nonBankCustomer':
        // 非银行客户信息需要客户号查询条件
        if (!currentRecord.value.customerCd) {
          message.warning('客户号为空，数据不完整');
          return;
        }
        params.customerCd = currentRecord.value.customerCd;
        response = await standardNonBankCustomerApi(params);
        nonBankCustomerDataSource.value = response.records || [];
        nonBankCustomerPagination.total = response.total || 0;
        break;

      case 'nonBankTransaction':
        if (!currentRecord.value.rowNum) {
          message.warning('行号为空，数据不完整');
          return;
        }
        response = await standardNonBankTransApi(params);
        nonBankTransactionDataSource.value = response.records || [];
        nonBankTransactionPagination.total = response.total || 0;
        break;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败，请稍后重试');
  } finally {
    // 关闭对应的loading状态
    switch (tabKey) {
      case 'bankCustomer':
        bankCustomerLoading.value = false;
        break;
      case 'bankTransaction':
        bankTransactionLoading.value = false;
        break;
      case 'nonBankCustomer':
        nonBankCustomerLoading.value = false;
        break;
      case 'nonBankTransaction':
        nonBankTransactionLoading.value = false;
        break;
    }
  }
};

// 分页变化处理公共函数
export const handleTablePaginationChange = async (
  pagination: any,
  tabKey: string,
  caseId: string,
  currentRecord: any,
  bankCustomerDataSource: any,
  bankCustomerPagination: any,
  bankTransactionDataSource: any,
  bankTransactionPagination: any,
  nonBankCustomerDataSource: any,
  nonBankCustomerPagination: any,
  nonBankTransactionDataSource: any,
  nonBankTransactionPagination: any
) => {
  if (!currentRecord.value) return;

  try {
    // 更新分页参数
    switch (tabKey) {
      case 'bankCustomer':
        bankCustomerPagination.current = pagination.current;
        bankCustomerPagination.pageSize = pagination.pageSize;
        break;
      case 'bankTransaction':
        bankTransactionPagination.current = pagination.current;
        bankTransactionPagination.pageSize = pagination.pageSize;
        break;
      case 'nonBankCustomer':
        nonBankCustomerPagination.current = pagination.current;
        nonBankCustomerPagination.pageSize = pagination.pageSize;
        break;
      case 'nonBankTransaction':
        nonBankTransactionPagination.current = pagination.current;
        nonBankTransactionPagination.pageSize = pagination.pageSize;
        break;
    }

    // 构建参数
    const params: any = {
      caseId,
      filePageId: currentRecord.value.caseFilePageId,
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    // 根据tabKey添加特定参数
    switch (tabKey) {
      case 'bankCustomer':
        params.customerCd = currentRecord.value?.customerName;
        break;
      case 'bankTransaction':
        params.transAccoutNo = currentRecord.value?.transAccountNo;
        params.transNo = currentRecord.value?.transNo;
        break;
      case 'nonBankCustomer':
        params.customerCd = currentRecord.value?.customerName;
        break;
      case 'nonBankTransaction':
        params.transAccoutNo = currentRecord.value?.transAccountNo;
        params.transNo = currentRecord.value?.transNo;
        break;
    }

    // 加载数据
    let response;
    switch (tabKey) {
      case 'bankCustomer':
        response = await standardCustomerApi(params);
        bankCustomerDataSource.value = response.records || [];
        bankCustomerPagination.total = response.total || 0;
        break;
      case 'bankTransaction':
        response = await standardTransApi(params);
        bankTransactionDataSource.value = response.records || [];
        bankTransactionPagination.total = response.total || 0;
        break;
      case 'nonBankCustomer':
        response = await standardNonBankCustomerApi(params);
        nonBankCustomerDataSource.value = response.records || [];
        nonBankCustomerPagination.total = response.total || 0;
        break;
      case 'nonBankTransaction':
        response = await standardNonBankTransApi(params);
        nonBankTransactionDataSource.value = response.records || [];
        nonBankTransactionPagination.total = response.total || 0;
        break;
    }
  } catch (error) {
    console.error(`加载${tabKey}数据失败:`, error);
    message.error('加载数据失败，请稍后重试');
  }
};
