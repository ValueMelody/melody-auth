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
  },
})
