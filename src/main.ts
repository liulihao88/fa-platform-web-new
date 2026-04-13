import App from './App.vue'
import router from './router'
import { setupStore } from '@/store'
import { getPlatformConfig } from './config'
import { MotionPlugin } from '@vueuse/motion'
import { createApp, type Directive } from 'vue'
import { useElementPlus } from '@/plugins/elementPlus'
import TableHeightPlugin from '@/plugins/tableHeight.ts'
import { injectResponsiveStorage } from '@/utils/responsive'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'core-js/stable'

import * as globalData from '@/assets/constants'
import * as gFunc from '@/utils/gFunc'

import Table from '@pureadmin/table'
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import './style/reset.scss'
// 导入公共样式
import './style/index.scss'
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import './style/tailwind.css'
import 'element-plus/dist/index.css'
// 导入字体图标
import './assets/iconfont/iconfont.js'
import './assets/iconfont/iconfont.css'

import 'virtual:svg-icons-register'

// 引入全局组件
import AutoImportComps from '@/autoComponents'

const app = createApp(App)
import { installOeos } from '@/plugins/customMain'

// 查看打包时间
const printBuildGitInfo = () => {
  const gitInfo = __APP_INFO__.git
  const latestCommit = gitInfo.latestCommit

  console.group('[build git info]')
  console.table({
    authorName: latestCommit.authorName || '-',
    buildTime: __APP_INFO__.lastBuildTime || '-',
    subject: latestCommit.subject || '-',
    branch: gitInfo.branch || '-',
    shortHash: latestCommit.shortHash || '-',
  })

  if (latestCommit) {
    if (latestCommit.body) {
      console.warn('body:\n' + latestCommit.body)
    }
  } else {
    console.warn('No git commit info found in build metadata.')
  }

  if (gitInfo.recentLogs.length) {
    console.log('recentLogs:\n' + gitInfo.recentLogs.join('\n'))
  }

  console.groupEnd()
  return gitInfo
}

window.b = printBuildGitInfo

// 自定义指令
import * as directives from '@/directives'
Object.keys(directives).forEach((key) => {
  app.directive(key, (directives as { [key: string]: Directive })[key])
})

// 全局注册@iconify/vue图标库
import { IconifyIconOffline, IconifyIconOnline, FontIcon } from './components/ReIcon'
app.component('IconifyIconOffline', IconifyIconOffline)
app.component('IconifyIconOnline', IconifyIconOnline)
app.component('FontIcon', FontIcon)

// 全局注册按钮级别权限组件
import { Auth } from '@/components/ReAuth'
import { Perms } from '@/components/RePerms'
app.component('Auth', Auth)
app.component('Perms', Perms)

// 全局注册vue-tippy
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import VueTippy from 'vue-tippy'
app.use(VueTippy)
app.use(TableHeightPlugin)
app.use(AutoImportComps)

window.VueApp = app

app.use(useElementPlus)

import * as utils from '@oeos-components/utils'

Object.keys(utils).forEach((v) => {
  app.config.globalProperties[v] = utils[v]
})

const $dev = import.meta.env.MODE === 'development'
app.config.globalProperties.$dev = utils.getStorage('fa-$dev') ?? $dev
app.config.globalProperties.$show = true
Object.keys(globalData).forEach((v) => {
  app.config.globalProperties[v] = globalData[v]
})
Object.keys(gFunc).forEach((v) => {
  app.config.globalProperties[v] = gFunc[v]
})

getPlatformConfig(app).then(async (config) => {
  setupStore(app)
  app.use(router)
  await router.isReady()

  installOeos(app)
  injectResponsiveStorage(app, config)
  app.use(MotionPlugin).use(Antd).use(Table)
  app.mount('#app')
})
