import axios from "axios";
import { $toast, getType } from "@oeos-components/utils";
import { getTenantStorage } from "@/utils/gFunc";
import { devLogin, menuLogout } from "@/utils/local401LoginAgain";
import { ref } from "vue";
import qs from "qs";

import { addPendingRequest } from "@/utils/cancelTokenRequests";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
type AxiosConfig = {
  showLoading?: boolean;
  stringify?: boolean;
  cancel?: void;
  customResponse?: boolean;
  original?: boolean;
  showError?: boolean;
  fileName?: string;
  fileType?: string;
  resolve?: string;
};
// Extend InternalAxiosRequestConfig to include custom fields for response interceptor
declare module "axios" {
  export interface InternalAxiosRequestConfig<D = any> extends AxiosConfig {}
}

const { useLoading, useLoading1, useLoading2, loadingTrue, loadingFalse } =
  useGlobalLoading();

export const globalLoading = ref(useLoading);
export const loading1 = ref(useLoading1);
export const loading2 = ref(useLoading2);

// import qs from 'qs'
// 关于axios的一些默认配置项，调用接口时，按需要传递
const defaultConfig = {
  // axios支持的请求完整配置：http://www.axios-js.com/zh-cn/docs/#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
  // url: '',
  // method: 'post',
  // headers: {},
  // params:{},
  // data:{},
  // 自定义参数，用于需要在拦截器中处理的全局性事件
  fileName: "", // 下载的文件名
  fileType: "", // 下载的文件类型
  showLoading: false, // 是否在全局(页面级)显示loading
  // loadingText: '',          // loading中的文字提示，默认为空
  // loadingTime: 0,         // loading加载时长，单位ms；0表示请求成功或失败后动关闭
  original: false, // 是否在拦截器中返回服务服的原始数据（response.data）
  showError: true // 是否把错误信息以message的形式显示在页面上
};

const instance = axios.create({
  baseURL: "/jeecgboot",
  timeout: 600000,
  validateStatus: function (status) {
    return true;
  },
  withCredentials: true
});
const timer = null;
let isRefresh = false;
let requests = [];
// 请求拦截，使用sessionId方式控制权限，
const CancelToken = axios.CancelToken;

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_hasLoading(config.showLoading)) {
    loadingTrue(config.showLoading);
  }
  const token = getTenantStorage("tenant-token");
  if (token) {
    config.headers.Authorization = token;
  }
  // 对上传类参数，要转换为FormData形式
  if (config.headers["content-type"] === "multipart/form-data") {
    const formData = new FormData();
    for (const key in config.data) {
      formData.append(key, config.data[key]);
    }
    config.data = formData;
  }
  if (config.stringify !== false) {
    const [baseUrl, urlQuery] = config.url.split("?");
    const parseQueryParams = getQueryObject(urlQuery);
    const mergeParams = { ...config.params, ...parseQueryParams };
    const qsParams = qs.stringify(mergeParams);
    if (qsParams) {
      config.url = baseUrl + "?" + qsParams;
    } else {
      config.url = baseUrl;
    }
    delete config.params;
  }

  // request('info/overview', { showLoading: true, cancel: (c)=>{ setTimeout(() => {c()}, 100); } }) 取消请求
  config.cancelToken = new CancelToken(function executor(c) {
    if (config.cancel) {
      return config.cancel();
    }
    addPendingRequest(config, c);
  });

  return config;
});
// 响应拦截
instance.interceptors.response.use(
  response => {
    if (_hasLoading(response.config.showLoading)) {
      loadingFalse(response.config.showLoading);
    }
    if (response.config.customResponse) {
      return Promise.resolve(response);
    }
    // TODO 这里应该判断状态码，待确定
    if (response.status === 200) {
      if (response.data.status !== 200 && response.data.status !== 201) {
        if (response.config.showError) {
          $toast(response.data.message || "请求错误", "e", { closeAll: true });
        }
        if (response.config.url === "ui/menu") {
          return menuLogout();
        }
        return Promise.reject(response.data);
      } else {
        // 返回正常数据
        const resolveData = response.config.resolve
          ? response[response.config.resolve]
          : response.data.details;
        return Promise.resolve(resolveData);
      }
    } else {
      if (response.status === 401) {
        return handleMultiple401Requests(response.config, response);
      }
      if (("" + response.status).startsWith("5")) {
        // devLogin(true)
        return $toast("系统繁忙, 请稍后再试", "e", { closeAll: true });
      }
      return Promise.reject(response.data);
    }
  },
  error => {
    loadingFalse();
    const obj = JSON.parse(JSON.stringify(error));
    if (obj.message?.indexOf("401") !== -1) {
      return handleMultiple401Requests(error.config, error);
    }
  }
);

/**
 * 如果页面发生401错误, 再次获取token并重新请求401接口, 防止回到登录页
 */
async function handleMultiple401Requests(config, response) {
  const msg = response?.data?.message;
  if (!window.VueApp.config.globalProperties.$test) {
    return menuLogout();
  }
  if (!isRefresh) {
    isRefresh = true;
    try {
      await devLogin();
      requests.forEach(v => v());
      requests = [];
      return request(config.url, config.method, config);
    } catch (e) {
    } finally {
      isRefresh = false;
    }
  }
  return new Promise(resolve => {
    requests.push(() => {
      resolve(request(config.url, config.method, config));
    });
  });
}

// 接口报错信息提示
// TODO 使用同一提示框提示多个错误信息
export { instance };
/**
 *
 * @param {*} url 请求url
 * @param {*} method 请求方法, 或者是参数对象
 * @param {*} config 可有可无, 参数对象.
 * @returns
 */
// 定义 method 参数的类型
type MethodType = "get" | "post" | "put" | "delete";

// 定义 method 参数的类型（可以是 MethodType 或对象）
interface MethodOrConfig {
  method?: MethodType;
  [key: string]: any;
}
export default function request(
  url: string,
  method: MethodType | MethodOrConfig = "get",
  config: { [key: string]: any } = {}
) {
  const methodMap = ["get", "post", "put", "delete"];
  const methodIsObj =
    !(typeof method === "string" && methodMap.includes(method)) &&
    getType(method) === "object";
  const configObj: { [key: string]: any } =
    methodIsObj && typeof method === "object" ? method : config;
  if (configObj.type === "common") {
    configObj.baseURL = import.meta.env.VITE_PROXY_API + "/v1/admin";
  }
  const mergeConfig = {
    url: url,
    method: methodIsObj ? configObj.method : method,
    ...configObj
  };

  const finalMergeConfig = Object.assign({}, defaultConfig, mergeConfig);
  return instance(finalMergeConfig);
}

function _hasLoading(sendLoading) {
  const loadingMap = [true, "loading1", "loading2"];
  return loadingMap.includes(sendLoading);
}

function getQueryObject(url) {
  if (!url) {
    return {};
  }
  const search = url.slice(url.indexOf("?") + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = $1;
    let val = $2;
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}
