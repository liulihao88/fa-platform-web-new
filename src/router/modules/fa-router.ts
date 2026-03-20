const Layout = () => import('@/layout/index.vue')
// import spaceManagementSvg from "@/assets/svg/menu/space-management.svg?raw";
import { getCurrentInstance, computed } from 'vue'

export function use$dev() {
  const instance = getCurrentInstance()
  if (instance) {
    return instance.appContext.config.globalProperties.$dev // 访问全局属性
  }
  return process.env.NODE_ENV === 'development'
  // return false
}

export default [
  {
    path: '/fund',
    component: Layout,
    redirect: '/fund/analysis',
    meta: {
      title: '案件文件管理',
    },
    children: [
      {
        path: '/fund/analysis',
        name: 'Analysis',
        component: () => import('@/views/fund/analysis.vue'),
        meta: {
          title: '案件文件管理',
          // showParent: false,
        },
      },
      {
        path: '/fund/cases',
        name: 'Cases',
        component: () => import('@/views/fund/cases/index.vue'),
        meta: {
          title: '数据处理',
          showLink: false,
          activePath: '/fund/analysis',
          // showParent: true
        },
      },
      {
        path: '/fund/textMapping',
        name: 'TextMapping',
        component: () => import('@/views/fund/cases/uploadTable/textMapping.vue'),
        meta: {
          title: '字段映射',
          showLink: false,
          activePath: '/fund/cases',
          // showParent: true
        },
      },
      {
        path: '/fund/translateView',
        name: 'TranslateView',
        component: () => import('@/views/fund/cases/translateView/index.vue'),
        meta: {
          title: '转换查看',
          showLink: false,
          activePath: '/fund/cases',
          // showParent: true
        },
      },
      // /fund/fundsAnalysis
      {
        path: '/fund/fundsAnalysis',
        name: 'FundsAnalysis',
        component: () => import('@/views/fund/fundsAnalysis/index.vue'),
        meta: {
          title: '智能筛查',
          showLink: false,
          activePath: '/fund/analysis',
          // showParent: true
        },
      },
    ],
  },
  {
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/quartz',
    meta: {
      title: '系统管理',
    },
    children: [
      {
        path: '/monitor/quartz',
        name: 'Quartz',
        component: () => import('@/views/monitor/quartz.vue'),
        meta: {
          title: '定时任务',
          // showParent: true
        },
      },
      {
        path: '/system/dict',
        name: 'Dict',
        component: () => import('@/views/system/index.vue'),
        meta: {
          title: '数据字典',
          // showParent: true
        },
      },
    ],
  },
  {
    path: '/test',
    component: Layout,
    redirect: '/test/t1',
    meta: {
      // icon: testSvg,
      showLink: use$dev(),
      title: '测试页',
      rank: 0,
    },
    children: [
      {
        path: '/test/t1',
        name: 'T1',
        component: () => import('@/views/test/t1.vue'),
        meta: {
          title: '测试页1',
          // icon: testSvg,
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test2',
    component: Layout,
    redirect: '/test/t2',
    meta: {
      // icon: testSvg,
      showLink: use$dev(),
      title: '测试页2',
      rank: 0,
    },
    children: [
      {
        path: '/test/t2',
        name: 'T2',
        component: () => import('@/views/test/t2.vue'),
        meta: {
          title: '测试页2',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/mergeTest',
    redirect: '/mergeTest/t3',
    component: Layout,
    meta: {
      showLink: use$dev(),
      // icon: testSvg,
      rank: 0,
      title: '合并测试页',
    },
    children: [
      {
        path: '/mergeTest/t3',
        name: 'T3',
        component: () => import('@/views/test/t3.vue'),
        meta: {
          title: '测试页33',
          // icon: testSvg,
          showLink: true,
        },
      },
      {
        path: '/mergeTest/t4',
        name: 'T4',
        component: () => import('@/views/test/t4.vue'),
        meta: {
          title: '测试页44',
          // icon: testSvg,
          showLink: true,
        },
      },
      {
        path: '/mergeTest/t5',
        name: 'T5',
        component: () => import('@/views/test/t5.vue'),
        meta: {
          title: '测试页55',
          // icon: testSvg,
          showLink: true,
        },
      },
      {
        path: '/mergeTest/t6',
        name: 'T6',
        component: () => import('@/views/test/t6.vue'),
        meta: {
          title: '测试页6',
          // icon: testSvg,
          showLink: true,
        },
      },
    ],
  },
]
