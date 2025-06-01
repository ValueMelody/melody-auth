# Angular SDK

## 安装

```
npm install @melody-auth/angular --save
```

## AuthProvider

在应用启动时向引导模块提供认证相关配置。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| clientId | string | 前端连接的 app **clientId** | N/A | 是 |
| redirectUri | string | 认证成功后重定向的 URL | N/A | 是 |
| serverUri | string | 托管认证服务器的 URL | N/A | 是 |
| scopes | string[] | 需要申请的权限作用域 | N/A | 否 |
| storage | 'sessionStorage' \| 'localStorage' | 用于存储认证令牌的存储类型 | 'localStorage' | 否 |
| onLoginSuccess | (attr: { locale?: string; state?: string }) => void | 登录成功后的回调函数 | N/A | 否 |

```
import { bootstrapApplication } from '@angular/platform-browser'
import { provideMelodyAuth } from '@melody-auth/angular'
import { AppComponent } from './app/app.component'

bootstrapApplication(AppComponent, {
  providers: [
    provideMelodyAuth({
      clientId: import.meta.env.NG_APP_AUTH_SPA_CLIENT_ID,
      redirectUri: import.meta.env.NG_APP_CLIENT_URI,
      serverUri: import.meta.env.NG_APP_AUTH_SERVER_URI,
      storage: 'localStorage',
    }),
  ],
})
```

## isAuthenticated

用于判断当前用户是否已通过认证。

```
<div *ngIf="authService.isAuthenticating">Loading...</div>
<div *ngIf="!authService.isAuthenticating && authService.isAuthenticated">
  已登录
</div>
<div *ngIf="!authService.isAuthenticating && !authService.isAuthenticated">
  未登录
</div>
```

## loginRedirect

通过浏览器重定向的方式开启新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| locale | string | 指定认证流程使用的语言 | N/A | 否 |
| state | string | 若不使用自动生成的随机串，可自定义 state 参数 | N/A | 否 |
| policy | string | 指定要使用的策略 | 'sign_in_or_sign_up' | 否 |
| org | string | 指定要使用的组织，值为组织的 slug | N/A | 否 |

```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLogin()">登录</button>
  `,
  imports: [CommonModule],
  standalone: true,
})
export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLogin () {
    this.authService.loginRedirect({
      locale: 'en',
      state: JSON.stringify({ info: Math.random() }),
    })
  }
}
```

## loginPopup

在弹窗中开启新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| locale | string | 指定认证流程使用的语言 | N/A | 否 |
| state | string | 若不使用自动生成的随机串，可自定义 state 参数 | N/A | 否 |
| org | string | 指定要使用的组织，值为组织的 slug | N/A | 否 |

```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLoginPopup()">登录</button>
  `,
  imports: [CommonModule],
  standalone: true,
})
export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLoginPopup () {
    this.authService.loginPopup({
      locale: 'en',
      state: JSON.stringify({ info: Math.random() }),
    })
  }
}
```

## logoutRedirect

触发退出登录流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| postLogoutRedirectUri | string | 退出后跳转的 URL | N/A | 否 |

```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLogout()">登出</button>
  `,
  imports: [CommonModule],
  standalone: true,
})
export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLogout () {
    this.authService.logoutRedirect({ postLogoutRedirectUri: 'http://localhost:4200/' })
  }
}
```

## acquireToken

获取用户的 **accessToken**，若已过期则自动刷新。

```
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor (
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  async fetchUserInfo () {
    const token = await this.authService.acquireToken()
    return this.http.get('/api/user', {
      headers: { Authorization: `Bearer ${token}` },
    }).toPromise()
  }
}
```

## acquireUserInfo

从认证服务器获取当前用户的公开信息。

```
const userInfo = await this.authService.acquireUserInfo()
```

## userInfo

当前用户信息。在访问 **userInfo** 之前，请先调用 **acquireUserInfo**。

```
<div>{{ authService.userInfo | json }}</div>
```

## isAuthenticating

指示 SDK 是否正在初始化并尝试获取用户认证状态。

```
<div>{{ authService.isAuthenticating }}</div>
```

## isLoadingToken

指示 SDK 是否正在获取或刷新令牌。

```
<div>{{ authService.isLoadingToken }}</div>
```

## isLoadingUserInfo

指示 SDK 是否正在获取用户信息。

```
<div>{{ authService.isLoadingUserInfo }}</div>
```

## authenticationError

指示是否发生了与认证流程相关的错误。

```
<div>{{ authService.authenticationError }}</div>
```

## acquireTokenError

指示是否发生了与 acquireToken 流程相关的错误。

```
<div>{{ authService.acquireTokenError }}</div>
```

## acquireUserInfoError

指示是否发生了与 acquireUserInfo 流程相关的错误。

```
<div>{{ authService.acquireUserInfoError }}</div>
```

## idToken

当前用户的 **id_token**。

```
<div>{{ authService.idToken }}</div>
```

## account

从 **id_token** 解码得到的账户信息。

```
<div>{{ authService.account | json }}</div>
```

## loginError

指示是否发生了与登录流程相关的错误。

```
<div>{{ authService.loginError }}</div>
```

## logoutError

指示是否发生了与退出流程相关的错误。

```
<div>{{ authService.logoutError }}</div>
```
