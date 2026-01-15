import {
  $toast,
  getStorage,
  setStorage,
  clearStorage,
  isEmpty,
  formatTime,
  formatDurationTime,
  confirm,
  formatBytesConvert
} from "@oeos-components/utils";
import settings from "@/config/settings.ts";
import { useTenantStore } from "@/store/tenantStore.ts";

import { router } from "@/router/index.ts";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request.js";
import axios from "axios";

export async function gDownloadExport(sendUrl, sendData) {
  const baseUrl = import.meta.env.DEV ? settings.url : window.origin;
  const url =
    baseUrl +
    "/v1/admin/tenant/" +
    sendUrl +
    "?" +
    new URLSearchParams(sendData).toString();
  const link = document.createElement("a");
  link.href = url;
  link.download = "租户事件"; // 设置下载文件名
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// export async function gDownload(item, needVersion = true) {
//   // 1. 创建 CancelToken
//   const CancelToken = axios.CancelToken
//   let axiosCancel
//   if (!item.bucket) {
//     $toast('不是有效数据，不支持下载!', 'w')
//     return false
//   } else {
//     if (item.bucket.length <= 0) {
//       $toast('不是有效数据，不支持下载!', 'w')
//     }
//   }
//   let bucketName = item.bucket ? item.bucket : ''
//   let objectKey = item.key ? item.key : ''
//   let objectVersionID = item.version ? item.version : ''

//   let parseKey = encodeURIComponent(objectKey)
//   // let parseKey = objectKey
//   let sendParams = {
//     bucket: bucketName,
//     key: parseKey,
//     Authorization: getTenantStorage('tenant-token'),
//   }
//   if (needVersion) {
//     sendParams.version = objectVersionID
//   }
//   await request('object/download', 'get', {
//     customResponse: true,
//     responseType: 'blob',
//     params: sendParams,
//     stringify: false,
//   })
//   axios
//     .get(import.meta.env.VITE_PROXY_API + '/v1/admin/tenant' + '/object/download', {
//       params: sendParams,
//       onDownloadProgress: (progressEvent, ...a) => {
//         // 2. 在进度事件中获取响应头
//         const xhr = progressEvent.event.target
//         const contentType = xhr.getResponseHeader('Content-Type')
//         if (
//           contentType &&
//           (contentType === 'application/octet-stream' ||
//             contentType === 'application/pdf' ||
//             contentType === 'application/zip')
//         ) {
//           axiosCancel() // 取消请求
//           let baseUrl = import.meta.env.DEV ? settings.url : window.origin
//           let middleUrl = `/v1/admin/tenant/object/download?`
//           let url = baseUrl + middleUrl + new URLSearchParams(sendParams).toString()
//           window.location.href = url
//         }
//       },
//       cancelToken: new CancelToken(function executor(c) {
//         // executor 函数接收一个 cancel 函数作为参数
//         axiosCancel = c
//       }),
//     })
//     .then((res) => {
//       $toast(res?.data?.message, 'e')
//     })
//     .catch((e) => {})
// }
export async function gDownload(item, needVersion = true) {
  if (item.size / 1024 / 1024 > 1024 * 5) {
    return $toast("下载文件大小最高不能超过5GB", "e");
  }
  if (!item.bucket) {
    $toast("不是有效数据，不支持下载!", "w");
    return false;
  } else {
    if (item.bucket.length <= 0) {
      $toast("不是有效数据，不支持下载!", "w");
    }
  }
  const bucketName = item.bucket ? item.bucket : "";
  const objectKey = item.key ? item.key : "";
  const objectVersionID = item.version ? item.version : "";

  const parseKey = encodeURIComponent(objectKey);
  // let parseKey = objectKey
  const sendParams = {
    bucket: bucketName,
    key: parseKey,
    Authorization: getTenantStorage("tenant-token")
  };
  if (needVersion) {
    sendParams.version = objectVersionID;
  }
  axios
    .head(
      import.meta.env.VITE_PROXY_API +
        "/v1/admin/tenant" +
        "/object/checkObject",
      {
        params: sendParams
      }
    )
    .then(async response => {
      const contentType = response.headers["content-type"];
      if (contentType.startsWith("application/json")) {
        const res = await request("object/download", "get", {
          customResponse: true,
          responseType: "blob",
          params: sendParams,
          stringify: false
        });
        if (res.status !== 200) {
          return $toast(res.message || "下载失败", "e");
        }
        try {
          // 尝试将文本解析为 JSON
          const result = await parseBlobToJson(res.data);
          $toast(result.message, "e");
        } catch (e) {}
      } else {
        const baseUrl = import.meta.env.DEV ? settings.url : window.origin;
        const getUrl = `/v1/admin/tenant/object/download?`;
        const url =
          import.meta.env.VITE_PROXY_API +
          "/v1/admin/tenant" +
          "/object/download?" +
          new URLSearchParams(sendParams).toString();
        window.location.href = url;
      }
    });
  // let res = await request('object/download', 'get', {
  //   customResponse: true,
  //   responseType: 'blob',
  //   params: sendParams,
  //   stringify: false,
  // })
  // if (res.status !== 200) {
  //   return $toast(res.message || '下载失败', 'e')
  // }
  // try {
  //   // 尝试将文本解析为 JSON
  //   const result = await parseBlobToJson(res.data)
  //   $toast(result.message, 'e')
  // } catch (e) {
  //   // 如果无法解析为json, 代表是数据流, 可以下载
  //   let data = res.data
  //   const url = URL.createObjectURL(data)
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.download = item.name
  //   link.click()
  // }

  // if (res.data && res.data.status && res.data.status !== 200) {
  //   $toast(res.data.message, 'e')
  //   return
  // }
  function parseBlobToJson(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const text = event.target.result; // 获取 Blob 的文本内容
          const json = JSON.parse(text); // 将文本解析为 JSON
          resolve(json);
        } catch (error) {
          reject(new Error("无法解析 JSON: " + error.message));
        }
      };
      reader.onerror = function (error) {
        reject(new Error("读取 Blob 时出错: " + error.message));
      };
      reader.readAsText(blob); // 以文本形式读取 Blob
    });
  }
}

