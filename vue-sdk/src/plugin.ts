import {
  App, reactive,
} from 'vue'
import {
  ProviderConfig, RefreshTokenStorage, IdTokenBody, isValidStorage, getParams, checkStorage,
} from 'shared'
import { loadCodeAndStateFromUrl } from '@melody-auth/web'
import {
  AuthState, melodyAuthInjectionKey,
} from './context'
import {
  acquireToken, handleTokenExchangeByAuthCode,
} from './utils'

export const AuthProvider = {
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

    const initialWithStorage = () => {
      if (typeof window === 'undefined') return

      const {
        storedRefreshToken, storedAccount,
      } = checkStorage(config.storage)

      if (storedRefreshToken) {
        const parsed: RefreshTokenStorage = JSON.parse(storedRefreshToken)
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

    initialWithStorage()

    app.provide(
      melodyAuthInjectionKey,
      state,
    )

    app.mixin({
      mounted () {
        const params = getParams()
        const containCode = 'code' in params && !!params.code

        if (state.accessTokenStorage) return

        if (!containCode && state.refreshTokenStorage && !state.accessTokenStorage) {
          acquireToken(state)
          return
        }

        if (!state.authenticationError && (containCode || state.checkedStorage)) {
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
