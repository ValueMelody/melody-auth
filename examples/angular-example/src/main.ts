import { bootstrapApplication } from '@angular/platform-browser'
import { provideAuth } from '@melody-auth/angular'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

bootstrapApplication(
  AppComponent,
  {
    providers: [
      provideAuth({
        clientId: '1A3564de462142A60cE5456edaADB5659dBC1B9c719c9E558dcaac0850a2f8F8',
        redirectUri: 'http://localhost:3000/en/dashboard',
        serverUri: 'http://localhost:8787',
        storage: 'localStorage',
      }),
      ...appConfig.providers,
    ],
  },
)
  .catch((err) => console.error(err))