export function gDownloadAll(id) {
  const baseUrl = import.meta.env.DEV ? settings.url : window.origin;
  const getUrl = `/v1/admin/tenant/object/download/batch`;
  const _href =
    baseUrl +
    getUrl +
    `?id=${encodeURIComponent(id)}&Authorization=${getTenantStorage("tenant-token")}`;
  window.location.href = _href;
}

export function gDownloadUrl(url, params = {}) {
  const baseUrl = import.meta.env.DEV ? settings.url : window.origin;
  const prefix = "/v1/admin/tenant/";
  const fullUrl = baseUrl + prefix + url;

  const _href =
    fullUrl +
    `?Authorization=${getTenantStorage("tenant-token")}${objectToQueryString(params)}`;
  // let _href = fullUrl + `?Authorization=${getTenantStorage('tenant-token')}`
  // window.open(_href)
  const link = document.createElement("a");
  link.href = _href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 将对象转换为查询字符串格式，并对每个值进行 URI 编码
 * @param params 要转换的对象
 * @param prefix 是否在开头添加 '&' 符号（默认为 true）
 * @returns 格式化后的查询字符串
 */
export const objectToQueryString = (
  params: Record<string, any>,
  prefix: boolean = true
): string => {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    // 处理数组或对象值（转换为 JSON 字符串）
    let encodedValue: string;
    if (typeof value === "object" && value !== null) {
      // 排除 null/undefined
      encodedValue = encodeURIComponent(value);
    } else {
      // 处理基本类型
      encodedValue = encodeURIComponent(value);
    }

    console.log(`24 encodedValue`, encodedValue);
    parts.push(`${key}=${encodedValue}`);
  });
  // 按需添加前缀
  return prefix ? `&${parts.join("&")}` : parts.join("&");
};

export function jump(path) {
  return router.push(path);
}

export function formatTimeByRule(time, timeStr = "datetime") {
  timeStr = timeStr.toLowerCase();
  if (isEmpty(time)) {
    return "-";
  }
  const rule = getTenantStorage("tenant-time-rule") || {
    date: "YYYY-MM-DD",
    time: "HH:mm:ss",
    datetime: "YYYY-MM-DD HH:mm:ss",
    uptime: "DD 天 HH 时 mm 分 ss 秒",
    speed1s: "MB/s"
  };
  const ruleValue = rule[timeStr];
  if (!ruleValue) {
    return time;
  }
  if (timeStr === "speed1s") {
    return time + ruleValue;
  }
  const parseRuleFormat = ruleValue
    .replace("YYYY", "{y}")
    .replace("MM", "{m}")
    .replace("DD", "{d}")
    .replace("HH", "{h}")
    .replace("mm", "{i}")
    .replace("ss", "{s}");
  if (timeStr === "uptime" || timeStr === "time") {
    return formatDurationTime(time, parseRuleFormat);
  }
  return formatTime(time, parseRuleFormat);
}

