import axios from 'axios'
import { $toast, getType, getStorage, clone } from '@oeos-components/utils'
import { ConfigEnum } from '@/enums/httpEnum.ts'
// import { devLogin, menuLogout } from "@/utils/local401LoginAgain";
import { ref } from 'vue'
import signMd5Utils from '@/utils/encryption/signMd5Utils'
import qs from 'qs'

import { addPendingRequest } from '@/utils/cancelTokenRequests'
import { useGlobalLoading } from '@/hooks/useGlobalLoading'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// 上传文件参数类型
export interface UploadFileParams {
  file: File | Blob
  name?: string
  filename?: string
  data?: Record<string, any>
}

// 上传文件回调类型
export interface UploadFileCallBack {
  success?: (data: any) => void
  isReturnResponse?: boolean
}

// 自定义请求配置接口，包含resolve字段
interface CustomRequestConfig extends AxiosRequestConfig {
  resolve?: string
}

type AxiosConfig = {
  showLoading?: boolean
  stringify?: boolean
  cancel?: (cancelFunction: () => void) => void
  customResponse?: boolean
  original?: boolean
  showError?: boolean
  showMessage?: boolean
  fileName?: string // 下载的文件名，默认download
  fileType?: string // 下载的文件类型，默认xlsx
  resolve?: string
  joinTimeStamp?: boolean // 是否在参数中加入时间戳，默认true
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text' | 'stream' // 响应类型，默认json
  download?: boolean // 是否下载文件，默认false
  success?: (data: any) => void
}
// Extend InternalAxiosRequestConfig to include custom fields for response interceptor
declare module 'axios' {
  export interface InternalAxiosRequestConfig<D = any> extends AxiosConfig {}
}

const { useLoading, useLoading1, useLoading2, loadingTrue, loadingFalse } = useGlobalLoading()

export const globalLoading = ref(useLoading)
export const loading1 = ref(useLoading1)
export const loading2 = ref(useLoading2)

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
  fileName: '', // 下载的文件名
  fileType: '', // 下载的文件类型
  showLoading: false, // 是否在全局(页面级)显示loading
  showMessage: true, // 如果有message是否显示
  // loadingText: '',          // loading中的文字提示，默认为空
  // loadingTime: 0,         // loading加载时长，单位ms；0表示请求成功或失败后动关闭
  original: false, // 是否在拦截器中返回服务服的原始数据（response.data）
  showError: true, // 是否把错误信息以message的形式显示在页面上
}

