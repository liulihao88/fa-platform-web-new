import { defHttp } from '/@/utils/http/axios';

// 上传列表
export const caseListApi = (params) => defHttp.post({ url: '/fa/case/list', params });

// 上传详情
export const caseDetailApi = (params) => defHttp.post({ url: '/fa/faCaseInfo/getCaseInfoById', params });

// 上传文件列表
export const caseFileListApi = (params) => defHttp.post({ url: '/fa/casefile/list', params });

// 删除文件
export const deleteFileListApi = (params) => defHttp.post({ url: '/fa/casefile/deleteFile', params });

// 确认转换文件
export const convertFileListApi = (params) => defHttp.post({ url: '/fa/faCaseInfo/confirmCaseInfo', params });

// 根据文件id查看转换结果
export const getFileConverResultApi = (params) => defHttp.post({ url: '/fa/casefile/getCaseFileTransInfo', params });

// 获取文件类型
export const getFileInfoItem = (params) => defHttp.get({ url: `/fa/casefile/getFileInfo/${params.fileId}`, params });

// 涉案人列表
export const involvedPersonListApi = (params) => defHttp.post({ url: '/fa/caseInvolved/list', params });

export const updatePersonRelationApi = (params) => defHttp.post({ url: '/fa/caseInvolved/updateInvolvedType', params });
export const getInvolvedRelationApi = (params) => defHttp.post({ url: '/fa/caseInvolved/relationList', params });
export const getInvolvedPersonApi = (params) => defHttp.post({ url: '/fa/caseInvolved/involvedPersonList', params });
export const getAnalyzesultApi = (params) => defHttp.post({ url: '/fa/caseStandardData/getParseDataList', params });
export const getParseStandardEntityApi = (params) => defHttp.post({ url: '/fa/caseStandardData/getParseStandardEntityList', params });
export const getParseStandardTransApi = (params) => defHttp.post({ url: '/fa/caseStandardData/getParseStandardTransList', params });
export const getParseStandardOrderApi = (params) => defHttp.post({ url: '/fa/caseStandardData/getParseStandardOrderList', params });


export const updateInvolvedPersonApi = (params) => defHttp.post({ url: '/fa/caseInvolved/saveOrUpdateInvolvedRelation', params });
export const saveEditBankApi = (params) => defHttp.post({ url: '/fa/casefile/updateOrg', params });
export const standardFileListApi = (params) => defHttp.post({ url: '/fa/caseStandardData/fileList', params });
export const standardSheetListApi = (params) => defHttp.post({ url: '/fa/caseStandardData/pageList', params });
export const standardTableApi = (params) => defHttp.post({ url: '/fa/caseStandardData/standardDataList', params });

export const standardCustomerApi = (params) => defHttp.post({ url: '/fa/caseStandardData/bankCustomerPageList', params });
export const standardTransApi = (params) => defHttp.post({ url: '/fa/caseStandardData/bankTransPageList', params });
export const standardNonBankCustomerApi = (params) => defHttp.post({ url: '/fa/caseStandardData/nonBankCustomerPageList', params });
export const standardNonBankTransApi = (params) => defHttp.post({ url: '/fa/caseStandardData/nonBankTransPageList', params });


export const repeatFileTableApi = (params) => defHttp.post({ url: '/fa/caseDuplicateData/list', params });
export const getCompanyOrPersonDetailApi = (params) => defHttp.post({ url: '/fa/caseInvolved/detail', params });
export const uploadFileApi = (params, isReturnResponse) => {
    return defHttp.uploadFile({ url: '/fa/casefile/upload' }, params, { isReturnResponse });
};
// 获取文件流信息，供预览使用
export const getFileStreamByFileId = (params,responseType='arraybuffer') => defHttp.get({
    url: `/fa/casefile/previewFile/${params.fileId}`,
    responseType:responseType
},{isReturnNativeResponse:true});

export const exportDataApi = '/fa/caseDuplicateData/exportXls'


export const updateFileOrg = (params) => defHttp.post({ url: '/fa/casefile/updateOrg', params });



// 智能筛选列表
export const intelligentTableListApi = (params) => defHttp.post({ url: '/fa/caseStandardData/transList', params });
// 根据文件ID查询文件确认信息
export const getFileConfirmInfo = (params) => defHttp.post({ url: '/fa/casefile/getPropertyByFileId', params });
// 导出数据
export const exportIntelligentPageData = '/fa/caseStandardData/exportXls'

// 查询条件列表
export const searchConditionListApi = (params) => defHttp.post({ url: '/fa/faQueryRecord/getQueryRecordList', params });
// 保存查询条件
export const saveQueryConditionApi = (params) => defHttp.post({ url: '/fa/faQueryRecord/add', params });
// 文件文本预览
export const fileContextInfo = (params) => defHttp.post({ url: '/fa/caseStandardData/generateTransText', params });
