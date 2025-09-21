import { defHttp } from '/@/utils/http/axios';

// 案件列表
export const caseListApi = (params) => defHttp.post({ url: '/fa/case/list', params });

// 案件详情
export const caseDetailApi = (params) => defHttp.post({ url: '/fa/faCaseInfo/getCaseInfoById', params });

// 案件文件列表
export const caseFileListApi = (params) => defHttp.post({ url: 'fa/casefile/list', params });

// 删除文件
export const deleteFileListApi = (params) => defHttp.post({ url: 'fa/casefile/deleteFile', params });

// 根据文件id查看转换结果
export const getFileConverResultApi = (params) => defHttp.post({ url: 'fa/casefile/getCaseFileTransInfo', params });

// 获取文件类型
export const getFileInfoItem = (params) => defHttp.get({ url: `fa/casefile/getFileInfo/${params.fileId}`, params });

// 涉案人列表
export const involvedPersonListApi = (params) => defHttp.post({ url: 'fa/caseInvolved/list', params });

export const updatePersonRelationApi = (params) => defHttp.post({ url: 'fa/caseInvolved/updateInvolvedType', params });
export const getInvolvedRelationApi = (params) => defHttp.post({ url: 'fa/caseInvolved/relationList', params });
export const getInvolvedPersonApi = (params) => defHttp.post({ url: 'fa/caseInvolved/involvedPersonList', params });


export const updateInvolvedPersonApi = (params) => defHttp.post({ url: 'fa/caseInvolved/saveOrUpdateInvolvedRelation', params });
export const saveEditBankApi = (params) => defHttp.post({ url: 'fa/casefile/updateOrg', params });
export const standardFileListApi = (params) => defHttp.post({ url: 'fa/caseStandardData/fileList', params });
export const standardSheetListApi = (params) => defHttp.post({ url: 'fa/caseStandardData/pageList', params });
export const standardTableApi = (params) => defHttp.post({ url: 'fa/caseStandardData/standardDataList', params });
export const repeatFileTableApi = (params) => defHttp.post({ url: 'fa/caseDuplicateData/list', params });
export const getCompanyOrPersonDetailApi = (params) => defHttp.post({ url: 'fa/caseInvolved/detail', params });
export const uploadFileApi = (params, isReturnResponse) => {
    return defHttp.uploadFile({ url: 'fa/casefile/upload' }, params, { isReturnResponse });
};
// 获取文件流信息，供预览使用
export const getFileStreamByFileId = (params) => defHttp.get({
    url: `fa/casefile/previewFile/${params.fileId}`,
    params,
    responseType: 'arraybuffer'
},{isReturnNativeResponse:true});