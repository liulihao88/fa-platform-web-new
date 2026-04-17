import request from '@/utils/request'

export type PageResult<T = any> = {
  records: T[]
  total: number
}

export const checkDuplicate = (params: {
  tableName: string
  fieldName: string
  fieldVal: string
  dataId?: string | number | null
}) => {
  return request('sys/duplicate/check', 'get', {
    params,
    joinTimeStamp: true,
    resolve: 'data',
  })
}

export const getSystemDictItems = (code: string) => {
  return request(`sys/dict/getDictItems/${code}`)
}

export const getMenuList = (params?: Record<string, any>) => {
  return request('sys/permission/list', { params })
}

export const addMenu = (data) => {
  return request('sys/permission/add', 'post', { data })
}

export const editMenu = (data) => {
  return request('sys/permission/edit', 'post', { data })
}

export const deleteMenu = (id: string | number) => {
  return request('sys/permission/delete', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}

export const deleteBatchMenu = (ids: string) => {
  return request('sys/permission/deleteBatch', 'delete', {
    params: { ids },
    joinTimeStamp: true,
  })
}

export const checkMenuPath = (params: { id?: string | number; url?: string; alwaysShow?: boolean | number }) => {
  return request('sys/permission/checkPermDuplication', 'get', {
    params,
    joinTimeStamp: true,
    resolve: 'data',
  })
}

export const getMenuRuleList = (params) => {
  return request('sys/permission/queryPermissionRule', { params })
}

export const addMenuRule = (data) => {
  return request('sys/permission/addPermissionRule', 'post', { data })
}

export const editMenuRule = (data) => {
  return request('sys/permission/editPermissionRule', 'post', { data })
}

export const deleteMenuRule = (id: string | number) => {
  return request('sys/permission/deletePermissionRule', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}

export const getRoleList = (params): Promise<PageResult> => {
  return request('sys/role/list', { params })
}

export const addRole = (data) => {
  return request('sys/role/add', 'post', { data })
}

export const editRole = (data) => {
  return request('sys/role/edit', 'post', { data })
}

export const deleteRole = (id: string | number) => {
  return request('sys/role/delete', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}

export const deleteBatchRole = (ids: string) => {
  return request('sys/role/deleteBatch', 'delete', {
    params: { ids },
    joinTimeStamp: true,
  })
}

export const exportRole = (params) => {
  return request('sys/role/exportXls', 'get', {
    params,
    joinTimeStamp: true,
    download: true,
    fileName: '角色列表.xlsx',
  })
}

export const checkRoleCode = (params: { id?: string | number; roleCode: string }) => {
  return request('sys/role/checkRoleCode', 'get', {
    params,
    joinTimeStamp: true,
    resolve: 'data',
  })
}

export const getRolePermissionTree = () => {
  return request('sys/role/queryTreeList')
}

export const getRolePermission = (roleId: string | number) => {
  return request('sys/permission/queryRolePermission', {
    params: { roleId },
    joinTimeStamp: true,
  })
}

export const saveRolePermission = (data) => {
  return request('sys/permission/saveRolePermission', 'post', { data })
}

export const getRoleDataRule = (functionId: string | number, roleId: string | number) => {
  return request(`sys/role/datarule/${functionId}/${roleId}`, {
    joinTimeStamp: true,
  })
}

export const saveRoleDataRule = (data) => {
  return request('sys/role/datarule', 'post', { data })
}

export const getRoleUserList = (params): Promise<PageResult> => {
  return request('sys/user/userRoleList', { params })
}

export const deleteRoleUser = (params: { userId: string | number; roleId: string | number }) => {
  return request('sys/user/deleteUserRole', 'delete', {
    params,
    joinTimeStamp: true,
  })
}

export const deleteBatchRoleUser = (params: { userIds: string; roleId: string | number }) => {
  return request('sys/user/deleteUserRoleBatch', 'delete', {
    params,
    joinTimeStamp: true,
  })
}

export const addRoleUsers = (data: { roleId: string | number; userIdList: Array<string | number> }) => {
  return request('sys/user/addSysUserRole', 'post', { data })
}

export const getDepartTree = (params?: Record<string, any>) => {
  return request('sys/sysDepart/queryDepartTreeSync', { params })
}

export const getDepartIdTree = () => {
  return request('sys/sysDepart/queryIdTree')
}

export const searchDepartTree = (params: { keyWord: string }) => {
  return request('sys/sysDepart/searchBy', { params })
}

export const addDepart = (data) => {
  return request('sys/sysDepart/add', 'post', { data })
}

export const editDepart = (data) => {
  return request('sys/sysDepart/edit', 'put', { data })
}

export const deleteDepart = (id: string | number) => {
  return request('sys/sysDepart/delete', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}

export const deleteBatchDepart = (ids: string) => {
  return request('sys/sysDepart/deleteBatch', 'delete', {
    params: { ids },
    joinTimeStamp: true,
  })
}

export const exportDepart = (params) => {
  return request('sys/sysDepart/exportXls', 'get', {
    params,
    joinTimeStamp: true,
    download: true,
    fileName: '部门信息.xlsx',
  })
}

export const getDepartPermissionTree = () => {
  return request('sys/role/queryTreeList')
}

export const getDepartPermission = (departId: string | number) => {
  return request('sys/permission/queryDepartPermission', {
    params: { departId },
    joinTimeStamp: true,
  })
}

export const saveDepartPermission = (data) => {
  return request('sys/permission/saveDepartPermission', 'post', { data })
}

export const getDepartDataRule = (functionId: string | number, departId: string | number) => {
  return request(`sys/sysDepartPermission/datarule/${functionId}/${departId}`, {
    joinTimeStamp: true,
  })
}

export const saveDepartDataRule = (data) => {
  return request('sys/sysDepartPermission/datarule', 'post', { data })
}

export const getUserList = (params): Promise<PageResult> => {
  return request('sys/user/listAll', { params })
}

export const addUser = (data) => {
  return request('sys/user/add', 'post', { data })
}

export const editUser = (data) => {
  return request('sys/user/edit', 'post', { data })
}

export const deleteUser = (id: string | number) => {
  return request('sys/user/delete', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}

export const deleteBatchUser = (ids: string) => {
  return request('sys/user/deleteBatch', 'delete', {
    params: { ids },
    joinTimeStamp: true,
  })
}

export const exportUser = (params) => {
  return request('sys/user/exportXls', 'get', {
    params,
    joinTimeStamp: true,
    download: true,
    fileName: '用户列表.xlsx',
  })
}

export const getUserRoles = (userId: string | number) => {
  return request('sys/user/queryUserRole', {
    params: { userid: userId },
    joinTimeStamp: true,
    showError: false,
  })
}

export const getAllRoleOptions = () => {
  return request('sys/role/queryallNoByTenant', {
    joinTimeStamp: true,
  })
}

export const getUserDepartList = (userId: string | number) => {
  return request('sys/user/userDepartList', {
    params: { userId },
    joinTimeStamp: true,
    showError: false,
  })
}

export const getAllPostList = async () => {
  const result = await request('sys/position/list', {
    joinTimeStamp: true,
  })
  return result?.records || []
}

export const updateUserPasswordByAdmin = (data: { username: string; password: string; confirmPassword?: string }) => {
  return request('sys/user/changePassword', 'put', { data })
}

export const batchFrozenUser = (data: { ids: string; status: number | string }) => {
  return request('sys/user/frozenBatch', 'put', { data })
}

export const getUserRecycleList = (params): Promise<PageResult> => {
  return request('sys/user/recycleBin', { params })
}

export const revertRecycleUser = (data: { userIds: string }) => {
  return request('sys/user/putRecycleBin', 'put', { data })
}

export const deleteRecycleUser = (userIds: string) => {
  return request('sys/user/deleteRecycleBin', 'delete', {
    params: { userIds },
    joinTimeStamp: true,
  })
}

export const getUserAgent = (userName: string) => {
  return request('sys/sysUserAgent/queryByUserName', {
    params: { userName },
    joinTimeStamp: true,
  })
}

export const addUserAgent = (data) => {
  return request('sys/sysUserAgent/add', 'post', { data })
}

export const editUserAgent = (data) => {
  return request('sys/sysUserAgent/edit', 'post', { data })
}

export const deleteUserAgent = (id: string | number) => {
  return request('sys/sysUserAgent/delete', 'delete', {
    params: { id },
    joinTimeStamp: true,
  })
}
