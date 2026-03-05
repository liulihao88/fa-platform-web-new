import request from "@/utils/request";

// 案件列表

// fa / faCaseInfo / list ? column = createTime & order=desc & pageNo=1 & pageSize=10 & _t=1772678940540

export const getFaCaseInfoList = params => {
  return request("fa/faCaseInfo/list", { params: params });
};
