// Entity Types
export type Scope = {
  id: number
  name: string
  note: string
  type: 'spa' | 's2s'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type ScopeDetail = Scope & {
  locales: ScopeLocale[]
}

export type ScopeLocale = {
  id: number
  scopeId: number
  locale: string
  value: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostScopeReq = {
  name: string
  type: 'spa' | 's2s'
  note?: string
  locales?: { locale: string; value: string }[]
}

export type PutScopeReq = {
  name?: string
  note?: string
  locales?: { locale: string; value: string }[]
}

export type Role = {
  id: number
  name: string
  note: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostRoleReq = { name: string; note?: string }
export type PutRoleReq = { name?: string; note?: string }

export type User = {
  id: number
  authId: string
  email: string | null
  linkedAuthId?: string | null
  socialAccountId: string | null
  socialAccountType: string | null
  firstName: string | null
  lastName: string | null
  locale: string
  loginCount: number
  mfaTypes: string[]
  emailVerified: boolean
  otpVerified: boolean
  smsPhoneNumberVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type UserDetail = User & {
  roles: string[] | null
  org?: { id?: number; name?: string; slug?: string } | null
  orgGroups?: { id?: number; name?: string }[] | null
  attributes?: Record<string, string> | null
}

export type PutUserReq = {
  firstName?: string
  lastName?: string
  isActive?: boolean
  locale?: string
  orgSlug?: string
  roles?: string[]
  attributes?: Record<string, string | null>
}

export type UserConsentedApp = { appId: number; appName: string }
export type UserPasskey = { id: number; credentialId: string; counter: number }

export type Org = {
  id: number
  name: string
  slug: string
  allowPublicRegistration: boolean
  onlyUseForBrandingOverride: boolean
  companyLogoUrl: string
  companyEmailLogoUrl: string
  fontFamily: string
  fontUrl: string
  layoutColor: string
  labelColor: string
  primaryButtonColor: string
  primaryButtonLabelColor: string
  primaryButtonBorderColor: string
  secondaryButtonColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBorderColor: string
  criticalIndicatorColor: string
  emailSenderName: string
  termsLink: string
  privacyPolicyLink: string
  customDomain: string | null
  customDomainVerified: boolean
  customDomainVerificationToken: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostOrgReq = {
  name: string
  slug: string
  allowPublicRegistration: boolean
  onlyUseForBrandingOverride: boolean
}

export type PutOrgReq = {
  name?: string
  slug?: string
  allowPublicRegistration?: boolean
  onlyUseForBrandingOverride?: boolean
  companyLogoUrl?: string
  companyEmailLogoUrl?: string
  fontFamily?: string
  fontUrl?: string
  layoutColor?: string
  labelColor?: string
  primaryButtonColor?: string
  primaryButtonLabelColor?: string
  primaryButtonBorderColor?: string
  secondaryButtonColor?: string
  secondaryButtonLabelColor?: string
  secondaryButtonBorderColor?: string
  criticalIndicatorColor?: string
  emailSenderName?: string
  termsLink?: string
  privacyPolicyLink?: string
  customDomain?: string | null
}

export type OrgGroup = {
  id: number
  orgId: number
  name: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostOrgGroupReq = { name: string; orgId: number }
export type PutOrgGroupReq = { name: string }

export type App = {
  id: number
  clientId: string
  name: string
  isActive: boolean
  type: 'spa' | 's2s'
  redirectUris: string[]
  useSystemMfaConfig: boolean
  requireEmailMfa: boolean
  requireOtpMfa: boolean
  requireSmsMfa: boolean
  allowEmailMfaAsBackup: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type AppDetail = App & { scopes: string[] }
export type CreatedAppDetail = AppDetail & { secret: string }

export type PostAppReq = {
  name: string
  type: 'spa' | 's2s'
  scopes: string[]
  redirectUris: string[]
}

export type PutAppReq = {
  redirectUris?: string[]
  name?: string
  isActive?: boolean
  scopes?: string[]
  useSystemMfaConfig?: boolean
  requireEmailMfa?: boolean
  requireOtpMfa?: boolean
  requireSmsMfa?: boolean
  allowEmailMfaAsBackup?: boolean
}

export type Banner = {
  id: number
  type: string
  text: string
  isActive: boolean
  locales: { locale: string; value: string }[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type AppBanner = Banner & { appIds: number[] }

export type PostAppBannerReq = {
  type: string
  text?: string
  locales?: { locale: string; value: string }[]
}

export type PutAppBannerReq = {
  type?: string
  text?: string
  locales?: { locale: string; value: string }[]
  appIds?: number[]
  isActive?: boolean
}

export type UserAttribute = {
  id: number
  name: string
  locales?: { locale: string; value: string }[]
  includeInSignUpForm: boolean
  requiredInSignUpForm: boolean
  includeInIdTokenBody: boolean
  includeInUserInfo: boolean
  unique: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostUserAttributeReq = {
  name: string
  locales?: { locale: string; value: string }[]
  includeInSignUpForm: boolean
  requiredInSignUpForm: boolean
  includeInIdTokenBody: boolean
  includeInUserInfo: boolean
  unique: boolean
}

export type PutUserAttributeReq = {
  name?: string
  locales?: { locale: string; value: string }[]
  includeInSignUpForm?: boolean
  requiredInSignUpForm?: boolean
  includeInIdTokenBody?: boolean
  includeInUserInfo?: boolean
  unique?: boolean
}

export type EmailLog = {
  id: number
  success: boolean
  receiver: string
  response: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type SmsLog = {
  id: number
  success?: boolean
  receiver: string
  response: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type SignInLog = {
  id: number
  userId: number
  ip: string | null
  detail: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type SamlIdp = {
  id: number
  name: string
  isActive: boolean
  userIdAttribute: string
  emailAttribute: string | null
  firstNameAttribute: string | null
  lastNameAttribute: string | null
  metadata: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type PostSamlIdpReq = {
  name: string
  userIdAttribute: string
  emailAttribute: string | null
  firstNameAttribute: string | null
  lastNameAttribute: string | null
  metadata: string
}

export type PutSamlIdpReq = {
  isActive?: boolean
  userIdAttribute?: string
  emailAttribute?: string
  firstNameAttribute?: string
  lastNameAttribute?: string
  metadata?: string
}

// Query params types
export type PaginationParams = {
  pageSize?: number
  pageNumber?: number
  search?: string
}
