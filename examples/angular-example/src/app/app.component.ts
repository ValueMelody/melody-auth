import { Component } from '@angular/core'
import { AuthActionsComponent } from './auth-actions.component'
import { AuthDataComponent } from './auth-data.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AuthActionsComponent,
    AuthDataComponent,
  ],
  template: `
    <div>
      <app-auth-actions></app-auth-actions>
      <app-auth-data></app-auth-data>
    </div>
  `,
})
export class AppComponent {}
