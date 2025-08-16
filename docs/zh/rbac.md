# 基于角色的访问控制 (RBAC)

Melody Auth 提供了内置的基于角色的访问控制 (RBAC) 系统，使你可以通过角色管理用户权限。用户可以被分配多个角色。

## RBAC 工作原理

RBAC 系统包含三个主要组件：

1. **角色 (Roles)** - 权限的命名集合（例如 `super_admin`、`support_admin`、`user`）
2. **用户 (Users)** - 可以被分配一个或多个角色的个人账户
3. **权限 (Permissions)** - 系统中被检查的具体访问权

## 内置角色

Melody Auth 提供以下预定义角色：

- **`super_admin`** - 拥有对所有系统功能的完全管理权限

你可以通过管理面板或 REST API 创建其他自定义角色。

## 角色管理

### 通过管理面板
1. 进入管理面板的 Roles 部分
2. 点击 “Create Role”
3. 输入角色名称和可选的描述
4. 保存角色

### 通过 S2S REST API
```
GET /api/v1/roles: 获取所有角色
POST /api/v1/roles: 创建新角色
GET /api/v1/roles/{roleId}: 获取指定角色
PUT /api/v1/roles/{roleId}: 更新角色
DELETE /api/v1/roles/{roleId}: 删除角色
GET /api/v1/roles/{roleId}/users: 获取角色中的所有用户
```

### Token 中的角色信息

当用户进行认证时，他们的角色会包含在：

1. **访问 Token (Access Tokens)** - 用于 API 授权
2. **ID Token** - 用于用户身份信息

然后你可以通过 access token 和 id token 中的 `roles` 字段来检查用户的权限。
