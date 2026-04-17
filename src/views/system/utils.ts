export const MENU_TYPE_OPTIONS = [
  { label: '一级菜单', value: 0 },
  { label: '子菜单', value: 1 },
  { label: '按钮/权限', value: 2 },
]

export const PERMS_TYPE_OPTIONS = [
  { label: '可见/可访问', value: '1' },
  { label: '可编辑', value: '2' },
]

export const VALID_STATUS_OPTIONS = [
  { label: '有效', value: '1' },
  { label: '无效', value: '0' },
]

export const YES_NO_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false },
]

export const SYSTEM_VARIABLE_OPTIONS = [
  { label: '登录用户账号', value: '#{sys_user_code}' },
  { label: '登录用户名称', value: '#{sys_user_name}' },
  { label: '当前日期', value: '#{sys_date}' },
  { label: '当前时间', value: '#{sys_time}' },
  { label: '登录用户部门', value: '#{sys_org_code}' },
  { label: '用户拥有部门', value: '#{sys_multi_org_code}' },
  { label: '登录用户租户', value: '#{tenant_id}' },
]

function pickValue(source: Record<string, any>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return fallback
}

export function normalizeTreeOptions<T extends Record<string, any>>(
  nodes: T[] = [],
  options: {
    labelKeys?: string[]
    valueKeys?: string[]
    childrenKey?: string
  } = {},
) {
  const {
    labelKeys = ['label', 'title', 'slotTitle', 'name', 'departName'],
    valueKeys = ['id', 'key', 'value'],
    childrenKey = 'children',
  } = options

  return (nodes || []).map((node) => {
    const value = pickValue(node, valueKeys)
    const label = pickValue(node, labelKeys, String(value || ''))
    const children = normalizeTreeOptions(node?.[childrenKey] || [], options)

    return {
      ...node,
      id: node.id ?? value,
      key: node.key ?? value,
      value,
      label,
      children,
    }
  })
}

export function flattenTree<T extends Record<string, any>>(nodes: T[] = [], childrenKey = 'children') {
  const result: T[] = []
  const loop = (items: T[]) => {
    items.forEach((item) => {
      result.push(item)
      if (Array.isArray(item?.[childrenKey]) && item[childrenKey].length > 0) {
        loop(item[childrenKey])
      }
    })
  }
  loop(nodes)
  return result
}

export function collectTreeKeys(nodes: Record<string, any>[] = [], childrenKey = 'children') {
  return flattenTree(nodes, childrenKey)
    .map((item) => item.id ?? item.key ?? item.value)
    .filter(Boolean)
}

export function collectNodeDescendantKeys(node: Record<string, any>, childrenKey = 'children') {
  const result: Array<string | number> = []
  const loop = (item?: Record<string, any>) => {
    if (!item) return
    const key = item.id ?? item.key ?? item.value
    if (key !== undefined && key !== null && key !== '') {
      result.push(key)
    }
    ;(item?.[childrenKey] || []).forEach((child) => loop(child))
  }
  loop(node)
  return result
}

export function mergeKeys(base: Array<string | number>, append: Array<string | number>) {
  return Array.from(new Set([...(base || []), ...(append || [])]))
}

export function removeKeys(base: Array<string | number>, removing: Array<string | number>) {
  const removingSet = new Set(removing || [])
  return (base || []).filter((item) => !removingSet.has(item))
}

export function ensureArray(value: any) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return []
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [value]
}

export function getDictLabel(options: Array<Record<string, any>> = [], value: string | number, fallback = '-') {
  const target = (options || []).find((item) => String(item?.value) === String(value))
  return target?.label || target?.text || target?.title || fallback
}

export function setStorageFlag(key: string, value: Record<string, any>) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStorageFlag<T extends Record<string, any>>(key: string, fallback: T) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return { ...fallback, ...JSON.parse(raw) }
  } catch (error) {
    return fallback
  }
}
