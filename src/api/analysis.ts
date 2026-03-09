import request from '@/utils/request'

// 案件列表

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

/**
 *
 * 定时任务
 * @param params
 * @returns
 */

// 定时任务列表
// sys/quartzJob/list?column=createTime&order=desc&pageNo=1&pageSize=10&_t=1772693397998
export const getQuartzJobList = (params) => {
  return request('sys/quartzJob/list', { params: params })
}
// 保存定时任务
export const editQuartzJob = (data) => {
  return request('sys/quartzJob/edit', 'post', { data })
}
