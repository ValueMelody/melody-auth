import { typeTool } from './'

export enum Access {
  ReadUser = 'ReadUser',
  WriteUser = 'WriteUser',
  ReadUserAttribute = 'ReadUserAttribute',
  WriteUserAttribute = 'WriteUserAttribute',
  ReadRole = 'ReadRole',
  WriteRole = 'WriteRole',
  ReadApp = 'ReadApp',
  WriteApp = 'WriteApp',
  ReadScope = 'ReadScope',
  WriteScope = 'WriteScope',
  ReadOrg = 'ReadOrg',
  WriteOrg = 'WriteOrg',
  ReadLog = 'ReadLog',
  WriteLog = 'WriteLog',
  Impersonation = 'Impersonation',
  ManageSamlSso = 'ManageSamlSso',
}

export const AllowedRoles = [
  typeTool.Role.SuperAdmin,
]

export const RoleAccesses = {
  [typeTool.Role.SuperAdmin]: [
    Access.ReadUser,
    Access.WriteUser,
    Access.ReadUserAttribute,
    Access.WriteUserAttribute,
    Access.ReadRole,
    Access.WriteRole,
    Access.ReadApp,
    Access.WriteApp,
    Access.ReadScope,
    Access.WriteScope,
    Access.ReadOrg,
    Access.WriteOrg,
    Access.ReadLog,
    Access.WriteLog,
    Access.Impersonation,
    Access.ManageSamlSso,
  ],
}

export const getAllowedRoles = (roles: string[]): typeTool.Role[] => {
  return AllowedRoles.filter((role) => roles.some((allowedRole) => allowedRole === role))
}

export const isAllowedAccess = (
  access: Access, roles?: string[],
): boolean => {
  const allowedRoles = getAllowedRoles(roles ?? [])
  return allowedRoles.some((role) => RoleAccesses[role].includes(access))
}
