import request from '@/utils/request'

export const logoutApi = () => {
  return request('/sys/logout', 'get', { joinTimeStamp: true, resolve: 'data', showMessage: false, showError: false })
}

export const sendChangePwdSms = (mobile: string) => {
  return request('/sys/sendChangePwdSms', 'post', {
    params: { mobile },
    joinTimeStamp: true,
    resolve: 'data',
    showMessage: false,
  })
}

export const updateUserPassword = (params: { username: string; phone: string; smscode: string; password: string }) => {
  return request('/sys/user/passwordChange', 'get', {
    params,
    joinTimeStamp: true,
    resolve: 'data',
    showMessage: false,
  })
}

export const updatePassword = (data: { username: string; oldpassword: string; password: string }) => {
  return request('/sys/user/updatePassword', 'put', {
    data,
  })
}
