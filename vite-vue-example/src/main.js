import { createApp } from 'vue'
import App from './App.vue'
import { MelodyAuth } from './melody-auth/plugin'

const app = createApp(App)

app.use(MelodyAuth, {
  clientId: '1A3564de462142A60cE5456edaADB5659dBC1B9c719c9E558dcaac0850a2f8F8',
  redirectUri: 'http://localhost:3000/en/dashboard',
  serverUri: 'http://localhost:8787',
  storage: 'localStorage',
})

app.mount('#app')
