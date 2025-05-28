import { authApi as api } from './'
export const addTagTypes = [
  'Scopes',
  'Roles',
  'Orgs',
  'Apps',
  'Users',
  'User Attributes',
  'Logs',
] as const
const injectedRtkApi = api
  .enhanceEndpoints({ addTagTypes })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1Scopes: build.query<
        GetApiV1ScopesApiResponse,
        GetApiV1ScopesApiArg
      >({
        query: () => ({ url: '/api/v1/scopes' }),
        providesTags: ['Scopes'],
      }),
      postApiV1Scopes: build.mutation<
        PostApiV1ScopesApiResponse,
        PostApiV1ScopesApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/scopes',
          method: 'POST',
          body: queryArg.postScopeReq,
        }),
        invalidatesTags: ['Scopes'],
      }),
      getApiV1ScopesById: build.query<
        GetApiV1ScopesByIdApiResponse,
        GetApiV1ScopesByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/scopes/${queryArg.id}` }),
        providesTags: ['Scopes'],
      }),
      putApiV1ScopesById: build.mutation<
        PutApiV1ScopesByIdApiResponse,
        PutApiV1ScopesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scopes/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.putScopeReq,
        }),
        invalidatesTags: ['Scopes'],
      }),
      deleteApiV1ScopesById: build.mutation<
        DeleteApiV1ScopesByIdApiResponse,
        DeleteApiV1ScopesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/scopes/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Scopes'],
      }),
      getApiV1Roles: build.query<GetApiV1RolesApiResponse, GetApiV1RolesApiArg>({
        query: () => ({ url: '/api/v1/roles' }),
        providesTags: ['Roles'],
      }),
      postApiV1Roles: build.mutation<
        PostApiV1RolesApiResponse,
        PostApiV1RolesApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/roles',
          method: 'POST',
          body: queryArg.postRoleReq,
        }),
        invalidatesTags: ['Roles'],
      }),
      getApiV1RolesById: build.query<
        GetApiV1RolesByIdApiResponse,
        GetApiV1RolesByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/roles/${queryArg.id}` }),
        providesTags: ['Roles'],
      }),
      putApiV1RolesById: build.mutation<
        PutApiV1RolesByIdApiResponse,
        PutApiV1RolesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.putRoleReq,
        }),
        invalidatesTags: ['Roles'],
      }),
      deleteApiV1RolesById: build.mutation<
        DeleteApiV1RolesByIdApiResponse,
        DeleteApiV1RolesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/roles/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Roles'],
      }),
      getApiV1Orgs: build.query<GetApiV1OrgsApiResponse, GetApiV1OrgsApiArg>({
        query: () => ({ url: '/api/v1/orgs' }),
        providesTags: ['Orgs'],
      }),
      postApiV1Orgs: build.mutation<
        PostApiV1OrgsApiResponse,
        PostApiV1OrgsApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/orgs',
          method: 'POST',
          body: queryArg.postOrgReq,
        }),
        invalidatesTags: ['Orgs'],
      }),
      getApiV1OrgsById: build.query<
        GetApiV1OrgsByIdApiResponse,
        GetApiV1OrgsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/orgs/${queryArg.id}` }),
        providesTags: ['Orgs'],
      }),
      putApiV1OrgsById: build.mutation<
        PutApiV1OrgsByIdApiResponse,
        PutApiV1OrgsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/orgs/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.putOrgReq,
        }),
        invalidatesTags: ['Orgs'],
      }),
      deleteApiV1OrgsById: build.mutation<
        DeleteApiV1OrgsByIdApiResponse,
        DeleteApiV1OrgsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/orgs/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Orgs'],
      }),
      getApiV1OrgsByIdUsers: build.query<
        GetApiV1OrgsByIdUsersApiResponse,
        GetApiV1OrgsByIdUsersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/orgs/${queryArg.id}/users`,
          params: {
            page_size: queryArg.pageSize,
            page_number: queryArg.pageNumber,
            search: queryArg.search,
          },
        }),
        providesTags: ['Orgs'],
      }),
      getApiV1Apps: build.query<GetApiV1AppsApiResponse, GetApiV1AppsApiArg>({
        query: () => ({ url: '/api/v1/apps' }),
        providesTags: ['Apps'],
      }),
      postApiV1Apps: build.mutation<
        PostApiV1AppsApiResponse,
        PostApiV1AppsApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/apps',
          method: 'POST',
          body: queryArg.postAppReq,
        }),
        invalidatesTags: ['Apps'],
      }),
      getApiV1AppsById: build.query<
        GetApiV1AppsByIdApiResponse,
        GetApiV1AppsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/apps/${queryArg.id}` }),
        providesTags: ['Apps'],
      }),
      putApiV1AppsById: build.mutation<
        PutApiV1AppsByIdApiResponse,
        PutApiV1AppsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/apps/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.putAppReq,
        }),
        invalidatesTags: ['Apps'],
      }),
      deleteApiV1AppsById: build.mutation<
        DeleteApiV1AppsByIdApiResponse,
        DeleteApiV1AppsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/apps/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Apps'],
      }),
      getApiV1Users: build.query<GetApiV1UsersApiResponse, GetApiV1UsersApiArg>({
        query: (queryArg) => ({
          url: '/api/v1/users',
          params: {
            page_size: queryArg.pageSize,
            page_number: queryArg.pageNumber,
            search: queryArg.search,
          },
        }),
        providesTags: ['Users'],
      }),
      getApiV1UsersByAuthId: build.query<
        GetApiV1UsersByAuthIdApiResponse,
        GetApiV1UsersByAuthIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.authId}` }),
        providesTags: ['Users'],
      }),
      putApiV1UsersByAuthId: build.mutation<
        PutApiV1UsersByAuthIdApiResponse,
        PutApiV1UsersByAuthIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}`,
          method: 'PUT',
          body: queryArg.putUserReq,
        }),
        invalidatesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthId: build.mutation<
        DeleteApiV1UsersByAuthIdApiResponse,
        DeleteApiV1UsersByAuthIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      getApiV1UsersByAuthIdLockedIps: build.query<
        GetApiV1UsersByAuthIdLockedIpsApiResponse,
        GetApiV1UsersByAuthIdLockedIpsApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.authId}/locked-ips` }),
        providesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdLockedIps: build.mutation<
        DeleteApiV1UsersByAuthIdLockedIpsApiResponse,
        DeleteApiV1UsersByAuthIdLockedIpsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/locked-ips`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdVerifyEmail: build.mutation<
        PostApiV1UsersByAuthIdVerifyEmailApiResponse,
        PostApiV1UsersByAuthIdVerifyEmailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/verify-email`,
          method: 'POST',
        }),
        invalidatesTags: ['Users'],
      }),
      getApiV1UsersByAuthIdConsentedApps: build.query<
        GetApiV1UsersByAuthIdConsentedAppsApiResponse,
        GetApiV1UsersByAuthIdConsentedAppsApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.authId}/consented-apps` }),
        providesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdConsentedAppsAndAppId: build.mutation<
        DeleteApiV1UsersByAuthIdConsentedAppsAndAppIdApiResponse,
        DeleteApiV1UsersByAuthIdConsentedAppsAndAppIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/consented-apps/${queryArg.appId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      getApiV1UsersByAuthIdPasskeys: build.query<
        GetApiV1UsersByAuthIdPasskeysApiResponse,
        GetApiV1UsersByAuthIdPasskeysApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.authId}/passkeys` }),
        providesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdPasskeysAndPasskeyId: build.mutation<
        DeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdApiResponse,
        DeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/passkeys/${queryArg.passkeyId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdEmailMfa: build.mutation<
        PostApiV1UsersByAuthIdEmailMfaApiResponse,
        PostApiV1UsersByAuthIdEmailMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/email-mfa`,
          method: 'POST',
        }),
        invalidatesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdEmailMfa: build.mutation<
        DeleteApiV1UsersByAuthIdEmailMfaApiResponse,
        DeleteApiV1UsersByAuthIdEmailMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/email-mfa`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdOtpMfa: build.mutation<
        PostApiV1UsersByAuthIdOtpMfaApiResponse,
        PostApiV1UsersByAuthIdOtpMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/otp-mfa`,
          method: 'POST',
        }),
        invalidatesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdOtpMfa: build.mutation<
        DeleteApiV1UsersByAuthIdOtpMfaApiResponse,
        DeleteApiV1UsersByAuthIdOtpMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/otp-mfa`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdSmsMfa: build.mutation<
        PostApiV1UsersByAuthIdSmsMfaApiResponse,
        PostApiV1UsersByAuthIdSmsMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/sms-mfa`,
          method: 'POST',
        }),
        invalidatesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdSmsMfa: build.mutation<
        DeleteApiV1UsersByAuthIdSmsMfaApiResponse,
        DeleteApiV1UsersByAuthIdSmsMfaApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/sms-mfa`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdAccountLinkingAndLinkingAuthId: build.mutation<
        PostApiV1UsersByAuthIdAccountLinkingAndLinkingAuthIdApiResponse,
        PostApiV1UsersByAuthIdAccountLinkingAndLinkingAuthIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/account-linking/${queryArg.linkingAuthId}`,
          method: 'POST',
        }),
        invalidatesTags: ['Users'],
      }),
      deleteApiV1UsersByAuthIdAccountLinking: build.mutation<
        DeleteApiV1UsersByAuthIdAccountLinkingApiResponse,
        DeleteApiV1UsersByAuthIdAccountLinkingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/account-linking`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV1UsersByAuthIdImpersonationAndAppId: build.mutation<
        PostApiV1UsersByAuthIdImpersonationAndAppIdApiResponse,
        PostApiV1UsersByAuthIdImpersonationAndAppIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/users/${queryArg.authId}/impersonation/${queryArg.appId}`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Users'],
      }),
      getApiV1UserAttributes: build.query<
        GetApiV1UserAttributesApiResponse,
        GetApiV1UserAttributesApiArg
      >({
        query: () => ({ url: '/api/v1/user-attributes' }),
        providesTags: ['User Attributes'],
      }),
      postApiV1UserAttributes: build.mutation<
        PostApiV1UserAttributesApiResponse,
        PostApiV1UserAttributesApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/user-attributes',
          method: 'POST',
          body: queryArg.postUserAttributeReq,
        }),
        invalidatesTags: ['User Attributes'],
      }),
      getApiV1UserAttributesById: build.query<
        GetApiV1UserAttributesByIdApiResponse,
        GetApiV1UserAttributesByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/user-attributes/${queryArg.id}` }),
        providesTags: ['User Attributes'],
      }),
      putApiV1UserAttributesById: build.mutation<
        PutApiV1UserAttributesByIdApiResponse,
        PutApiV1UserAttributesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/user-attributes/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.putUserAttributeReq,
        }),
        invalidatesTags: ['User Attributes'],
      }),
      deleteApiV1UserAttributesById: build.mutation<
        DeleteApiV1UserAttributesByIdApiResponse,
        DeleteApiV1UserAttributesByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/user-attributes/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['User Attributes'],
      }),
      getApiV1LogsEmail: build.query<
        GetApiV1LogsEmailApiResponse,
        GetApiV1LogsEmailApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/email',
          params: {
            page_size: queryArg.pageSize,
            page_number: queryArg.pageNumber,
          },
        }),
        providesTags: ['Logs'],
      }),
      deleteApiV1LogsEmail: build.mutation<
        DeleteApiV1LogsEmailApiResponse,
        DeleteApiV1LogsEmailApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/email',
          method: 'DELETE',
          params: { before: queryArg.before },
        }),
        invalidatesTags: ['Logs'],
      }),
      getApiV1LogsEmailById: build.query<
        GetApiV1LogsEmailByIdApiResponse,
        GetApiV1LogsEmailByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/logs/email/${queryArg.id}` }),
        providesTags: ['Logs'],
      }),
      getApiV1LogsSms: build.query<
        GetApiV1LogsSmsApiResponse,
        GetApiV1LogsSmsApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/sms',
          params: {
            page_size: queryArg.pageSize,
            page_number: queryArg.pageNumber,
          },
        }),
        providesTags: ['Logs'],
      }),
      deleteApiV1LogsSms: build.mutation<
        DeleteApiV1LogsSmsApiResponse,
        DeleteApiV1LogsSmsApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/sms',
          method: 'DELETE',
          params: { before: queryArg.before },
        }),
        invalidatesTags: ['Logs'],
      }),
      getApiV1LogsSmsById: build.query<
        GetApiV1LogsSmsByIdApiResponse,
        GetApiV1LogsSmsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/logs/sms/${queryArg.id}` }),
        providesTags: ['Logs'],
      }),
      getApiV1LogsSignIn: build.query<
        GetApiV1LogsSignInApiResponse,
        GetApiV1LogsSignInApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/sign-in',
          params: {
            page_size: queryArg.pageSize,
            page_number: queryArg.pageNumber,
          },
        }),
        providesTags: ['Logs'],
      }),
      deleteApiV1LogsSignIn: build.mutation<
        DeleteApiV1LogsSignInApiResponse,
        DeleteApiV1LogsSignInApiArg
      >({
        query: (queryArg) => ({
          url: '/api/v1/logs/sign-in',
          method: 'DELETE',
          params: { before: queryArg.before },
        }),
        invalidatesTags: ['Logs'],
      }),
      getApiV1LogsSignInById: build.query<
        GetApiV1LogsSignInByIdApiResponse,
        GetApiV1LogsSignInByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/logs/sign-in/${queryArg.id}` }),
        providesTags: ['Logs'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as authApi }
export type GetApiV1ScopesApiResponse = /** status 200 A list of scopes */ {
  scopes?: Scope[];
};
export type GetApiV1ScopesApiArg = void;
export type PostApiV1ScopesApiResponse = /** status 201 undefined */ {
  scope?: ScopeDetail;
};
export type PostApiV1ScopesApiArg = {
  postScopeReq: PostScopeReq;
};
export type GetApiV1ScopesByIdApiResponse =
  /** status 200 A single scope object */ {
    scope?: ScopeDetail;
  };
export type GetApiV1ScopesByIdApiArg = {
  /** The unique ID of the scope */
  id: number;
};
export type PutApiV1ScopesByIdApiResponse = /** status 200 undefined */ {
  scope?: ScopeDetail;
};
export type PutApiV1ScopesByIdApiArg = {
  /** The unique ID of the scope */
  id: number;
  putScopeReq: PutScopeReq;
};
export type DeleteApiV1ScopesByIdApiResponse = unknown;
export type DeleteApiV1ScopesByIdApiArg = {
  /** The unique ID of the scope */
  id: number;
};
export type GetApiV1RolesApiResponse = /** status 200 A list of roles */ {
  roles?: Role[];
};
export type GetApiV1RolesApiArg = void;
export type PostApiV1RolesApiResponse = /** status 201 undefined */ {
  role?: Role;
};
export type PostApiV1RolesApiArg = {
  postRoleReq: PostRoleReq;
};
export type GetApiV1RolesByIdApiResponse =
  /** status 200 A single role object */ {
    role?: Role;
  };
export type GetApiV1RolesByIdApiArg = {
  /** The unique ID of the role */
  id: number;
};
export type PutApiV1RolesByIdApiResponse = /** status 200 undefined */ {
  role?: Role;
};
export type PutApiV1RolesByIdApiArg = {
  /** The unique ID of the role */
  id: number;
  putRoleReq: PutRoleReq;
};
export type DeleteApiV1RolesByIdApiResponse = unknown;
export type DeleteApiV1RolesByIdApiArg = {
  /** The unique ID of the role */
  id: number;
};
export type GetApiV1OrgsApiResponse = /** status 200 A list of orgs */ {
  orgs?: Org[];
};
export type GetApiV1OrgsApiArg = void;
export type PostApiV1OrgsApiResponse = /** status 201 undefined */ {
  org?: Org;
};
export type PostApiV1OrgsApiArg = {
  postOrgReq: PostOrgReq;
};
export type GetApiV1OrgsByIdApiResponse =
  /** status 200 A single org object */ {
    org?: Org;
  };
export type GetApiV1OrgsByIdApiArg = {
  /** The unique ID of the org */
  id: number;
};
export type PutApiV1OrgsByIdApiResponse = /** status 200 undefined */ {
  org?: Org;
};
export type PutApiV1OrgsByIdApiArg = {
  /** The unique ID of the org */
  id: number;
  putOrgReq: PutOrgReq;
};
export type DeleteApiV1OrgsByIdApiResponse = unknown;
export type DeleteApiV1OrgsByIdApiArg = {
  /** The unique ID of the org */
  id: number;
};
export type GetApiV1OrgsByIdUsersApiResponse =
  /** status 200 A list of users */ {
    users?: User[];
    /** Total number of users matching the query */
    count?: number;
  };
export type GetApiV1OrgsByIdUsersApiArg = {
  /** The unique ID of the org */
  id: number;
  /** Number of users to return per page */
  pageSize?: number;
  /** Page number to return */
  pageNumber?: number;
  /** Search by name or email */
  search?: string;
};
export type GetApiV1AppsApiResponse = /** status 200 A list of apps */ {
  apps?: App[];
};
export type GetApiV1AppsApiArg = void;
export type PostApiV1AppsApiResponse = /** status 201 undefined */ {
  app?: AppDetail;
};
export type PostApiV1AppsApiArg = {
  postAppReq: PostAppReq;
};
export type GetApiV1AppsByIdApiResponse =
  /** status 200 A single app object */ {
    app?: AppDetail;
  };
export type GetApiV1AppsByIdApiArg = {
  /** The unique ID of the app */
  id: number;
};
export type PutApiV1AppsByIdApiResponse = /** status 200 undefined */ {
  app?: AppDetail;
};
export type PutApiV1AppsByIdApiArg = {
  /** The unique ID of the app */
  id: number;
  putAppReq: PutAppReq;
};
export type DeleteApiV1AppsByIdApiResponse = unknown;
export type DeleteApiV1AppsByIdApiArg = {
  /** The unique ID of the app */
  id: number;
};
export type GetApiV1UsersApiResponse = /** status 200 A list of users */ {
  users?: User[];
  /** Total number of users matching the query */
  count?: number;
};
export type GetApiV1UsersApiArg = {
  /** Number of users to return per page */
  pageSize?: number;
  /** Page number to return */
  pageNumber?: number;
  /** Search by name or email */
  search?: string;
};
export type GetApiV1UsersByAuthIdApiResponse =
  /** status 200 A single user object */ {
    user?: UserDetail;
  };
export type GetApiV1UsersByAuthIdApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PutApiV1UsersByAuthIdApiResponse = /** status 200 undefined */ {
  user?: UserDetail;
};
export type PutApiV1UsersByAuthIdApiArg = {
  /** The authId of the user */
  authId: string;
  putUserReq: PutUserReq;
};
export type DeleteApiV1UsersByAuthIdApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdApiArg = {
  /** The authId of the user */
  authId: string;
};
export type GetApiV1UsersByAuthIdLockedIpsApiResponse =
  /** status 200 A list of IPs */ {
    /** The list of locked IP addresses for the user */
    lockedIPs?: string[];
  };
export type GetApiV1UsersByAuthIdLockedIpsApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdLockedIpsApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdLockedIpsApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PostApiV1UsersByAuthIdVerifyEmailApiResponse =
  /** status 200 undefined */ {
    success?: boolean;
  };
export type PostApiV1UsersByAuthIdVerifyEmailApiArg = {
  /** The authId of the user who will receive the verification email */
  authId: string;
};
export type GetApiV1UsersByAuthIdConsentedAppsApiResponse =
  /** status 200 A list of consented apps */ {
    consentedApps?: UserConsentedApp[];
  };
export type GetApiV1UsersByAuthIdConsentedAppsApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdConsentedAppsAndAppIdApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdConsentedAppsAndAppIdApiArg = {
  /** The authId of the user */
  authId: string;
  /** The id of the app */
  appId: number;
};
export type GetApiV1UsersByAuthIdPasskeysApiResponse =
  /** status 200 A list of passkeys */ {
    passkeys?: UserPasskey[];
  };
export type GetApiV1UsersByAuthIdPasskeysApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdApiResponse =
  /** status 200 undefined */ {
    success?: boolean;
  };
export type DeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdApiArg = {
  /** The authId of the user */
  authId: string;
  /** The id of the passkey */
  passkeyId: number;
};
export type PostApiV1UsersByAuthIdEmailMfaApiResponse = unknown;
export type PostApiV1UsersByAuthIdEmailMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdEmailMfaApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdEmailMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PostApiV1UsersByAuthIdOtpMfaApiResponse = unknown;
export type PostApiV1UsersByAuthIdOtpMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdOtpMfaApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdOtpMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PostApiV1UsersByAuthIdSmsMfaApiResponse = unknown;
export type PostApiV1UsersByAuthIdSmsMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type DeleteApiV1UsersByAuthIdSmsMfaApiResponse = unknown;
export type DeleteApiV1UsersByAuthIdSmsMfaApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PostApiV1UsersByAuthIdAccountLinkingAndLinkingAuthIdApiResponse =
  /** status 200 undefined */ {
    success?: boolean;
  };
export type PostApiV1UsersByAuthIdAccountLinkingAndLinkingAuthIdApiArg = {
  /** The authId of the user */
  authId: string;
  /** The authId of the account to link with */
  linkingAuthId: string;
};
export type DeleteApiV1UsersByAuthIdAccountLinkingApiResponse =
  /** status 200 undefined */ {
    success?: boolean;
  };
export type DeleteApiV1UsersByAuthIdAccountLinkingApiArg = {
  /** The authId of the user */
  authId: string;
};
export type PostApiV1UsersByAuthIdImpersonationAndAppIdApiResponse =
  /** status 200 A refresh token for impersonation */ {
    /** The refresh token for impersonation */
    refresh_token?: string;
    /** The expiration time of the refresh token */
    refresh_token_expires_on?: number;
    /** The remaining time of the refresh token in seconds */
    refresh_token_expires_in?: number;
  };
export type PostApiV1UsersByAuthIdImpersonationAndAppIdApiArg = {
  /** The authId of the user */
  authId: string;
  /** The id of the app */
  appId: number;
  body: {
    /** The access token of the user impersonating, this user must be a super_admin */
    impersonatorToken?: string;
  };
};
export type GetApiV1UserAttributesApiResponse =
  /** status 200 A list of user attributes */ {
    userAttributes?: UserAttribute[];
  };
export type GetApiV1UserAttributesApiArg = void;
export type PostApiV1UserAttributesApiResponse =
  /** status 200 A user attribute */ {
    userAttribute?: UserAttribute;
  };
export type PostApiV1UserAttributesApiArg = {
  postUserAttributeReq: PostUserAttributeReq;
};
export type GetApiV1UserAttributesByIdApiResponse =
  /** status 200 A user attribute */ {
    userAttribute?: UserAttribute;
  };
export type GetApiV1UserAttributesByIdApiArg = {
  /** The unique ID of the user attribute */
  id: number;
};
export type PutApiV1UserAttributesByIdApiResponse =
  /** status 200 A user attribute */ {
    userAttribute?: UserAttribute;
  };
export type PutApiV1UserAttributesByIdApiArg = {
  /** The unique ID of the user attribute */
  id: number;
  putUserAttributeReq: PutUserAttributeReq;
};
export type DeleteApiV1UserAttributesByIdApiResponse = unknown;
export type DeleteApiV1UserAttributesByIdApiArg = {
  /** The unique ID of the user attribute */
  id: number;
};
export type GetApiV1LogsEmailApiResponse =
  /** status 200 A list of email logs */ {
    logs?: EmailLog[];
    /** Total number of logs matching the query */
    count?: number;
  };
export type GetApiV1LogsEmailApiArg = {
  /** Number of logs to return per page */
  pageSize?: number;
  /** Page number to return */
  pageNumber?: number;
};
export type DeleteApiV1LogsEmailApiResponse = unknown;
export type DeleteApiV1LogsEmailApiArg = {
  /** Delete all logs that are older than this date in utc format. */
  before?: string;
};
export type GetApiV1LogsEmailByIdApiResponse =
  /** status 200 A single email log object */ {
    log?: EmailLog;
  };
export type GetApiV1LogsEmailByIdApiArg = {
  /** The unique ID of the email log */
  id: number;
};
export type GetApiV1LogsSmsApiResponse = /** status 200 A list of SMS logs */ {
  logs?: SmsLog[];
  /** Total number of logs matching the query */
  count?: number;
};
export type GetApiV1LogsSmsApiArg = {
  /** Number of logs to return per page */
  pageSize?: number;
  /** Page number to return */
  pageNumber?: number;
};
export type DeleteApiV1LogsSmsApiResponse = unknown;
export type DeleteApiV1LogsSmsApiArg = {
  /** Delete all logs that are older than this date in utc format. */
  before?: string;
};
export type GetApiV1LogsSmsByIdApiResponse =
  /** status 200 A single SMS log object */ {
    log?: SmsLog;
  };
export type GetApiV1LogsSmsByIdApiArg = {
  /** The unique ID of the SMS log */
  id: number;
};
export type GetApiV1LogsSignInApiResponse =
  /** status 200 A list of Sign-in logs */ {
    logs?: SignInLog[];
    /** Total number of logs matching the query */
    count?: number;
  };
export type GetApiV1LogsSignInApiArg = {
  /** Number of logs to return per page */
  pageSize?: number;
  /** Page number to return */
  pageNumber?: number;
};
export type DeleteApiV1LogsSignInApiResponse = unknown;
export type DeleteApiV1LogsSignInApiArg = {
  /** Delete all logs that are older than this date in utc format. */
  before?: string;
};
export type GetApiV1LogsSignInByIdApiResponse =
  /** status 200 A single sign-in log object */ {
    log?: SignInLog;
  };
export type GetApiV1LogsSignInByIdApiArg = {
  /** The unique ID of the sign-in log */
  id: number;
};
export type Scope = {
  id: number;
  name: string;
  note: string;
  type: 'spa' | 's2s';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type ScopeDetail = Scope & {
  locales: {
    id: number;
    scopeId: number;
    locale: string;
    value: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
};
export type PostScopeReq = {
  name: string;
  type: 'spa' | 's2s';
  note?: string;
  locales?: {
    locale: string;
    value: string;
  }[];
};
export type PutScopeReq = {
  name?: string;
  note?: string;
  locales?: {
    locale: string;
    value: string;
  }[];
};
export type Role = {
  id: number;
  name: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type PostRoleReq = {
  name: string;
  note?: string;
};
export type PutRoleReq = {
  name?: string;
  note?: string;
};
export type Org = {
  id: number;
  name: string;
  slug: string;
  allowPublicRegistration: boolean;
  companyLogoUrl: string;
  companyEmailLogoUrl: string;
  fontFamily: string;
  fontUrl: string;
  layoutColor: string;
  labelColor: string;
  primaryButtonColor: string;
  primaryButtonLabelColor: string;
  primaryButtonBorderColor: string;
  secondaryButtonColor: string;
  secondaryButtonLabelColor: string;
  secondaryButtonBorderColor: string;
  criticalIndicatorColor: string;
  emailSenderName: string;
  termsLink: string;
  privacyPolicyLink: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type PostOrgReq = {
  name: string;
  slug: string;
  allowPublicRegistration: boolean;
};
export type PutOrgReq = {
  name?: string;
  slug?: string;
  allowPublicRegistration?: boolean;
  companyLogoUrl?: string;
  companyEmailLogoUrl?: string;
  fontFamily?: string;
  fontUrl?: string;
  layoutColor?: string;
  labelColor?: string;
  primaryButtonColor?: string;
  primaryButtonLabelColor?: string;
  primaryButtonBorderColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonLabelColor?: string;
  secondaryButtonBorderColor?: string;
  criticalIndicatorColor?: string;
  emailSenderName?: string;
  termsLink?: string;
  privacyPolicyLink?: string;
};
export type User = {
  id: number;
  authId: string;
  email: string | null;
  linkedAuthId?: string | null;
  socialAccountId: string | null;
  socialAccountType: string | null;
  firstName: string | null;
  lastName: string | null;
  locale: string;
  loginCount: number;
  mfaTypes: string[];
  emailVerified: boolean;
  otpVerified: boolean;
  smsPhoneNumberVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type App = {
  id: number;
  clientId: string;
  name: string;
  isActive: boolean;
  type: 'spa' | 's2s';
  secret: string;
  redirectUris: string[];
  useSystemMfaConfig: boolean;
  requireEmailMfa: boolean;
  requireOtpMfa: boolean;
  requireSmsMfa: boolean;
  allowEmailMfaAsBackup: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type AppDetail = App & {
  scopes: string[];
};
export type PostAppReq = {
  name: string;
  type: 'spa' | 's2s';
  scopes: string[];
  redirectUris: string[];
};
export type PutAppReq = {
  redirectUris?: string[];
  name?: string;
  isActive?: boolean;
  scopes?: string[];
  useSystemMfaConfig?: boolean;
  requireEmailMfa?: boolean;
  requireOtpMfa?: boolean;
  requireSmsMfa?: boolean;
  allowEmailMfaAsBackup?: boolean;
};
export type UserDetail = User & {
  roles: string[] | null;
  org?: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
  attributes?: {
    [key: string]: string;
  } | null;
};
export type PutUserReq = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  locale?: string;
  orgSlug?: string;
  roles?: string[];
  attributes?: {
    [key: string]: string | null;
  };
};
export type UserConsentedApp = {
  appId: number;
  appName: string;
};
export type UserPasskey = {
  id: number;
  credentialId: string;
  counter: number;
};
export type UserAttribute = {
  id: number;
  name: string;
  includeInSignUpForm: boolean;
  requiredInSignUpForm: boolean;
  includeInIdTokenBody: boolean;
  includeInUserInfo: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type PostUserAttributeReq = {
  name: string;
  includeInSignUpForm: boolean;
  requiredInSignUpForm: boolean;
  includeInIdTokenBody: boolean;
  includeInUserInfo: boolean;
};
export type PutUserAttributeReq = {
  name?: string;
  includeInSignUpForm?: boolean;
  requiredInSignUpForm?: boolean;
  includeInIdTokenBody?: boolean;
  includeInUserInfo?: boolean;
};
export type EmailLog = {
  id: number;
  success: boolean;
  receiver: string;
  response: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type SmsLog = {
  id: number;
  success?: boolean;
  receiver: string;
  response: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type SignInLog = {
  id: number;
  userId: number;
  ip: string | null;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export const {
  useGetApiV1ScopesQuery,
  useLazyGetApiV1ScopesQuery,
  usePostApiV1ScopesMutation,
  useGetApiV1ScopesByIdQuery,
  useLazyGetApiV1ScopesByIdQuery,
  usePutApiV1ScopesByIdMutation,
  useDeleteApiV1ScopesByIdMutation,
  useGetApiV1RolesQuery,
  useLazyGetApiV1RolesQuery,
  usePostApiV1RolesMutation,
  useGetApiV1RolesByIdQuery,
  useLazyGetApiV1RolesByIdQuery,
  usePutApiV1RolesByIdMutation,
  useDeleteApiV1RolesByIdMutation,
  useGetApiV1OrgsQuery,
  useLazyGetApiV1OrgsQuery,
  usePostApiV1OrgsMutation,
  useGetApiV1OrgsByIdQuery,
  useLazyGetApiV1OrgsByIdQuery,
  usePutApiV1OrgsByIdMutation,
  useDeleteApiV1OrgsByIdMutation,
  useGetApiV1OrgsByIdUsersQuery,
  useLazyGetApiV1OrgsByIdUsersQuery,
  useGetApiV1AppsQuery,
  useLazyGetApiV1AppsQuery,
  usePostApiV1AppsMutation,
  useGetApiV1AppsByIdQuery,
  useLazyGetApiV1AppsByIdQuery,
  usePutApiV1AppsByIdMutation,
  useDeleteApiV1AppsByIdMutation,
  useGetApiV1UsersQuery,
  useLazyGetApiV1UsersQuery,
  useGetApiV1UsersByAuthIdQuery,
  useLazyGetApiV1UsersByAuthIdQuery,
  usePutApiV1UsersByAuthIdMutation,
  useDeleteApiV1UsersByAuthIdMutation,
  useGetApiV1UsersByAuthIdLockedIpsQuery,
  useLazyGetApiV1UsersByAuthIdLockedIpsQuery,
  useDeleteApiV1UsersByAuthIdLockedIpsMutation,
  usePostApiV1UsersByAuthIdVerifyEmailMutation,
  useGetApiV1UsersByAuthIdConsentedAppsQuery,
  useLazyGetApiV1UsersByAuthIdConsentedAppsQuery,
  useDeleteApiV1UsersByAuthIdConsentedAppsAndAppIdMutation,
  useGetApiV1UsersByAuthIdPasskeysQuery,
  useLazyGetApiV1UsersByAuthIdPasskeysQuery,
  useDeleteApiV1UsersByAuthIdPasskeysAndPasskeyIdMutation,
  usePostApiV1UsersByAuthIdEmailMfaMutation,
  useDeleteApiV1UsersByAuthIdEmailMfaMutation,
  usePostApiV1UsersByAuthIdOtpMfaMutation,
  useDeleteApiV1UsersByAuthIdOtpMfaMutation,
  usePostApiV1UsersByAuthIdSmsMfaMutation,
  useDeleteApiV1UsersByAuthIdSmsMfaMutation,
  usePostApiV1UsersByAuthIdAccountLinkingAndLinkingAuthIdMutation,
  useDeleteApiV1UsersByAuthIdAccountLinkingMutation,
  usePostApiV1UsersByAuthIdImpersonationAndAppIdMutation,
  useGetApiV1UserAttributesQuery,
  useLazyGetApiV1UserAttributesQuery,
  usePostApiV1UserAttributesMutation,
  useGetApiV1UserAttributesByIdQuery,
  useLazyGetApiV1UserAttributesByIdQuery,
  usePutApiV1UserAttributesByIdMutation,
  useDeleteApiV1UserAttributesByIdMutation,
  useGetApiV1LogsEmailQuery,
  useLazyGetApiV1LogsEmailQuery,
  useDeleteApiV1LogsEmailMutation,
  useGetApiV1LogsEmailByIdQuery,
  useLazyGetApiV1LogsEmailByIdQuery,
  useGetApiV1LogsSmsQuery,
  useLazyGetApiV1LogsSmsQuery,
  useDeleteApiV1LogsSmsMutation,
  useGetApiV1LogsSmsByIdQuery,
  useLazyGetApiV1LogsSmsByIdQuery,
  useGetApiV1LogsSignInQuery,
  useLazyGetApiV1LogsSignInQuery,
  useDeleteApiV1LogsSignInMutation,
  useGetApiV1LogsSignInByIdQuery,
  useLazyGetApiV1LogsSignInByIdQuery,
} = injectedRtkApi
