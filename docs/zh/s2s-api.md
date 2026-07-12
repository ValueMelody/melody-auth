# 服务器间认证 API

Melody Auth **服务器间认证 API** 为服务器应用提供管理资源的能力。

## 快速开始
首先，通过在 `Basic Auth` 头中使用 `clientId` 和 `clientSecret`，向 `/token` 端点获取 `access_token`。  
随后，在后续请求的 `Authorization` 头中，以 `Bearer` 令牌的形式携带该 `access_token`。

- **HTTP 方法**：`POST`  
- **Content-Type**：`application/x-www-form-urlencoded`  
- **URL**：`[melody_auth_server_url]/oauth2/v1/token`

### Token 请求参数

| 参数 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| ``grant_type`` | 'client_credentials' | 是 | 指定使用 `client_credentials` 模式交换令牌 |
| ``scope`` | string | 是 | 需要申请的权限作用域（如：`read_user write_user`） |

### Token 请求示例

```js
const credentials = `${clientId}:${clientSecret}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');

const data = {
  grant_type: 'client_credentials',
  scope: 'read_user write_user',
}
const urlEncodedData = new URLSearchParams(data).toString()

fetch('/oauth2/v1/token', {
  method: 'POST',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded',
    'Authorization': `basic ${encodedCredentials}`
  },
  body: urlEncodedData,
})
```

### Token 响应示例

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzQ1NiIsInNjb3BlIjoicmVhZF91c2VyIHdyaXRlX3VzZXIiLCJpYXQiOjE3MjE0MjE4MTcsImV4cCI6MTcyMTQyNTQxN30.blhriLgm67tkL89tVLdeNN5nl4EUssy6FIfp4kTOlqM",
  "expires_in": 3600,
  "expires_on": 1721425417,
  "token_type": "Bearer",
  "scope": "read_user write_user"
}
```

## 系统信息

`/info` 端点会返回当前服务器配置值，包括功能开关和面向客户端的配置。由于这些信息可能暴露安全策略和部署细节，该端点需要有效的服务器间访问令牌，但不要求任何特定作用域。

- **HTTP 方法**：`GET`
- **URL**：`[melody_auth_server_url]/info`
- **必需作用域**：无
- **Authorization**：`Bearer [access_token]`

## 作用域

服务器间令牌被授予的作用域决定了它可以调用哪些端点。每个端点所需的作用域可在 [REST API Swagger](https://auth-server.valuemelody.com/api/v1/swagger) 中查看。`root` 作用域可访问所有端点。

### 分配 root 作用域

在创建应用（`POST /api/v1/apps`）或更新应用（`PUT /api/v1/apps/{id}`）时，只有自身令牌持有 `root` 作用域的调用方才能分配 `root` 作用域。不具备 `root` 的 `write_app` 令牌仍可管理其他作用域，但任何在应用作用域列表中包含 `root` 的请求都会被拒绝，返回 `400` 以及消息 `Only an app with the root scope can assign the root scope to an app`。这可以防止 `write_app` 令牌将自身权限提升为 `root`。

### 内置作用域

`systemConfig.builtInScopeNames` 中的内置作用域名称为保留且不可更改：`openid`、`profile`、`offline_access`、`root`、`read_user`、`write_user`、`read_app`、`write_app`、`read_role`、`write_role`、`read_scope`、`write_scope`、`read_org` 和 `write_org`。`POST /api/v1/scopes` 不能创建这些作用域，`DELETE /api/v1/scopes/{id}` 也不能删除它们。`PUT /api/v1/scopes/{id}` 可以更新内置作用域的说明或本地化标签，但不能重命名内置作用域，也不能将自定义作用域重命名为内置作用域名称。受限请求会返回 `400`，并附带消息 `Built-in scopes cannot be created, deleted, or renamed`。

## 角色

角色被分配给用户，可在更新用户（`PUT /api/v1/users/{authId}`）或邀请用户（`POST /api/v1/users/invitations`）时进行管理。两者都需要 `write_user` 作用域。

### 分配特权角色

特权角色会授予跨应用的提升信任——例如，`super_admin` 是用于控制用户模拟（impersonation）的角色。为防止 `write_user` 令牌提升权限（无论是自身还是其他用户的权限），只有自身令牌持有 `root` 作用域的调用方才能分配特权角色。不具备 `root` 的 `write_user` 令牌仍可分配非特权角色，但任何包含特权角色（例如 `super_admin`）的请求都会被拒绝，返回 `400` 以及消息 `Only an app with the root scope can assign a privileged role`。

## 详细文档
更多信息请参阅 [REST API Swagger](https://auth-server.valuemelody.com/api/v1/swagger)。