export function isImage(str) {
  // 正则表达式匹配常见的图片文件扩展名
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp|tif|tiff)$/i;
  return imageRegex.test(str);
}

export function setFavIcon(icon) {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = icon;
  document.getElementsByTagName("head")[0].appendChild(link);
}

/**
 * 将数字或字符串加小数点
 * 123 -> 123.00
 * 123.45678 -> 123.46
 * 123.32321KB -> 123.32KB
 * formatFixed(123,45, 2) -> 123.45
 * @param number
 * @param toFixed
 * @returns
 */
export function formatFixed(number, toFixed = 2) {
  // 提取数字部分、小数点和小数部分
  const matches = ("" + number).match(/^([\d,]+\.?\d+?)(\D+)?$/);
  if (!matches) {
    return number; // 如果没有找到匹配，则返回原始输入
  }

  const numericString = Number(matches[1]).toFixed(toFixed); // 仅保留数字
  const unit = matches[2] || ""; // 单位部分，如果没有则为空字符串

  // 拼接数字、小数点、小数部分和单位，并返回结果
  return `${numericString}${unit}`;
}

export function formatImg(
  photoName,
  addPath = "",
  { basePath = "assets/images" } = {}
) {
  if (photoName.startsWith("http") || photoName.startsWith("https")) {
    return photoName;
  }
  if (photoName.indexOf(".") === -1) {
    photoName = photoName + ".png";
  }
  const addLastSlash =
    addPath.endsWith("/") || !addPath ? addPath : `${addPath}/`;
  const addLastBasePathSlash =
    basePath.endsWith("/") || !basePath ? basePath : `${basePath}/`;
  const mergeSrc = `${addLastSlash}${photoName}`;
  const finalImg = `${addLastBasePathSlash}${mergeSrc}`;
  const res = new URL(`../${finalImg}`, import.meta.url).href;
  return res;
}

export function formatToFixed(number, fixed = 2) {
  // 提取数字部分、小数点和小数部分
  const matches = ("" + number).match(/^([\d,]+)(\.?)(\d+)?(\D+)?$/);
  if (!matches) {
    return number; // 如果没有找到匹配，则返回原始输入
  }

  const numericString = matches[1].replace(/\D/g, ""); // 仅保留数字
  const decimalString = matches[3] ? `.${matches[3]}` : ""; // 小数部分，如果没有则为空字符串
  const unit = matches[4] || ""; // 单位部分，如果没有则为空字符串
  const numTofixed = parseFloat(numericString + decimalString).toFixed(fixed);
  return `${numTofixed}${unit}`;
}

export async function devConfirm(title = "确定删除吗?", otherParams = {}) {
  if (window.VueApp.config.globalProperties.$dev) {
    return true;
  }
  // dangerouslyUseHTMLString: true,
  await confirm(title, {
    showCancelButton: true,
    cancelButtonText: "取消",
    type: "warning",
    // title: '注意',
    ...otherParams
  });
}

function parseBlobToJson(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const text = event.target.result; // 获取 Blob 的文本内容
        const json = JSON.parse(text); // 将文本解析为 JSON
        resolve(json);
      } catch (error) {
        reject(new Error("无法解析 JSON: " + error.message));
      }
    };
    reader.onerror = function (error) {
      reject(new Error("读取 Blob 时出错: " + error.message));
    };
    reader.readAsText(blob); // 以文本形式读取 Blob
  });
}

export async function parseBlob(data) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // 尝试将文本解析为 JSON
      const result = await parseBlobToJson(data);
      console.log(`96 result`, result);
      reject(result);
    } catch (e) {
      console.log(`36 e`, e);
      // 如果无法解析为json, 代表是数据流, 可以下载
      resolve();
    }
  });
}

