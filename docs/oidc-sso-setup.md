# OIDC Auth Provider Sign-In

Melody Auth supports signing in users via external OpenID Connect (OIDC) identity providers that implement the OAuth 2.0 Authorization Code Flow with PKCE and return ID tokens signed with RS256 and published via a JWKS endpoint.

This guide explains how to enable OIDC providers, show the sign-in buttons, and trigger redirects from your frontend.

## Enable one or more OIDC providers

1) In `server/wrangler.toml`, set the list of provider names that you want to enable:

```toml
[vars]
OIDC_AUTH_PROVIDERS = ["Auth0", "Azure"]
```

2) For each provider name in that list, define its config in `server/src/configs/variable.ts` under `OIDCProviderConfigs`:

```ts
export const OIDCProviderConfigs = Object.freeze({
  Auth0: {
    clientId: 'YOUR_AUTH0_CLIENT_ID',
    authorizeEndpoint: 'https://YOUR_DOMAIN.auth0.com/authorize',
    tokenEndpoint: 'https://YOUR_DOMAIN.auth0.com/oauth/token',
    jwksEndpoint: 'https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json',
    enableSignInButton: true,
    enableSignInRedirect: true,
  },
  Azure: {
    clientId: 'YOUR_AZURE_AD_APP_CLIENT_ID',
    authorizeEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token',
    jwksEndpoint: 'https://login.microsoftonline.com/YOUR_TENANT_ID/discovery/v2.0/keys',
    enableSignInButton: true,
    enableSignInRedirect: true,
  },
})
```

- `clientId`: Your OIDC app/client ID at the provider.
- `authorizeEndpoint`: Provider authorization endpoint.
- `tokenEndpoint`: Provider token endpoint. Must return an `id_token` when exchanging the authorization code.
- `jwksEndpoint`: Provider JWKS URL exposing the signing keys for ID tokens.
- `enableSignInButton`: If true, the sign-in button appears on Melody Auth pages for this provider.
- `enableSignInRedirect`: If true, you can trigger an OIDC redirect via a frontend policy (see below).

Note: Provider names are case-sensitive and should remain stable once configured, as they are used in routes and policies.

## Show OIDC sign-in buttons on the Sign-In page

When `OIDC_AUTH_PROVIDERS` includes a provider and its `enableSignInButton` is true, Melody Auth renders a button that redirects users to the provider’s authorize endpoint with a PKCE challenge. After a successful provider login, users are redirected back to:

```
[YOUR_AUTH_SERVER_URL]/identity/v1/authorize-oidc/[provider_name]
```

Make sure to add this callback/redirect URL to the allowed list in your provider console, for each provider. For example, for a provider named `Auth0` in local dev:

```
http://localhost:8787/identity/v1/authorize-oidc/Auth0
```

## Trigger OIDC redirects from your frontend via policy

If `enableSignInRedirect` is true for a provider, you can trigger an OIDC login redirect using your frontend SDK by passing a policy named `oidc_sso_[provider_name]`.

Example using the React SDK:

```ts
import { useAuth } from '@melody-auth/react'

export default function SignIn() {
  const { loginRedirect } = useAuth()

  const signInWithAuth0 = () => {
    loginRedirect({
      policy: 'oidc_sso_Auth0',
    })
  }

  return <button onClick={signInWithAuth0}>Sign in with Auth0</button>
}
```

For more details, see Q&A: “How to trigger OIDC SSO login redirect via policy in frontend”.

## Requirements and notes

- The provider must support Authorization Code with PKCE and return an `id_token` at the token endpoint.
- ID tokens must be signed with RS256 and verifiable via the configured `jwksEndpoint`.
- The server validates the PKCE `code_verifier` via KV to prevent tampering.
- If your provider’s token response differs from the standard (e.g., missing `id_token`), you may need to adapt the verification logic in `server/src/services/jwt.ts`.

