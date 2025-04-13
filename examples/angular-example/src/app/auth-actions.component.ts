import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { AuthService } from '@melody-auth/angular'

@Component({
  selector: 'app-auth-actions',
  template: `
    <div>
      <button (click)="onLoginRedirect()">Login</button>
      <button (click)="onAcquireUserInfo()">Acquire User Info</button>
      <button (click)="onLogout()">Logout</button>
    </div>
  `,
  imports: [CommonModule],
})

export class AuthActionsComponent {
  constructor (private authService: AuthService) {}

  onLoginRedirect () {
    this.authService.loginRedirect()
  }

  onAcquireUserInfo () {
    this.authService.acquireUserInfo()
  }

  onLogout (): void {
    this.authService.logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000' })
  }
}
