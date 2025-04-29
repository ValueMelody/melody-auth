# Angular SDK

## Installation

```
npm install @melody-auth/angular --save
```

## AuthProvider

Provide the auth related configs to your application bootstrap.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| clientId | string | The auth clientId your frontend connects to | N/A | Yes |
| redirectUri | string | The URL to redirect users after successful authentication | N/A | Yes |
| serverUri | string | The URL where you host the melody auth server | N/A | Yes |
| scopes | string[] | Permission scopes to request for user access | N/A | No |
| storage | 'sessionStorage' \| 'localStorage' | Storage type for authentication tokens | 'localStorage' | No |
| onLoginSuccess | (attr: { locale?: string; state?: string }) => void | Function to execute after a successful login | N/A | No |

```
import { bootstrapApplication } from '@angular/platform-browser'
import { provideAuth } from '@melody-auth/angular'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

bootstrapApplication(
  AppComponent,
  {
    providers: [
      provideAuth({
        clientId: environment.clientId,
        redirectUri: environment.redirectUri,
        serverUri: environment.serverUri,
        storage: 'localStorage',
      }),
      ...appConfig.providers,
    ],
  },
)
```

## isAuthenticated

Indicates if the current user is authenticated.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <p>Is Authenticated: {{ authService.isAuthenticated }}</p>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## loginRedirect

Triggers a new authentication flow by redirecting to the auth server.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| policy | string | Specifies the policy to use in the authentication flow | 'sign_in_or_sign_up' | No |
| org | string | Specifies the organization to use in the authentication flow, the value should be the slug of the organization | N/A | No |

```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLoginRedirect()">Login</button>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLoginRedirect () {
    this.authService.loginRedirect()
  }
}
```

## loginPopup

Triggers a new authentication flow in a popup.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| org | string | Specifies the organization to use in the authentication flow, the value should be the slug of the organization | N/A | No |
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLoginPopup()">Login</button>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLoginPopup () {
    this.authService.loginPopup()
  }
}
```

## logoutRedirect

Triggers the logout flow.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| postLogoutRedirectUri | string | The URL to redirect users after logout | N/A | No |

```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="onLogout()">Logout</button>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLogout () {
    this.authService.logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000' })
  }
}
```

## acquireToken

Gets the user's accessToken, or refreshes it if expired.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="fetchResource()">Acquire Token</button>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  async fetchResource () {
    const accessToken = await this.authService.acquireToken()
    // Use the token to fetch protected resources
    await fetch('/...', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }
}
```

## acquireUserInfo

Gets the user's public info from the auth server.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <button (click)="fetchUserInfo()">Fetch User Info</button>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  async fetchUserInfo () {
    const userInfo = await this.authService.acquireUserInfo()
  }
}
```

## userInfo

The current user's details. Be sure to invoke acquireUserInfo before accessing userInfo.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.userInfo | json }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## isAuthenticating

Indicates whether the SDK is initializing and attempting to obtain the user's authentication state.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.isAuthenticating }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## isLoadingToken

Indicates whether the SDK is acquiring token.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.isLoadingToken }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## isLoadingUserInfo

Indicates whether the SDK is acquiring user info.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.isLoadingUserInfo }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## authenticationError

Indicates whether there is an authentication process related error.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.authenticationError }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## acquireTokenError

Indicates whether there is an acquireToken process related error.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.acquireTokenError }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## acquireUserInfoError

Indicates whether there is an acquireUserInfo process related error.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.acquireUserInfoError }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## idToken

The id_token of the current user.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.idToken }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## account

Decoded account information from id_token.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.account }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## loginError

Indicates whether there is an login process related error.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.loginError }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```

## logoutError

Indicates whether there is an login process related error.
```
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'auth-component',
  template: `
    <div>{{ authService.logoutError }}</div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}
}
```
