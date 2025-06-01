# 嵌入式认证 API

**Melody Auth 嵌入式认证 API** 使前端应用能够通过一组简单的 API，直接在应用内部实现定制化、无跳转的认证流程。

## 快速开始
在 `server/wrangler.toml` 中，将 `EMBEDDED_AUTH_ORIGINS` 设置为前端应用的源（origin）。  
例如：
```toml
EMBEDDED_AUTH_ORIGINS=['http://localhost:3000']
```
嵌入式认证同时会遵循你在服务器中的其他配置；如果有功能不需要或不受支持，请务必在服务器配置中将其禁用。

## 详细文档
更多信息请参阅 [嵌入式认证 API Swagger](https://auth-server.valuemelody.com/api/v1/embedded-swagger)。

## 示例
一个极简的 React 示例可在此获取  
[embedded-auth-example](https://github.com/ValueMelody/melody-auth-examples/tree/main/embedded-auth)
