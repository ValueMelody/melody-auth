# 如何触发不同的 policy

Policies 允许你在不更改应用逻辑的情况下，将用户路由到不同的授权体验（例如，更新信息、更改密码）。

## 触发 policy 的方式

- 使用 authorize URL（query string）
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

- 使用 Frontend SDK
  ```ts
  const { loginRedirect } = useAuth()

  loginRedirect({
    policy: 'change_password',
  })
  ```

注意：所有暴露了 `loginRedirect` 方法的前端 SDK 都接受一个可选的 `policy` 参数。如果省略，则会应用默认的 policy。

## 支持的 policies

- `sign_in_or_sign_up`：默认 policy。
- `update_info`：允许用户更新其信息。
- `change_password`：允许用户更改密码（仅限基于密码的用户）。需要 `ENABLE_PASSWORD_RESET=true`。
- `change_email`：允许用户更改邮箱地址（仅限基于密码的用户）。需要 `ENABLE_EMAIL_VERIFICATION=true`。
- `reset_mfa`：允许用户重置已注册的 MFA（多因素认证）方法。
- `manage_passkey`：允许用户管理其 passkey。需要 `ALLOW_PASSKEY_ENROLLMENT=true`。
- `manage_recovery_code`：允许用户管理其恢复代码。
- `saml_sso_[idp_name]`：允许用户通过 SAML SSO 登录。
- `oidc_sso_[provider_name]`：允许用户通过 OIDC SSO 登录。

## 注意事项和最佳实践

- 如果某个 policy 依赖的功能被禁用，授权请求将无法继续。请先启用所需的功能开关。
- 你可以在适用的情况下，将 `policy` 与其他查询参数（如 `org` 和 `locale`）组合使用。
