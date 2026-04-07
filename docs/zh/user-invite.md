# 用户邀请（User Invite）

允许管理员通过邮件邀请用户加入平台，无需用户自行注册。

## 工作原理
- 管理员向用户的邮箱地址发送邀请，可选择分配角色、组织和语言。
- 被邀请的用户会收到一封包含邀请链接的邮件，链接有效期为 7 天。
- 用户点击链接，设置密码后账户即被激活。
- 若邀请已过期或需要重新发送，管理员可以重新邀请用户以生成新链接。
- 若邀请在被接受前需要取消，管理员可以撤销邀请。

注意：
- 需要配置邮件提供商才能发送邀请邮件。
- 被邀请的用户初始状态为未激活，仅在接受邀请后才会被激活。
- 不能向开启了 `onlyUseForBrandingOverride` 的组织发送邀请。

## 邀请用户

### 在 Admin Panel 中操作
- 进入用户列表页面，点击 **Invite User**。
- 填写邮箱（必填）以及可选字段：名、姓、语言、组织、角色和跳转链接。
- 提交表单后，被邀请用户将收到邀请邮件。

### 直接调用 S2S API
端点：`POST /api/v1/users/invitations`
- Authorization：使用带有 `write_user` scope 的 S2S token
- Body：
  ```json
  {
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "locale": "en",
    "orgSlug": "my-org",
    "roles": ["role-name"],
    "signinUrl": "https://your-app.example.com/callback"
  }
  ```
  仅 `email` 为必填项，其他字段均为可选。
- Response：`200` — 返回创建的用户记录，其中 `isActive: false`，`isInviting: true`。

## 重新邀请用户

用于重新发送邀请邮件，生成新的令牌并将有效期重置为 7 天。原邀请链接将失效。

### 在 Admin Panel 中操作
- 打开待激活用户的详情页。
- 点击 **Resend Invite**。
- 可选择更新语言或跳转链接，然后确认。

### 直接调用 S2S API
端点：`POST /api/v1/users/invitations/{authId}`
- Authorization：使用带有 `write_user` scope 的 S2S token
- Body：
  ```json
  {
    "locale": "en",
    "signinUrl": "https://your-app.example.com/callback"
  }
  ```
  两个字段均为可选。
- Response：`200` — `{ "success": true }`
- 前提条件：用户必须处于未激活状态，且存在待接受的邀请。

## 撤销邀请

取消待接受的邀请，用户将无法再通过邀请链接激活账户。

### 在 Admin Panel 中操作
- 打开待激活用户的详情页。
- 点击 **Revoke Invite** 并确认。

### 直接调用 S2S API
端点：`DELETE /api/v1/users/invitations/{authId}`
- Authorization：使用带有 `write_user` scope 的 S2S token
- Response：`204` — 无内容。
- 前提条件：用户必须处于未激活状态，且存在待接受的邀请。

## 接受邀请（用户流程）

用户点击邮件中的邀请链接后，会跳转到认证服务器托管的邀请接受页面。

1. 服务器验证邀请令牌——令牌必须存在、属于未激活用户，且未过期。
2. 用户设置密码并提交表单。
3. 成功后，账户被激活，邮箱标记为已验证，邀请令牌被清除。
4. 用户随后可正常登录。

若链接已过期，页面会显示过期提示，用户需联系管理员重新发送邀请。
