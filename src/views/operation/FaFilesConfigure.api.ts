import { defHttp } from '/@/utils/http/axios';

export const list = (params) => defHttp.post({ url:'/fa/casefile/getCaseNameFileList', params });
export const fileDetailApi = (params) => defHttp.post({ url:'/fa/casefile/getCaseNameFileById', params });

export const errorHandlerListApi = (params) => defHttp.get({ url:'/fa/faErrorMessage/list', params });
export const errorHandlerConfirmApi = (params) => defHttp.post({ url:'/fa/faErrorMessage/errorProcess', params });
export const configFileListApi = (params) => defHttp.get({ url:'/fa/faFilesConfigure/list', params });
export const updateConfigFileApi = (params) => defHttp.post({ url:'/fa/faFilesConfigure/edit', params });
export const addConfigFileApi = (params) => defHttp.post({ url:'/fa/faFilesConfigure/add', params });

