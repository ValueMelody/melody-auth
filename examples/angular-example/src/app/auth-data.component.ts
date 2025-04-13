import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'app-auth-data',
  template: `
    <div>
      <p>Is Authenticated: {{ auth.isAuthenticated }}</p>
      <p>Is Authenticating: {{ auth.isAuthenticating }}</p>
      <p>Access Token: {{ auth.accessToken }}</p>
      <p>Refresh Token: {{ auth.refreshToken }}</p>
      <p>Account: {{ auth.account | json }}</p>
      <p>User Info: {{ auth.userInfo | json }}</p>
      <p>Is Loading Token: {{ auth.isLoadingToken }}</p>
      <p>Is Loading User Info: {{ auth.isLoadingUserInfo }}</p>
      <p>Authentication Error: {{ auth.authenticationError }}</p>
      <p>Acquire Token Error: {{ auth.acquireTokenError }}</p>
      <p>Acquire User Info Error: {{ auth.acquireUserInfoError }}</p>
      <p>Login Error: {{ auth.loginError }}</p>
      <p>Logout Error: {{ auth.logoutError }}</p>
    </div>
  `,
  imports: [CommonModule],
})
export class AuthDataComponent {
  constructor (public auth: AuthService) {}
}
