import { createApp } from 'vue'
import { AuthProvider } from '@melody-auth/vue'
import App from './App.vue'

const app = createApp(App)

app.use(
  AuthProvider,
  {
    clientId: import.meta.env.VITE_AUTH_SPA_CLIENT_ID,
    redirectUri: import.meta.env.VITE_CLIENT_URI,
    serverUri: import.meta.env.VITE_AUTH_SERVER_URI,
    storage: 'localStorage',
  },
)

app.mount('#app')
