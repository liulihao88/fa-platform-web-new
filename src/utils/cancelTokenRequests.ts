let pendingRequests = []
// 将axios请求的cancel回调放到pendingRequets中
export function addPendingRequest(config, c) {
  pendingRequests.push(c)
}

// 暴露取消所有请求的方法
export const clearPendingRequests = () => {
  if (pendingRequests.length > 0) {
    pendingRequests.forEach((cb) => {
      cb()
    })
    pendingRequests = []
  }
}
