export enum Scope {
  OpenId = 'openid',
  Profile = 'profile',
  OfflineAccess = 'offline_access',
  Root = 'root',
  ReadUser = 'read_user',
  WriteUser = 'write_user',
  ReadApp = 'read_app',
  WriteApp = 'write_app',
  ReadRole = 'read_role',
  WriteRole = 'write_role',
  ReadScope = 'read_scope',
  WriteScope = 'write_scope',
  ReadOrg = 'read_org',
  WriteOrg = 'write_org',
}

export enum Role {
  SuperAdmin = 'super_admin',
}

export enum ClientType {
  SPA = 'spa',
  S2S = 's2s',
}

export enum BannerType {
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
}
