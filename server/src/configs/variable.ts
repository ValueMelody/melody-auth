import {
  Role, Scope,
} from '@melody-auth/shared'

export enum DefaultBranding {
  FontFamily = 'Inter',
  FontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..600&display=swap',
  LayoutColor = 'lightgray',
  LabelColor = 'black',
  PrimaryButtonColor = 'white',
  PrimaryButtonLabelColor = 'black',
  PrimaryButtonBorderColor = 'lightgray',
  SecondaryButtonColor = 'white',
  SecondaryButtonLabelColor = 'black',
  SecondaryButtonBorderColor = 'white',
  CriticalIndicatorColor = '#e00',
}

export enum DefaultEnvironment {
  Development = 'dev',
  Production = 'prod',
}

interface OIDCProviderConfig {
  clientId: string; // The client id for your OIDC Auth provider
  issuer: string; // The expected issuer for your OIDC Auth provider
  authorizeEndpoint: string; // The authorize endpoint for your OIDC Auth provider
  tokenEndpoint: string; // The token endpoint for your OIDC Auth provider
  jwksEndpoint: string; // The jwks endpoint for your OIDC Auth provider
  enableSignInButton: boolean; // Whether to enable displaying the sign in button for this provider
  enableSignInRedirect: boolean; // Whether to enable triggering the sign in redirect by policy for this provider
}

/**
 * OIDC provider configurations
 * Set the configurations for each of your OIDC_AUTH_PROVIDERS in this object.
 */
export const OIDCProviderConfigs: Record<string, OIDCProviderConfig> = Object.freeze({
  Auth0: {
    clientId: 'example',
    issuer: 'https://dummy.us.auth0.com/',
    authorizeEndpoint: 'https://dummy.us.auth0.com/authorize',
    tokenEndpoint: 'https://dummy.us.auth0.com/oauth/token',
    jwksEndpoint: 'https://dummy.us.auth0.com/.well-known/jwks.json',
    enableSignInButton: true,
    enableSignInRedirect: true,
  },
})

export const SocialSignInConfig = Object.freeze({
  DiscordScope: 'identity+email',
  FacebookScope: 'public_profile',
  AppleScope: 'name email',
  // Keep true only when external providers supply MFA assurance equivalent to local MFA.
  // Set to false to require configured local MFA after social, OIDC, and SAML sign-in.
  ExternalSignInCanBypassLocalMfa: true,
})

export const SmsMfaConfig = Object.freeze({
  // Prefix of the phone number to be used for SMS MFA.
  // For example, if you are based in the United States, you should set this to "+1".
  CountryCode: '+1',
  // For validation error message, update server/src/pages/tools/locale.ts validateError.wrongPhoneFormat accordingly
  validationRegex: /^\+[1-9]\d{1,14}$/,
})

export const RequestIPConfig = Object.freeze({
  // Node deployments only. Add headers only when a trusted proxy removes them
  // from incoming requests and then sets them itself; otherwise leave this empty.
  trustedHeaders: [] as string[],
})

export const systemConfig = Object.freeze({
  name: 'Melody Auth',
  enableOrgGroup: true,
  emailVerificationCodeExpiresIn: 7200, // must be x * 3600 (in seconds)
  passwordResetCodeExpiresIn: 7200, // must be x * 3600 (in seconds)
  changeEmailVerificationCodeExpiresIn: 7200, // must be x * 3600 (in seconds)
  emailMfaCodeExpiresIn: 300, // must be x * 60 (in seconds)
  smsMfaCodeExpiresIn: 300, // must be x * 60 (in seconds)
  invitationExpiresIn: 7, // in days
  sendEmailToRealReceiverOnDev: false,
  sendSmsToRealReceiverOnDev: false,
  enablePlainPkceMethod: false,
})

export const S2sConfig = Object.freeze({
  impersonationRoles: [Role.SuperAdmin],
  // Built-in roles are immutable and can only be assigned by a caller that holds the root scope.
  builtInRoles: [Role.SuperAdmin],
  // They can only be assigned to an app by a caller that holds the root scope.
  privilegedScopes: [Scope.Root],
  builtInScopes: Object.freeze<string[]>([
    Scope.OpenId,
    Scope.Profile,
    Scope.OfflineAccess,
    Scope.Root,
    Scope.ReadUser,
    Scope.WriteUser,
    Scope.ReadApp,
    Scope.WriteApp,
    Scope.ReadRole,
    Scope.WriteRole,
    Scope.ReadScope,
    Scope.WriteScope,
    Scope.ReadOrg,
    Scope.WriteOrg,
  ]),
})
