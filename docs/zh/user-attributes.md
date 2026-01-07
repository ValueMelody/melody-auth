# 用户属性

用户属性允许你捕获和管理用户的自定义数据字段，这些字段超出了标准字段（如email 等）。该功能使你能够在注册过程中收集额外信息，并将其包含在认证 token 或用户档案数据中。

## 概述

用户属性提供了一种灵活的方式来：
- 在用户注册时收集自定义信息
- 在 ID token 中包含自定义数据
- 通过 user info 接口返回自定义数据
- 支持属性标签的多语言
- 在注册时强制要求必填字段
- 在注册时强制要求唯一值
- 在注册时强制要求验证规则

## 配置

### 启用用户属性

要启用用户属性功能，请在 `server/wrangler.toml` 中设置以下配置：

```toml
[vars]
ENABLE_USER_ATTRIBUTE = true
```

此配置将：
- 在管理面板中启用用户属性管理
- 允许在注册表单中包含用户属性
- 启用 S2S API 接口以管理用户属性

## 管理用户属性

### 管理面板界面

启用后，你可以通过管理面板管理用户属性：

1. **进入用户属性**：访问管理面板中的用户属性部分
2. **创建新属性**：点击 “Create” 添加新的用户属性
3. **配置属性**：使用以下选项设置属性：
    - **Name**（必填）：属性的内部标识符
    - **Locales**：该属性的多语言显示标签
    - **Include in Sign Up Form**：该属性是否出现在用户注册表单中
    - **Required in Sign Up Form**：用户注册时是否必须填写该属性
    - **Include in ID Token Body**：该属性是否包含在 JWT ID token 的 payload 中
    - **Include in User Info**：该属性是否通过 user info 接口返回
    - **Unique**：该属性是否必须具有唯一的值
    - **Validation Regex**：用于验证该属性值的正则表达式
    - **Validation Locales**：该属性的多语言验证提示
  
![用户属性](https://raw.githubusercontent.com/ValueMelody/melody-auth/main/docs/images/user_attributes.jpg)

### S2S API 管理

可以通过 S2S API 接口以编程方式管理用户属性：

```http
GET /api/v1/user-attributes: 获取所有用户属性
GET /api/v1/user-attributes/{id}: 获取指定用户属性
POST /api/v1/user-attributes: 创建新的用户属性
PUT /api/v1/user-attributes/{id}: 更新已有用户属性
DELETE /api/v1/user-attributes/{id}: 删除用户属性
```

## 注册表单集成

当 `includeInSignUpForm` 启用时，用户属性会自动显示在注册表单中：

- 属性会以文本输入框的形式显示
- 标签会根据用户选择的语言进行本地化
- 必填属性会被标记并在提交时验证
- 属性与标准注册数据一并收集
- 唯一属性会被验证为唯一的值
- 验证属性会被验证为符合正则表达式

合适的标签会基于以下规则显示：
- 用户当前选择的语言
- 如果找不到匹配的语言，则回退为属性的 `name`

## ID Token 集成

当 `includeInIdTokenBody` 启用时：

- 用户属性值会包含在 JWT ID token 的 payload 中
- 属性会以 key-value 形式显示，key 为属性名称
- 仅添加标记为需要包含在 ID token 中的属性

## User Info 接口

当 `includeInUserInfo` 启用时：

- 用户属性会通过 `/userinfo` 接口返回
- 属性会出现在响应的 `attributes` 对象中
- 仅返回标记为需要包含在 user info 中的属性
