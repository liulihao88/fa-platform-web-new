import request, { uploadFile } from '@/utils/request'

// 定时任务列表返回类型
interface commonListResponse {
  records: any[]
  total: number
}

// 案件列表案件列表

// fa / faCaseInfo / list ? column = createTime & order=desc & pageNo=1 & pageSize=10 & _t=1772678940540

export const getFaCaseInfoList = (params) => {
  return request('fa/faCaseInfo/list', { params: params })
}

/**
 * 数据处理
 */

// 案件详情
export const getCaseInfoById = (data) => {
  return request('fa/faCaseInfo/getCaseInfoById', 'post', {
    data: data,
  })
}

// fa_case_process_status 上传文件状态列表
export const getCommonDictionary = (key) => {
  return request(`sys/dict/getDictItems/${key}`)
}

/**
 * 1. 上传文件
 *
 * */

// 上传文件列表
// ?caseId=2019233950631804930&folder=&fileName=&pageNo=1&pageSize=10&_t=1773039731359
export const getCasefileList = (params) => {
  return request(`fa/casefile/pageList`, {
    params: params,
  })
}

// 删除文件
export const deleteCasefile = (data) => {
  return request(`fa/casefile/deleteFile`, 'post', {
    data: data,
  })
}

// 字段映射 -> 文件信息
export const getCaseFileTransInfo = (data) => {
  return request(`fa/casefile/getCaseFileTransInfo`, 'post', {
    data: data,
  })
}

// 字段映射 -> 根据fileId查询所属银行/支付公司
export const queryFilePropertyByFileId = (data) => {
  return request(`fa/casefile/queryFilePropertyByFileId`, 'post', {
    data: data,
  })
}
// 字段映射 -> 获取所属银行/支付公司列表
export const faOrgsConfigureList = (data) => {
  return request(`fa/faOrgsConfigure/list`, 'post', {
    data: data,
  })
}

// 银行机构选择 fa/faOrgsConfigure/list?pageNo=1&pageSize=10&_t=1773194714539

export const faOrgsConfigureAllList = (params) => {
  return request(`fa/faOrgsConfigure/list`, {
    params: params,
  })
}

// 字段映射 ->  根据orgCode和pageId生成对应table

export const casefileFileConfigData = (data) => {
  return request(`fa/casefile/fileConfigData`, 'post', {
    data: data,
  })
}

/**
 *
 * 定时任务
 * @param params
 * @returns
 */

// 定时任务列表
// sys/quartzJob/list?column=createTime&order=desc&pageNo=1&pageSize=10&_t=1772693397998
export const getQuartzJobList = (params): Promise<commonListResponse> => {
  return request('sys/quartzJob/list', { params: params })
}
// 编辑定时任务
export const editQuartzJob = (data) => {
  return request('sys/quartzJob/edit', 'post', { data })
}
// 新增定时任务
export const addQuartzJob = (data) => {
  return request('sys/quartzJob/add', 'post', { data })
}
// 导出定时任务
export const exportQuartzJob = (params) => {
  return request('sys/quartzJob/exportXls', 'get', {
    params,
    joinTimeStamp: true,
    download: true,
    fileName: '定时任务列表.xlsx',
  })
}
//启动定时任务
export const resumeQuartzJob = (params) => {
  return request('sys/quartzJob/resume', 'get', { params, joinTimeStamp: true })
}
// 暂停定时任务
export const pauseQuartzJob = (params) => {
  return request('sys/quartzJob/pause', 'get', { params, joinTimeStamp: true })
}
// 删除定时任务
export const deleteQuartzJob = (params) => {
  return request('sys/quartzJob/delete', 'delete', { params, joinTimeStamp: true })
}
// 立即执行定时任务
export const runQuartzJob = (params) => {
  return request('sys/quartzJob/execute', 'get', { params, joinTimeStamp: true })
}
/**
 * 字典管理
 * @param params
 * @returns
 */
export const getDictLits = (params): Promise<commonListResponse> => {
  return request('sys/dict/list', { params: params })
}
/**
 * 新增字典
 * @param data
 * @returns
 */
export const addDict = (data) => {
  return request('/sys/dict/add', 'post', { data })
}
/**
 * 编辑字典
 * @param data
 * @returns
 */
export const editDict = (data) => {
  return request('/sys/dict/edit', 'post', { data })
}
/**
 * 删除字典
 * @param params
 * @returns
 */
export const deleteDict = (params) => {
  return request('/sys/dict/delete', 'delete', { params, joinTimeStamp: true, resolve: 'data' })
}
/**
 * 导出字典
 */
export const exportDict = (params) => {
  return request('/sys/dict/exportXls', 'get', {
    params,
    joinTimeStamp: true,
    download: true,
    fileName: '数据字典列表.xlsx',
  })
}
/**
 * 刷新仪表盘缓存
 */
export const refreshDragCache = () => {
  return request('/drag/page/refreshCache', 'get', {joinTimeStamp: true, resolve: 'data' })
}
/**
 * 刷新字典
 */
export const refreshDict = () => {
  return request('/sys/dict/refleshCache', 'get', {joinTimeStamp: true, resolve: 'data' })
}
/**
 * 获取所有字典项
 */
export const getAllDictItems = () => {
  return request('/sys/dict/queryAllDictItems', 'get', {joinTimeStamp: true, resolve: 'data' })
}
/**
 * 获取字典回收站列表
 * @param params 
 * @returns 
 */
export const getAllRecycleList = () => {
  return request('/sys/dict/deleteList', 'get', { joinTimeStamp: true, resolve: 'data' })
}
