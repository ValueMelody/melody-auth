import { Role } from '@melody-auth/shared'

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
})

// Prefix of the phone number to be used for SMS MFA.
// For example, if you are based in the United States, you should set this to "+1".
export const SmsMfaConfig = Object.freeze({ CountryCode: '+1' })

export const S2sConfig = Object.freeze({ impersonationRoles: [Role.SuperAdmin] })

export const systemConfig = Object.freeze({ name: 'Melody Auth' })
