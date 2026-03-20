// 单点登录核心类
import { getToken } from '/@/utils/auth'
import { getUrlParam } from '/@/utils'
import { useGlobSetting } from '/@/hooks/setting'
//import { validateCasLogin } from '/@/api/sys/user';
import { validateJcyLogin } from '/@/api/sys/user'
import { useUserStore } from '/@/store/modules/user'
import { router } from '/@/router'
import { PageEnum } from '/@/enums/pageEnum'

const globSetting = useGlobSetting()
const openSso = globSetting.openSso
export function useSso() {
  //update-begin---author:wangshuai---date:2024-01-03---for:【QQYUN-7805】SSO登录强制用http #957---
  let locationUrl = document.location.protocol + '//' + window.location.host + '/'
  //update-end---author:wangshuai---date:2024-01-03---for:【QQYUN-7805】SSO登录强制用http #957---

  /**
   * 单点登录
   */
  async function ssoLogin() {
    if (openSso == 'true') {
      let token = getToken()
      // let ticket = getUrlParam('ticket');
      let ens = getUrlParam('ens')
      if (!token) {
        if (ens) {
          try {
            const res = await validateJcyLogin({
              ens: ens,
              //service: locationUrl,
            })
            const userStore = useUserStore()
            userStore.setToken(res.token)
            return userStore.afterLoginAction(true, {})
          } catch (error) {
            // 登录失败，跳转到异常页面
            let errorMsg = '单点登录验证失败'
            if (error instanceof Error) {
              errorMsg = error.message
            }
            router.push({
              path: PageEnum.SSO_EXCEPTION,
              query: {
                errorMsg: errorMsg,
              },
            })
            // 返回 true 表示已处理跳转，不需要继续执行引导流程
            return true
          }
        } else {
          // 没有获取到加密参数ens，跳转到异常页面提示"用户不存在"
          router.push({
            path: PageEnum.SSO_EXCEPTION,
            query: {
              errorMsg: '用户不存在',
            },
          })
          // 返回 true 表示已处理跳转，不需要继续执行引导流程
          return true
          // window.location.href = globSetting.casBaseUrl + '/login?service=' + encodeURIComponent(locationUrl);
        }
      }
    }
    return false
  }

  /**
   * 退出登录
   */
  async function ssoLoginOut() {
    if (openSso == 'true') {
      // 跳转到异常页面提示"退出成功"
      router.push({
        path: PageEnum.SSO_EXCEPTION,
        query: {
          errorMsg: '退出成功',
        },
      })
      // 返回 true 表示已处理退出逻辑，不需要继续执行其他登出操作
      return true
      // window.location.href = globSetting.casBaseUrl + '/logout?service=' + encodeURIComponent(locationUrl);
    }
    return false
  }
  return { ssoLogin, ssoLoginOut }
}
