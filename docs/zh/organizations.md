# 组织

Melody Auth 中的组织功能提供：

- **用户管理**：将用户组织到不同的组织上下文中
- **注册控制**：组织可以启用或禁用公开用户注册
- **用户关联**：用户可以成为特定组织的成员
- **自定义Branding**：每个组织可以向用户展示不同的视觉标识  
[按组织自定义Branding](/zh/branding.html#per-organization-branding)
- **灵活配置**：可控制用户是否加入组织，或仅看到自定义Branding

## 启用组织功能

要在 Melody Auth 实例中启用组织功能，请在 `server/wrangler.toml` 的 `[vars]` 下设置 `ENABLE_ORG = true`。  

## Branding 继承规则

品牌系统遵循以下优先级：
1. **组织特定设置**（最高优先级）
2. **全局默认设置**（作为回退）

如果组织未指定某个 Branding 元素，则会继承全局默认值。

## 管理面板管理

### 创建组织

1. 打开管理面板，点击导航中的 “Orgs”
2. 点击 “Create an org” 按钮
3. 填写必填字段：
   - **Name**：显示名称（例如 “Acme Corporation”）
   - **Slug**：URL 唯一标识（例如 “acme-corp”）
   - **Allow Public Registration**：启用/禁用公开用户注册
   - **Only Use for Branding Override**：用户只会看到自定义 Branding，但不会成为成员
4. 点击 “Save” 创建组织

### 管理组织用户

- 在组织详情页面查看组织内的所有用户
- 如果用户记录中包含组织的 slug，则会显示在列表中
- 如果关闭了公开注册，可手动添加用户

### 组织设置

- 编辑组织名称、slug 和注册策略
- 配置自定义 Branding（Logo、颜色、字体）
- 更新法律链接（服务条款、隐私政策）

## API 集成

可通过 S2S API 以编程方式管理组织。

### 组织管理 API

```http
GET /api/v1/orgs: 获取所有组织
GET /api/v1/orgs/{id}: 获取指定组织详情
POST /api/v1/orgs: 创建新组织
PUT /api/v1/orgs/{id}: 更新组织设置
DELETE /api/v1/orgs/{id}: 删除组织
GET /api/v1/orgs/{id}/users: 获取组织内所有用户
```

## 注册流程场景

### 场景 1：开放组织且有用户成员
```
allowPublicRegistration: true
onlyUseForBrandingOverride: false
```
**结果**：用户可以注册并自动成为组织成员。他们会出现在组织的用户列表中，并在组织内进行管理。

### 场景 2：仅品牌显示（无用户成员）
```
allowPublicRegistration: true
onlyUseForBrandingOverride: true
```
**结果**：用户在注册时会看到组织 Branding，但不会成为组织成员。他们仍为全局用户。

### 场景 3：关闭组织
```
allowPublicRegistration: false
onlyUseForBrandingOverride: false/true（均可）
```
**结果**：不允许公开注册。组织管理员必须手动将用户添加到组织中。
