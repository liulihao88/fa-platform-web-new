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
 * 新增案件
 */
export const addFaCase = (data) => {
  return request('fa/faCaseInfo/add', 'post', {
    data: data,
  })
}
/**
 * 修改案件
 */
export const editFaCase = (data) => {
  return request('fa/faCaseInfo/edit', 'post', {
    data: data,
  })
}
/**
 * 删除案件
 */
export const deleteFaCase = (id) => {
  return request(`fa/faCaseInfo/delete?id=${id}`, 'delete', {})
}
/**
 * 获取智能查询条件列表
 */
export const getSmartSearchList = (id) => {
  return request('fa/faQueryRecord/getQueryRecordList', 'post', { data: { caseId: id } })
}
/**
 * 新增智能查询条件
 */
export const addSmartSearch = (data) => {
  return request('fa/faQueryRecord/add', 'post', {
    data: data,
  })
}
// 案件详情
export const getCaseInfoById = (data) => {
  return request('fa/faCaseInfo/getCaseInfoById', 'post', {
    data: data,
  })
}
/**
 * 获取智能筛查数据列表
 */
export const getTransList = (data) => {
  return request('fa/caseStandardData/transList', 'post', {
    data: data,
  })
}
/**
 * 导出数据
 */
export const exportTransListData = (data) => {
  return request('fa/caseStandardData/exportXls', 'post', {
    data: data,
    download: true,
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

// 获取table配置列列表 /jeecgboot/fa/casefile/getFileConfigPageList

export const getFileConfigPageList = (params) => {
  return request(`fa/casefile/getFileConfigPageList`, {
    params: params,
  })
}

// 保存配置 /fa/casefile/updateFileConfig
export const updateFaFileConfig = (data) => {
  return request('fa/casefile/updateFileConfig', 'post', { data })
}

/**
 * 文件转换详情
 */

// 获取文件类型
export const getFileInfoItem = (params) => {
  return request(`/fa/casefile/getFileInfo/${params.fileId}`, { params })
}
// 获取转换页码的table数据 fa/caseStandardData/bankCustomerPageList
export const bankCustomerPageList = (lastUrl, data) => {
  return request(`fa/caseStandardData/${lastUrl}`, 'post', { data })
}
// // 银行交易流水
// export const bankTransPageList = (data) => {
//   return request('fa/caseStandardData/bankTransPageList', 'post', { data })
// }
// // 非银行客户信息
// export const nonBankCustomerPageList = (data) => {
//   return request('fa/caseStandardData/nonBankCustomerPageList', 'post', { data })
// }
// // 非银行交易流水
// export const nonBankTransPageList = (data) => {
//   return request('fa/caseStandardData/nonBankTransPageList', 'post', { data })
// }

/**
 * 标准数据查看
 */

// 文件列表
export const getStandardDataFileList = (params) => {
  return request('fa/caseStandardData/filePageList', {
    params: params,
  })
}

// 点击文件列表更小文件页码 fa/caseStandardData/pageList
export const getStandardDataPageList = (data) => {
  return request(`fa/caseStandardData/pageList`, 'post', { data })
}

/**
 * 重复数据查看 /fa/caseDuplicateData/list
 */

export const getCaseDuplicateData = (params) => {
  return request(`fa/caseDuplicateData/list`, { params })
}

// 导出重复数据 fa/caseDuplicateData/exportXls
export const exportDataApi = (params) => {
  return request(`fa/caseDuplicateData/exportXls`, 'post', {
    data: params,
    download: true,
    fileName: '重复数据列表.xlsx',
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
/**
 * 批量删除定时任务
 * @param params
 * @returns
 */
export const deleteBatchQuartzJob = (ids) => {
  return request('sys/quartzJob/deleteBatch', 'delete', { params: { ids }, joinTimeStamp: true })
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
export const checkDict = (val, dataId) => {
  return request(`sys/duplicate/check?tableName=sys_dict&fieldName=dict_code&fieldVal=${val}&dataId=${dataId}`, 'get', {
    joinTimeStamp: true,
    resolve: 'data',
  })
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
  return request('/sys/dict/delete', 'delete', { params, joinTimeStamp: true })
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
  return request('/drag/page/refreshCache', 'get', { joinTimeStamp: true, resolve: 'data' })
}
/**
 * 刷新字典
 */
export const refreshDict = () => {
  return request('/sys/dict/refleshCache', 'get', { joinTimeStamp: true, resolve: 'data' })
}
/**
 * 获取所有字典项
 */
export const getAllDictItems = () => {
  return request('/sys/dict/queryAllDictItems', 'get', { joinTimeStamp: true, resolve: 'data' })
}
/**
 * 获取字典回收站列表
 * @param params
 * @returns
 */
export const getAllRecycleList = () => {
  return request('/sys/dict/deleteList', 'get', { joinTimeStamp: true, resolve: 'data' })
}
/**
 * 取回字典
 * @param id
 * @returns
 */
export const backDict = (id) => {
  return request(`/sys/dict/back/${id}`, 'put')
}
/**
 * 彻底删除字典
 * @param id
 * @returns
 */
export const deleteDictPermanently = (id) => {
  return request(`sys/dict/deletePhysic/${id}`, 'delete')
}
/**
 * 批量删除回收站字典
 * @param ids
 * @returns
 */
export const deleteBatchDictPermanently = (ids) => {
  return request(`sys/dict/deleteRecycleBin?ids=${ids}`, 'delete')
}
/**
 * 批量删除字典列表
 * @param ids
 * @returns
 */
export const deleteBatchDict = (ids) => {
  return request(`sys/dict/deleteBatch?ids=${ids}`, 'delete')
}
/**
 * 批量取回字典
 * @param ids
 * @returns
 */
export const backBatchDict = (ids) => {
  return request(`sys/dict/putRecycleBin`, 'put', { data: { ids } })
}
/**
 * 字典项详情列表
 * @param params
 * @returns
 */
export const getDictItemList = (params): Promise<commonListResponse> => {
  return request('sys/dictItem/list', { params: params })
}
/**
 * 删除字典项
 * @param dictId
 * @returns
 */
export const deleteDictItem = (dictId) => {
  return request(`sys/dictItem/delete?id=${dictId}`, 'delete')
}
/**
 * 新增字典项
 * @param data
 * @returns
 */
export const addDictItem = (data) => {
  return request('sys/dictItem/add', 'post', { data })
}
/**
 * 编辑字典项
 * @param data
 * @returns
 */
export const editDictItem = (data) => {
  return request('sys/dictItem/edit', 'post', { data })
}
/**
 * 字典项校验
 * @param params
 * @returns
 */
export const checkDictItem = (params) => {
  return request('sys/dictItem/dictItemCheck', 'get', { params, resolve: 'data' })
}
