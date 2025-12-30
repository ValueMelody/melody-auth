import { useAuthStore } from '@/stores/auth'

export enum Access {
  ReadUser = 'ReadUser',
  WriteUser = 'WriteUser',
  ReadApp = 'ReadApp',
  WriteApp = 'WriteApp',
  ReadOrg = 'ReadOrg',
  WriteOrg = 'WriteOrg',
  ReadRole = 'ReadRole',
  WriteRole = 'WriteRole',
  ReadScope = 'ReadScope',
  WriteScope = 'WriteScope',
  ReadUserAttribute = 'ReadUserAttribute',
  WriteUserAttribute = 'WriteUserAttribute',
  ReadLog = 'ReadLog',
  ManageSamlSso = 'ManageSamlSso'
}

const RoleAccesses: Record<string, Access[]> = {
  super_admin: Object.values(Access),
  admin: [
    Access.ReadUser, Access.WriteUser,
    Access.ReadApp, Access.WriteApp,
    Access.ReadOrg, Access.WriteOrg,
    Access.ReadRole, Access.WriteRole,
    Access.ReadScope, Access.WriteScope,
    Access.ReadUserAttribute, Access.WriteUserAttribute,
    Access.ReadLog
  ]
}

function getAllowedRoles(roles: string[]): string[] {
  return roles.filter((role) => Object.keys(RoleAccesses).includes(role))
}

export function useAccess() {
  const authStore = useAuthStore()

  function isAllowedAccess(access: Access): boolean {
    const roles = authStore.userInfo?.roles ?? []
    const allowedRoles = getAllowedRoles(roles)
    return allowedRoles.some((role) => RoleAccesses[role]?.includes(access))
  }

  return {
    isAllowedAccess
  }
}
