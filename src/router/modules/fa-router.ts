const Layout = () => import('@/layout/index.vue')
// import spaceManagementSvg from "@/assets/svg/menu/space-management.svg?raw";
import { getCurrentInstance } from 'vue'

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
    id: '/fund',
    component: Layout,
    redirect: '/fund/analysis',
    meta: {
      title: '案件文件管理',
    },
    children: [
      {
        id: 'fund_analysis',
        path: '/fund/analysis',
        name: 'Analysis',
        component: 'fund/analysis',
        meta: {
          title: '案件文件管理',
          // showParent: false,
        },
      },
      {
        path: '/fund/cases',
        id: '/fund/cases',
        name: 'Cases',
        component: 'fund/cases/index',
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
        component: 'fund/cases/uploadTable/textMapping',
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
        component: 'fund/cases/translateView/index',
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
        component: 'fund/fundsAnalysis/index',
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
    id: '/isystem',
    component: Layout,
    redirect: '/monitor/quartz',
    meta: {
      title: '系统管理',
    },
    children: [
      {
        path: '/monitor/quartz',
        name: 'Quartz',
        component: 'monitor/quartz',
        meta: {
          title: '定时任务',
          // showParent: true
        },
      },
      {
        path: '/system/dict',
        name: 'Dict',
        component: 'system/index',
        meta: {
          title: '数据字典',
          // showParent: true
        },
      },
    ],
  },
  {
    path: '/operation',
    id: '/operation',
    component: Layout,
    redirect: '/operation/errtask',
    meta: {
      title: '系统运营',
      icon: 'ri/computer-line',
    },
    children: [
      {
        path: '/operation/errtask',
        name: 'ErrTask',
        component: 'operations/errTask/index',
        meta: {
          title: '上传任务差错处理',
          icon: 'ep/document',
        },
      },
      {
        path: '/operation/configfile',
        name: 'FundFileConfig',
        component: 'operations/fundFileConfig/index',
        meta: {
          title: '资金文件配置',
          icon: 'ep/setting',
        },
      },
      {
        path: '/operation/configorg',
        name: 'OrgConfig',
        component: 'operations/orgConfig/index',
        meta: {
          title: '机构配置',
          icon: 'ep/setting',
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
        component: 'test/t1',
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
        component: 'test/t2',
        meta: {
          title: '测试页2',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test3',
    component: Layout,
    redirect: '/test/t3',
    meta: {
      // icon: testSvg,
      showLink: use$dev(),
      title: '测试页3',
      rank: 0,
    },
    children: [
      {
        path: '/test/t3',
        name: 'T3',
        component: 'test/t3',
        meta: {
          title: '测试页3',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/test4',
    component: Layout,
    redirect: '/test/t4',
    meta: {
      // icon: testSvg,
      showLink: use$dev(),
      title: '测试页4',
      rank: 0,
    },
    children: [
      {
        path: '/test/t4',
        name: 'T4',
        component: 'test/t4',
        meta: {
          title: '测试页4',
          showLink: true,
        },
      },
    ],
  },
  {
    path: '/mergeTest',
    redirect: '/mergeTest/t5',
    component: Layout,
    meta: {
      showLink: use$dev(),
      // icon: testSvg,
      rank: 0,
      title: '合并测试页',
    },
    children: [
      {
        path: '/mergeTest/t5',
        name: 'T5',
        component: 'test/t5',
        meta: {
          title: '测试页55',
          // icon: testSvg,
          showLink: true,
        },
      },
      {
        path: '/mergeTest/t6',
        name: 'T6',
        component: 'test/t6',
        meta: {
          title: '测试页6',
          // icon: testSvg,
          showLink: true,
        },
      },
    ],
  },
]
