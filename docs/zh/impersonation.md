# 模拟登录（Impersonation）

允许具有特权的管理员在特定应用中以其他用户身份操作，用于支持与问题排查。

## 工作原理
- 具有允许角色的管理员为目标用户和 SPA 应用触发模拟登录。
- 服务器为目标用户签发一个短期有效的 refresh_token，并将其归属于模拟执行者。
- 前端使用该 refresh_token 获取目标用户会话的 access token。

注意：
- 仅支持 SPA 应用进行模拟登录。
- 如果应用要求用户授权，目标用户必须已授权，否则请求将被拒绝。

## 服务器端角色配置
文件：`server/src/configs/variable.ts`

- 将允许进行模拟的自定义角色添加到 `S2sConfig.impersonationRoles`。
- 默认值为 `[Role.SuperAdmin]`。

示例：

```ts
export const S2sConfig = Object.freeze({
  impersonationRoles: [Role.SuperAdmin, Role.SupportAdmin, Role.OrgAdmin],
})
```

修改后请重新部署或重启认证服务器。

## Admin Panel 访问控制配置
文件：`admin-panel/tools/access.ts`

要让自定义角色在 Admin Panel 中使用模拟功能：
- 将角色添加到 `AllowedRoles`。
- 在 `RoleAccesses[YourRole]` 中添加 `Access.Impersonation`。通常还需要添加基础读取权限（如 `ReadUser`、`ReadApp`）。

示例：

```ts
export const AllowedRoles = [
  typeTool.Role.SuperAdmin,
  typeTool.Role.SupportAdmin,
]

export const RoleAccesses = {
  [typeTool.Role.SuperAdmin]: [
    // ...已有权限
    Access.Impersonation,
  ],
  [typeTool.Role.SupportAdmin]: [
    Access.ReadUser,
    Access.ReadApp,
    Access.Impersonation,
  ],
}
```

确保管理员账户已被分配到正确的角色。

## 在 Admin Panel 中使用
- 打开用户详情页并选择“Impersonate”。
- 选择一个 SPA 应用。如果需要用户同意且缺少同意，将提示先获取同意。
- 成功后，你将收到一个 `refresh_token`，以及每个应用重定向 URI 的便捷链接：
  - `https://your-app.example.com/callback?refresh_token=...&refresh_token_expires_on=...&refresh_token_expires_in=...`

点击链接会打开已预加载模拟 refresh token 的应用。  
![Impersonation](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/impersonation.jpg)

## 前端对模拟的处理
所有前端 SDK 会在加载时自动解析 `refresh_token` 查询参数并存储。

## 直接调用 S2S API
如果需要自行生成模拟登录的 refresh token，可以直接调用 S2S API。

端点：`POST /api/v1/users/{authId}/impersonation/{appId}`
- Authorization：使用带有 `root` scope 的 S2S token
- Body：`{ "impersonatorToken": "<admin-spa-access-token>" }`
- Response：`{ refresh_token, refresh_token_expires_in, refresh_token_expires_on }`

步骤：
1) 使用 Client Credentials 并带 `root` scope 获取 S2S access token。
2) 使用该 token 调用上述端点。
3) 将返回的 `refresh_token` 通过重定向 URL 参数提供给目标应用。
4) 应用可使用 refresh token 获取目标用户会话的 access token。

## 安全注意事项
- 模拟登录应仅限可信的管理员角色使用。
- Token 默认短期有效，返回的 refresh token 有效期约 30 分钟。
- refresh token 内部带有 `impersonatedBy` 标签以便追踪。
