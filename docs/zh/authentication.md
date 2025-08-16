# 身份认证

Melody Auth 提供多种认证方式以满足不同的集成需求：

- **PKCE 流程**（Proof Key for Code Exchange）——前端应用的 **默认且推荐** OAuth 2.0 授权码流程
- **嵌入式认证流程** —— 通过直接 API 集成实现自定义认证体验

## 什么是 PKCE？

**PKCE**（Proof Key for Code Exchange）是 OAuth 2.0 授权码流程的安全扩展，旨在增强公共客户端（如单页应用 SPA 和移动应用）的安全性，这些客户端无法安全地存储 client secret。

PKCE 引入了一个动态生成的一次性密钥，称为 **code verifier**，用于保护授权码交换过程。这消除了公共客户端存储 client secret 的需求，同时保持了安全性。

## 安全优势

- **防止授权码拦截**：即使攻击者拦截了授权码，没有原始的 code verifier 也无法换取 token
- **消除 Client Secret 要求**：公共客户端无需存储敏感的 client secret 也能安全认证
- **缓解 CSRF 攻击**：将授权请求绑定到发起请求的特定客户端
- **防止代码注入攻击**：确保只有合法的客户端才能完成流程

## PKCE 下的认证操作工作方式

所有认证操作都遵循相同的 PKCE 流程模式，只是在认证步骤上有所不同：

### 标准 PKCE 流程步骤

1. **客户端生成 code verifier 和 challenge**
2. **用户被重定向到 Melody Auth 并携带 code challenge**
3. **用户执行认证操作**（根据操作类型不同而不同）
4. **授权码返回给客户端**
5. **客户端使用 code + verifier 换取 token**

## 通过 PKCE 的认证操作

Melody Auth 中的所有用户认证操作都可以通过 PKCE 流程完成，包括：

- **登录 (Sign-In)** —— 标准邮箱/密码认证
- **免密码登录 (Passwordless Sign-In)** —— 基于邮箱的免密码认证
- **注册 (Sign-Up)** —— 新用户注册与账户创建
- **登出 (Sign-Out)** —— 会话终止和 token 撤销
- **邮箱验证 (Email Verification)** —— 确认用户邮箱地址
- **密码重置 (Password Reset)** —— 安全的密码恢复流程
- **多因素认证 (MFA)** —— 邮箱 MFA、短信 MFA、OTP MFA、Passkey 认证，以及 MFA 管理
- **基于策略的认证 (Policy-Based Authentication)** —— 自定义策略、条件访问和增强认证

以上所有操作都使用相同的安全 PKCE 授权码流程，确保所有认证场景中的一致安全性。

## 认证方式对比

### PKCE 流程（推荐）
- **适用场景**：带有增强安全性的标准 OAuth 2.0 流程
- **最适合**：SPAs、移动应用和 Web 应用
- **安全性**：通过 code challenge/verifier 提供最高安全性
- **集成方式**：使用提供的 SDK 简单集成
- **用户体验**：重定向到托管的认证页面

### 嵌入式认证流程
- **适用场景**：应用内自定义认证 UI
- **最适合**：需要完全 UI 控制的应用
- **安全性**：通过直接 API 调用并正确处理 token
- **集成方式**：更复杂，需要自定义实现
- **用户体验**：无跳转，体验无缝

## SDK 集成

### PKCE 流程 SDK
- [React SDK 文档](zh/react-sdk.md) —— React hooks 和组件
- [Vue SDK 文档](zh/vue-sdk.md) —— Vue 3 composables 和插件
- [Angular SDK 文档](zh/angular-sdk.md) —— Angular services 和 guards
- [Web SDK 文档](zh/web-sdk.md) —— 原生 JavaScript 实现

### 嵌入式认证
- [嵌入式认证 API 文档](zh/embedded-auth-api.md) —— 直接 API 集成指南
