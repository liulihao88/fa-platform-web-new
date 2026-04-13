import { getStorage } from '@oeos-components/utils'
export const BOOLEAN_OPTIONS = [
  {
    label: '是',
    value: '1',
  },
  {
    label: '否',
    value: '0',
  },
]

export const TIME_WIDTH_ATTRS = {
  width: 160,
  align: 'center',
}

export const setEditAttrs = (attrs = {}) => ({
  comp: 'o-icon',
  attrs: {
    name: 'edit',
    type: 'svg',
    content: '编辑',
    ...attrs,
  },
})

export const setDeleteAttrs = (attrs = {}) => ({
  comp: 'o-icon',
  attrs: {
    name: 'delete',
    type: 'svg',
    content: '删除',
    ...attrs,
  },
  // reConfirm: !getStorage('fa-$dev'),
  reConfirm: true,
})

export const setDetailAttrs = (attrs = {}) => ({
  comp: 'o-icon',
  attrs: {
    type: 'svg',
    name: 'detail',
    content: '详情',
    ...attrs,
  },
})
