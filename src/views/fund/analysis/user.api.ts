import { defHttp } from '/@/utils/http/axios';

// 案件列表
export const caseListApi = (params) => defHttp.post({ url: '/fa/case/list', params });

// 案件详情
export const caseDetailApi = (params) => defHttp.post({ url: '/fa/case/getCaseInfoById', params });

// 案件文件列表
export const caseFileListApi = (params) => defHttp.post({ url: 'fa/casefile/list', params });

// 删除文件
export const deleteFileListApi = (params) => defHttp.post({ url: 'fa/casefile/list', params });

// 根据文件id查看转换结果
export const getFileConverResultApi = (params) => defHttp.post({ url: 'fa/casefile/getCaseFileTransInfo', params });

// 上传文件
export const uploadFilesApi = (params) => defHttp.post({ url: 'fa/casefile/xxxxxxxxxxxx', params });

// 涉案人列表
export const involvedPersonListApi = (params) => defHttp.post({ url: 'fa/caseInvolved/list', params });

export const updatePersonRelationApi = (params) => defHttp.post({ url: 'fa/caseInvolved/updateInvolvedType', params });
export const getInvolvedPersonApi = (params) => defHttp.post({ url: 'fa/caseInvolved/relationList', params });
export const updateInvolvedPersonApi = (params) => defHttp.post({ url: 'fa/caseInvolved/saveOrUpdateInvolvedRelation', params });

export const standardFileListApi = (params) => defHttp.post({ url: 'fa/caseStandardData/fileList', params });
export const standardSheetListApi = (params) => defHttp.post({ url: 'fa/caseStandardData/pageList', params });
export const standardTableApi = (params) => defHttp.post({ url: 'fa/caseStandardData/standardDataList', params });
export const repeatFileTableApi = (params) => defHttp.post({ url: 'fa/caseDuplicateData/list', params });
