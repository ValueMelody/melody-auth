import { bootstrapApplication } from '@angular/platform-browser'
import { provideAuth } from '@melody-auth/angular'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

bootstrapApplication(
  AppComponent,
  {
    providers: [
      provideAuth({
        clientId: '3aDCB32a6E4aee15c46672A23FE11326a26fC3F5c0EBC7ca43ba87CD34865dE5',
        redirectUri: 'http://localhost:3000/en/dashboard',
        serverUri: 'http://localhost:8787',
        storage: 'localStorage',
      }),
      ...appConfig.providers,
    ],
  },
)
  .catch((err) => console.error(err))
