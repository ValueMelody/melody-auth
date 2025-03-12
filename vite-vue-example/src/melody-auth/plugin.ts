import {
  App, provide, reactive,
} from 'vue'
import {
  ProviderConfig, StorageKey, RefreshTokenStorage, IdTokenBody, isValidStorage,
  getParams,
} from 'shared'
import { AuthState, melodyAuthInjectionKey } from './context'
import { acquireToken, handleTokenExchangeByAuthCode } from './utils'
import { loadCodeAndStateFromUrl } from '@melody-auth/web'

export const MelodyAuth = {
  install (
    app: App, config: ProviderConfig,
  ) {
    const state = reactive<AuthState>({
      isAuthenticating: true,
      authenticationError: '',
      isAuthenticated: false,
      config,
      userInfo: null,
      account: null,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      checkedStorage: false,
      isLoadingUserInfo: false,
      acquireUserInfoError: '',
      isLoadingToken: false,
      acquireTokenError: '',
      loginError: '',
      logoutError: '',
    })

    const checkStorage = () => {
      if (typeof window === 'undefined') return

      const storage = config.storage === 'sessionStorage'
        ? window.sessionStorage
        : window.localStorage

      const stored = storage.getItem(StorageKey.RefreshToken)
      const storedAccount = storage.getItem(StorageKey.Account)

      if (stored) {
        const parsed: RefreshTokenStorage = JSON.parse(stored)
        const isValid = isValidStorage(parsed)

        if (isValid) {
          const parsedAccount: IdTokenBody = storedAccount
            ? JSON.parse(storedAccount)
            : null

          state.refreshTokenStorage = parsed
          state.account = parsedAccount
          state.checkedStorage = true
          return
        }
      }
      state.checkedStorage = true
    }

    checkStorage()

    app.provide(melodyAuthInjectionKey, state)

    app.mixin({
      mounted() {
        const params = getParams()
        const containCode = 'code' in params && !!params.code

        if (state.accessTokenStorage) return

        if (!containCode && state.refreshTokenStorage && !state.accessTokenStorage) {
          acquireToken(state)
          return
        }

        if (containCode || state.checkedStorage) {
          const {
            code, state: requestState,
          } = loadCodeAndStateFromUrl()

          handleTokenExchangeByAuthCode(
            code,
            requestState,
            state,
            'locale' in params ? params.locale : undefined,
          )
        }
      },
    })
  },
}
