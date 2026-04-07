import request from '@/utils/request'

type Result = {
  success: boolean
  data: Array<any>
}

export const getAsyncRoutes = () => {
  return request('sys/permission/getUserPermissionByToken')
}
