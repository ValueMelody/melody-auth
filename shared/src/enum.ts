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
  WriteRole = 'write_role',
  ReadScope = 'read_scope',
  WriteScope = 'write_scope',
  ReadOrg = 'read_org',
  WriteOrg = 'write_org',
}

export enum Role {
  SuperAdmin = 'super_admin',
}

export enum SessionStorageKey {
  State = 'melody-auth-state',
  CodeVerifier = 'melody-auth-code-verifier',
}

/**
 * Storage keys for authentication tokens.
 */
export enum StorageKey {
  RefreshToken = 'melody-auth-refresh-token',
  IdToken = 'melody-auth-id-token',
  /**
   * Access token storage key.
   * Note: This should only be used with full-stack frameworks (e.g., Next.js)
   * where you need to access the AccessToken through cookies from the request object.
   * In typical browser scenarios, access tokens are kept in memory for security.
   */
  AccessToken = 'melody-auth-access-token',
}