// 如果解析成了json, 说明是后端返回的错误; 否则解析arrayBuffer
export function parseArraybuffer(arrayBuffer) {
  return new Promise(async (resolve, reject) => {
    try {
      const textDecoder = new TextDecoder("utf-8");
      const jsonString = textDecoder.decode(arrayBuffer);
      const jsonData = JSON.parse(jsonString);
      $toast(jsonData.message, "e");
      return reject(jsonData);
    } catch (e) {
      console.log(`36 e`, e);
      // 如果无法解析为json, 代表是数据流, 可以下载
      return resolve(arrayBuffer);
    }
  });
}

/** Function to get a CSS custom property value
 *
 * const primaryColor = getColor('--primary');
 *  */
export function getVariableColor(propertyName) {
  const res = getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
  return res;
}

export function quotaRules(rule, value, callback, unit, lower, upper) {
  if (formatBytesConvert(value + unit) < formatBytesConvert(lower)) {
    callback(new Error(`桶配额下限为 ${lower}`));
  } else if (formatBytesConvert(value + unit) > formatBytesConvert(upper)) {
    callback(new Error(`剩余可用容量为 ${upper}`));
  } else {
    callback();
  }
}

/**
 * 计算适合给定时间范围的 Prometheus step 值
 * @param {number} start - 开始时间戳（毫秒）
 * @param {number} end - 结束时间戳（毫秒）
 * @param {number} [desiredDataPoints=1000] - 期望的数据点数量（默认为1000）
 * @param {number} [minStep=1] - 最小 step 值（秒，默认为1）
 * @param {number} [maxStep] - 最大 step 值（秒，可选）
 * @returns {number} 计算出的 step 值（秒）
 *
 * @example
 * const startTime = new Date('2023-05-01T00:00:00Z').getTime();
  const endTime = new Date('2023-05-01T02:00:00Z').getTime(); // 2小时范围
  const step = calculatePrometheusStep(startTime, endTime);
  console.log(`Recommended step: ${step} seconds`); // ~7秒 (7200秒/1000点)
 */
export function calculatePrometheusStep(
  start,
  end,
  desiredDataPoints = 1000,
  minStep = 1,
  maxStep
) {
  // 确保时间范围有效
  if (start >= end) {
    throw new Error("Start time must be before end time");
  }

  // 计算时间范围（转换为秒）
  const durationSeconds = (end - start) / 1000;

  // 计算基础 step 值
  let step = Math.ceil(durationSeconds / desiredDataPoints);

  // 应用最小步长约束
  step = Math.max(step, minStep);

  // 应用最大步长约束（如果提供）
  if (maxStep !== undefined) {
    step = Math.min(step, maxStep);
  }

  // 返回计算结果
  return step;
}

export function confirm2(message, options) {
  const resolvedMessage = typeof message === "function" ? message() : message;
  const mergeOptions = {
    title: "提示",
    draggable: true,
    showCancelButton: false,
    confirmButtonText: "确定",
    dangerouslyUseHTMLString: true, // 允许 HTML
    ...options
  };
  return ElMessageBox.confirm(resolvedMessage, mergeOptions);
}

const getTenantKey = rawKey => {
  const tenantStore = useTenantStore();
  const tenantId = tenantStore.getTenantId(); // 从 Pinia 获取租户ID
  // let tenantId = 'T05'
  if (!tenantId) {
    return rawKey; // 如果没有租户ID，直接返回原始key
  }
  return `${tenantId}-${rawKey}`;
};

export function setTenantStorage(key, value, ...rest) {
  return setStorage(getTenantKey(key), value, ...rest);
}
export function getTenantStorage(key, ...rest) {
  return getStorage(getTenantKey(key), ...rest);
}

export function clearTenantStorage(key) {
  return clearStorage(getTenantKey(key));
}

// 根据tenantId前缀去清除本地缓存
export function _clearCacheWithPrefix() {
  const storage = window.localStorage; // 或者 window.sessionStorage
  const tenantId = useTenantStore().getTenantId();
  const keys = Object.keys(storage);
  keys.forEach(key => {
    if (key.startsWith(tenantId)) {
      // 白名单的不删除
      const whiteKeys = ["tenant-sysdomain"];
      const deleteTenantIdKey = key.replace(tenantId + "-", "");
      if (!whiteKeys.includes(deleteTenantIdKey)) {
        storage.removeItem(key);
      }
    }
  });
}
