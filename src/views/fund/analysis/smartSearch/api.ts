import { defHttp } from '/@/utils/http/axios';
export const exportIntelligentPageData = '/fa/caseStandardData/exportXls'
/**
 * 获取智能查询条件列表
 */
export const getSmartSearchList = (id) => {
  return defHttp.post({
    url: '/fa/faQueryRecord/getQueryRecordList',
    data: { caseId: id },
  });
};
/**
 * 新增智能查询条件
 */
export const addSmartSearch = (data) => {
  return defHttp.post({
    url: '/fa/faQueryRecord/add',
    data,
  });
};
/**
 * 获取案件详情
 */
export const getCaseInfoById = (data) => defHttp.post(
  { url: '/fa/faCaseInfo/getCaseInfoById', data }
);
/**
 * 获取智能筛选列表
 */
export const intelligentTableListApi = (data) => defHttp.post(
  { url: '/fa/caseStandardData/transList', data }
);
export const involvedPersonListApi = (params) => defHttp.post({ url: '/fa/caseInvolved/list', params });
export const updatePersonRelationApi = (params) => defHttp.post({ url: '/fa/caseInvolved/updateInvolvedType', params });
export const getInvolvedRelationApi = (params) => defHttp.post({ url: '/fa/caseInvolved/relationList', params });
export const getInvolvedPersonApi = (params) => defHttp.post({ url: '/fa/caseInvolved/involvedPersonList', params });
export const updateInvolvedPersonApi = (params) => defHttp.post({ url: '/fa/caseInvolved/saveOrUpdateInvolvedRelation', params });
export const getCompanyOrPersonDetailApi = (params) => defHttp.post({ url: '/fa/caseInvolved/detail', params });
export const fileContextInfo = (params) => defHttp.post({ url: '/fa/caseStandardData/generateTransText', params });