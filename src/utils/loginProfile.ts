type LoginProfile = {
  avatar: string
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
}

const ALL_PERMISSIONS = ['*:*:*']
const FUND_PERMISSIONS = ['fund:analysis:view']

const LOGIN_PROFILE_MAP: Record<string, LoginProfile> = {
  admin: {
    avatar: 'https://avatars.githubusercontent.com/u/44761321',
    username: 'admin',
    nickname: '管理员',
    roles: ['admin'],
    permissions: ALL_PERMISSIONS,
  },
  fauser: {
    avatar: 'https://avatars.githubusercontent.com/u/52823142',
    username: 'fauser',
    nickname: '资金分析用户',
    roles: ['fauser'],
    permissions: FUND_PERMISSIONS,
  },
}

export function getLoginProfile(username?: string) {
  if (!username) return null
  return LOGIN_PROFILE_MAP[username.trim().toLowerCase()] ?? null
}
