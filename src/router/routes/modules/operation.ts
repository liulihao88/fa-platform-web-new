import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/operation',
  name: 'Operation',
  component: LAYOUT,
  meta: {
    hideChildrenInMenu: false,
    icon: 'simple-icons:analysis-dot-me',
    title: t('routes.dashboard.analysis'),
    orderNo: 100000,
  },
  children: [
    {
      path: 'errorHandler',
      name: 'errorHandler',
      component: () => import('/@/views/operation/components/errorHandler.vue'),
      meta: {
        title: t('routes.dashboard.analysis'),
        icon: 'simple-icons:analysis-dot-me',
        hideMenu: true,
      },
    },
    {
      path: 'sourceStream',
      name: 'sourceStream',
      component: () => import('/@/views/fund/analysis/case.vue'),
      meta: {
        title: t('routes.dashboard.analysis'),
        icon: 'simple-icons:analysis-dot-me',
        hideMenu: true,
      },
    },
  ],
};

export default dashboard;
