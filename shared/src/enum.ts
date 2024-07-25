export enum ClientType {
  SPA = 'spa',
  S2S = 's2s',
}

export enum Scope {
  OpenId = 'openid',
  Profile = 'profile',
  OfflineAccess = 'offline_access',
  READ_USER = 'read_user',
  WRITE_USER = 'write_user',
  READ_APP = 'read_app',
  WRITE_APP = 'write_app',
  READ_ROLE = 'read_role',
  WRITE_ROLE= 'write_role',
  READ_SCOPE = 'read_scope',
  WRITE_SCOPE = 'write_scope',
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
