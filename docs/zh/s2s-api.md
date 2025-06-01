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

## 详细文档
更多信息请参阅 [REST API Swagger](https://auth-server.valuemelody.com/api/v1/swagger)。
