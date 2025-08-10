# 应用横幅

应用横幅是可以显示在应用程序登录页面上的信息性消息。它们允许你在用户登录之前传达重要信息，例如维护通知、公告或警告。  
![Banners](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/app_banners_sign_in_screen.jpg)

## 概述

应用横幅功能使管理员能够创建和管理显示在应用程序登录页面上的横幅。横幅支持不同类型（info、warning、error、success），并且可以针对不同语言进行本地化。

## 服务器配置

要启用应用横幅，你需要在服务器的 `wrangler.toml` 文件中将 "ENABLE_APP_BANNER" 设置为 `true`：

```
ENABLE_APP_BANNER=true
```

当设置为 `false` 或未配置时，应用横幅功能将被禁用，对横幅相关端点的 API 请求会返回错误。

## 横幅管理

可以通过管理面板界面管理应用横幅：

1. 在管理面板中进入 **Apps** 部分
2. 访问 **Banners** 管理部分
3. 根据需要创建、编辑或删除横幅

## 服务间认证 API

你也可以使用 服务间认证 API 以编程方式管理应用横幅。

```
GET /api/v1/app-banners: 获取横幅列表
POST /api/v1/app-banners: 创建新横幅
GET /api/v1/app-banners/{id}: 根据 ID 获取横幅
PUT /api/v1/app-banners/{id}: 根据 ID 更新横幅
DELETE /api/v1/app-banners/{id}: 根据 ID 删除横幅
```

## 嵌入式认证 API

对于嵌入式认证流程，可以调用以下接口获取当前会话需要显示的横幅列表：

```
GET /embedded-auth/v1/{sessionId}/app-banners
```

## 横幅可见性

- 仅当 `isActive` 为 `true` 时显示横幅
- 横幅会根据请求应用的 ID 进行过滤
- 如果为一个应用配置了多个横幅，则会返回所有活动横幅

## 本地化

- `locales` 对象包含不同语言的翻译
- 使用用户的首选语言显示对应文本
- 如果找不到匹配的语言，则回退到 `text` 属性
