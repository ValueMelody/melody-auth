export enum ClientType {
  SPA = 'spa',
  S2S = 's2s',
}

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
  WriteRole= 'write_role',
  ReadScope = 'read_scope',
  WriteScope = 'write_scope',
}

export enum Role {
  SuperAdmin = 'super_admin',
}

export enum SessionStorageKey {
  State = 'melody-auth-state',
  CodeVerifier = 'melody-auth-code-verifier',
}

export enum StorageKey {
  RefreshToken = 'melody-auth-refresh-token',
}
