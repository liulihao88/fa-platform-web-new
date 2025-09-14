import { defHttp } from '/@/utils/http/axios';
enum Api {
  listNoCareTenant = '/sys/user/listAll',
}

/**
 * 列表接口(查询全部用户，不通过租户隔离)
 * @param params
 */
export const listNoCareTenant = (params) => defHttp.get({ url: Api.listNoCareTenant, params });
