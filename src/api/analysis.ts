import request from "@/utils/request";

// 案件列表

// fa / faCaseInfo / list ? column = createTime & order=desc & pageNo=1 & pageSize=10 & _t=1772678940540

export const getFaCaseInfoList = params => {
  return request("fa/faCaseInfo/list", { params: params });
};

/**
 *
 * 定时任务
 * @param params
 * @returns
 */

// 定时任务列表
// sys/quartzJob/list?column=createTime&order=desc&pageNo=1&pageSize=10&_t=1772693397998
export const getQuartzJobList = params => {
  return request("sys/quartzJob/list", { params: params });
};
// 保存定时任务
export const editQuartzJob = data => {
  return request("sys/quartzJob/edit", "post", { data });
};
