import { bootstrapApplication } from '@angular/platform-browser'
import { provideAuth } from '@melody-auth/angular'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

bootstrapApplication(
  AppComponent,
  {
    providers: [
      provideAuth({
        clientId: '__CLIENT_ID__',
        redirectUri: 'http://localhost:3000/en/dashboard',
        serverUri: 'http://localhost:8787',
        storage: 'localStorage',
      }),
      ...appConfig.providers,
    ],
  },
)
  .catch((err) => console.error(err))