const instance = axios.create({
  baseURL: '/jeecgboot',
  timeout: 600000,
  validateStatus: function (status) {
    return true
  },
  withCredentials: true,
})
const timer = null
let isRefresh = false
let requests = []
// 请求拦截，使用sessionId方式控制权限，
const CancelToken = axios.CancelToken

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_hasLoading(config.showLoading)) {
    loadingTrue(config.showLoading)
  }
  // 如果设置了download，自动配置为二进制下载
  if (config.download) {
    config.responseType = config.responseType || 'blob'
    config.fileName = config.fileName || 'download'
  }
  config.headers[ConfigEnum.TIMESTAMP] = signMd5Utils.getTimestamp()
  //update-begin---author:wangshuai---date:2024-04-25---for: 生成签名的时候复制一份，避免影响原来的参数---
  config.headers[ConfigEnum.Sign] = signMd5Utils.getSign(config.url, clone(config.params), clone(config.data))
  const token = getStorage(ConfigEnum.TOKEN)
  if (token) {
    config.headers[ConfigEnum.TOKEN] = token
  }
  // 对上传类参数，要转换为FormData形式
  // if (config.headers['Content-Type'] === 'multipart/form-data') {
  //   const formData = new FormData()
  //   for (const key in config.data) {
  //     formData.append(key, config.data[key])
  //   }
  //   config.data = formData
  // }
  if (config.stringify !== false) {
    const [baseUrl, urlQuery] = config.url.split('?')
    const parseQueryParams = getQueryObject(urlQuery)
    let mergeParams = { ...config.params, ...parseQueryParams }
    // 如果joinTimeStamp为true，添加_t参数
    if (config.joinTimeStamp) {
      mergeParams = { ...mergeParams, _t: Date.now() }
    }
    const qsParams = qs.stringify(mergeParams)
    if (qsParams) {
      config.url = baseUrl + '?' + qsParams
    } else {
      config.url = baseUrl
    }
    delete config.params
  } else if (config.joinTimeStamp) {
    // 如果stringify为false但joinTimeStamp为true，直接在params中添加_t参数
    config.params = { ...config.params, _t: Date.now() }
  }

  // request('info/overview', { showLoading: true, cancel: (c)=>{ setTimeout(() => {c()}, 100); } }) 取消请求
  config.cancelToken = new CancelToken(function executor(c) {
    if (config.cancel) {
      return config.cancel(c)
    }
    addPendingRequest(config, c)
  })

  return config
})
// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (_hasLoading(response.config.showLoading)) {
      loadingFalse(response.config.showLoading)
    }
    if (response.config.customResponse) {
      return Promise.resolve(response)
    }
    // 处理二进制响应
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      // 如果有fileName，触发下载
      if (response.config.fileName) {
        const blob = new Blob([response.data], { type: response.config.fileType || '' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.config.fileName
        link.click()
        URL.revokeObjectURL(url)
      }
      return Promise.resolve(response.data)
    }
    // TODO 这里应该判断状态码，待确定
    if (response.status === 200) {
      if (response.data.code !== 0 && response.data.code !== 200) {
        if (response.config.showError) {
          $toast(response.data.message || '请求错误', 'e', { closeAll: true })
        }
        return Promise.reject(response.data)
      } else {
        // 返回正常数据
        const resolveData = response.config.resolve
          ? response[response.config.resolve]
          : response.data.result || response.data.message

        if (getType(resolveData) === 'string' && response.data.message && response.config.showMessage) {
          $toast(response.data.message)
        }
        return Promise.resolve(resolveData)
      }
    } else {
      if (response.status === 401) {
        return handleMultiple401Requests(response.config, response)
      }
      if (('' + response.status).startsWith('5')) {
        // devLogin(true)
        $toast('系统繁忙, 请稍后再试', 'e', { closeAll: true })
        return Promise.reject(response.data)
      }
      return Promise.reject(response.data)
    }
  },
  (error) => {
    loadingFalse()
    const obj = JSON.parse(JSON.stringify(error))
    if (obj.message?.indexOf('401') !== -1) {
      return handleMultiple401Requests(error.config, error)
    }
  },
)

/**
 * 如果页面发生401错误, 再次获取token并重新请求401接口, 防止回到登录页
 */
async function handleMultiple401Requests(config, response) {
  const msg = response?.data?.message
  if (!window.VueApp.config.globalProperties.$test) {
    // return menuLogout();
  }
  if (!isRefresh) {
    isRefresh = true
    try {
      // await devLogin();
      requests.forEach((v) => v())
      requests = []
      return request(config.url, config.method, config)
    } catch (e) {
    } finally {
      isRefresh = false
    }
  }
  return new Promise((resolve) => {
    requests.push(() => {
      resolve(request(config.url, config.method, config))
    })
  })
}

// 接口报错信息提示
// TODO 使用同一提示框提示多个错误信息
export { instance }
/**
 *
 * @param {*} url 请求url
 * @param {*} method 请求方法, 或者是参数对象
 * @param {*} config 可有可无, 参数对象.
 * @returns
 */
// 定义 method 参数的类型
type MethodType = 'get' | 'post' | 'put' | 'delete'

// 定义 method 参数的类型（可以是 MethodType 或对象）
interface MethodOrConfig {
  method?: MethodType
  [key: string]: any
}
export default function request(
  url: string,
  method: MethodType | MethodOrConfig = 'get',
  config: { [key: string]: any } = {},
): Promise<any> {
  const methodMap = ['get', 'post', 'put', 'delete']
  const methodIsObj = !(typeof method === 'string' && methodMap.includes(method)) && getType(method) === 'object'
  const configObj: { [key: string]: any } = methodIsObj && typeof method === 'object' ? method : config
  if (configObj.type === 'common') {
    configObj.baseURL = import.meta.env.VITE_PROXY_API + '/v1/admin'
  }
  const mergeConfig = {
    url: url,
    method: methodIsObj ? configObj.method : method,
    ...configObj,
  }

  const finalMergeConfig = Object.assign({}, defaultConfig, mergeConfig)
  return instance(finalMergeConfig)
}

