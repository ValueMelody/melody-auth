# How to trigger a different policy

Policies let you route users to different authorization experiences (e.g., update info, change password) without changing your application logic.

## Ways to trigger a policy

- Using the authorize URL (query string)
  ```ts
  const url = serverUri +
    '/oauth2/v1/authorize?' +
    'response_type=code' +
    '&state=' + state +
    '&client_id=' + clientId +
    '&redirect_uri=' + redirectUri +
    '&code_challenge=' + codeChallenge +
    '&code_challenge_method=S256' +
    '&policy=' + policy +
    '&scope=' + scope +
    '&locale=' + locale
  window.location.href = url
  ```

- Using the Frontend SDK
  ```ts
  const { loginRedirect } = useAuth()

  loginRedirect({
    policy: 'change_password',
  })
  ```

Note: All front-end SDKs that expose `loginRedirect` accept an optional `policy` parameter. If omitted, the default policy applies.

## Supported policies

- `sign_in_or_sign_up`: Default policy.
- `update_info`: Allows users to update their information.
- `change_password`: Allows users to change their password (for password-based users only). Requires `ENABLE_PASSWORD_RESET=true`.
- `change_email`: Allows users to change their email address (for password-based users only). Requires `ENABLE_EMAIL_VERIFICATION=true`.
- `reset_mfa`: Allows users to reset their enrolled MFA (Multi-Factor Authentication) method.
- `change_org`: Allows users to change their organization. Requires `ENABLE_ORG=true`, and remove `change_org` from `BLOCKED_POLICIES`.
- `manage_passkey`: Allows users to manage their passkey. Requires `ALLOW_PASSKEY_ENROLLMENT=true`.
- `manage_recovery_code`: Allows users to manage their recovery code.
- `saml_sso_[idp_name]`: Allows users to sign in via SAML SSO.
- `oidc_sso_[provider_name]`: Allows users to sign in via OIDC SSO.

## Notes and best practices

- If a policy requires a disabled feature, the authorization request will not proceed. Enable the required feature flags first.
- You can combine `policy` with other query params like `org` and `locale` when applicable.