/**
 * 文件上传 - 自动触发文件选择弹窗
 * @param options 上传配置
 * @returns Promise 上传结果
 */
export function uploadFile<T = any>(options: {
  url: string
  multiple?: boolean
  name?: string
  data?: Record<string, any>
  headers?: Record<string, string>
  showLoading?: boolean
  callback?: UploadFileCallBack
}): Promise<T> {
  return new Promise((resolve, reject) => {
    // 创建隐藏的文件输入框
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.style.display = 'none'
    fileInput.multiple = options.multiple || false

    // 处理文件选择事件
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement
      const files = target.files

      if (!files || files.length === 0) {
        document.body.removeChild(fileInput)
        reject(new Error('未选择文件'))
        return
      }

      try {
        // 显示加载动画
        if (options.showLoading) {
          loadingTrue(options.showLoading)
        }

        // 处理多文件上传
        if (options.multiple && files.length > 1) {
          const uploadPromises = Array.from(files).map((file) => {
            return uploadSingleFile({
              url: options.url,
              file: file,
              name: options.name,
              data: options.data,
              headers: options.headers,
            })
          })

          const results = await Promise.all(uploadPromises)

          // 隐藏加载动画
          if (options.showLoading) {
            loadingFalse(options.showLoading)
          }

          if (options.callback?.success) {
            options.callback.success(results)
          }

          resolve(results as unknown as T)
        } else {
          // 单文件上传
          const file = files[0]
          const result = await uploadSingleFile({
            url: options.url,
            file: file,
            name: options.name,
            data: options.data,
            headers: options.headers,
          })

          // 隐藏加载动画
          if (options.showLoading) {
            loadingFalse(options.showLoading)
          }

          if (options.callback?.success) {
            options.callback.success(result)
          }

          resolve(result as unknown as T)
        }
      } catch (error) {
        // 隐藏加载动画
        if (options.showLoading) {
          loadingFalse(options.showLoading)
        }
        if (options.callback?.isReturnResponse) {
          reject(error)
        } else {
          $toast('上传失败', 'e', { closeAll: true })
          reject(error)
        }
      } finally {
        // 清理文件输入框
        document.body.removeChild(fileInput)
      }
    }

    // 添加到DOM并触发点击
    document.body.appendChild(fileInput)
    fileInput.click()
  })
}

/**
 * 单个文件上传
 */
function uploadSingleFile<T = any>(params: {
  url: string
  file: File
  name?: string
  data?: Record<string, any>
  headers?: Record<string, string>
}): Promise<T> {
  const formData = new window.FormData()
  const customFilename = params.name || 'file'

  // 添加文件
  formData.append(customFilename, params.file)

  // 添加附加数据
  if (params.data) {
    Object.keys(params.data).forEach((key) => {
      const value = params.data![key]
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item)
        })
        return
      }
      formData.append(key, params.data[key])
    })
  }

  return instance
    .request<T>({
      url: params.url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': 'multipart/form-data',
        ...params.headers,
      },
      resolve: 'data',
    } as CustomRequestConfig)
    .then((res: any) => {
      if (res.code === 0 || res.code === 200) {
        $toast(res.message || '上传成功', 's', { closeAll: true })
      } else {
        $toast(res.message || '上传失败', 'e', { closeAll: true })
        return Promise.reject(res)
      }
      return res
    })
    .catch((error) => {
      $toast('上传失败', 'e', { closeAll: true })
      return Promise.reject(error)
    })
}

function _hasLoading(sendLoading) {
  const loadingMap = [true, 'loading1', 'loading2']
  return loadingMap.includes(sendLoading)
}

function getQueryObject(url) {
  if (!url) {
    return {}
  }
  const search = url.slice(url.indexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = $1
    let val = $2
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}
