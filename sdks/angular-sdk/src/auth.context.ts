import {
  Inject, Injectable, signal,
} from '@angular/core'
import {
  ProviderConfig,
  IdTokenBody,
  isValidStorage,
  getParams,
  checkStorage,
  AuthState,
  loadRefreshTokenStorageFromParams,
} from '@melody-auth/shared'
import { loadCodeAndStateFromUrl } from '@melody-auth/web'
import {
  acquireToken,
  handleTokenExchangeByAuthCode,
} from './utils'
import { PROVIDER_CONFIG } from './auth.provider'

@Injectable({ providedIn: 'root' })

export class AuthContext {
  state = signal<AuthState>({
    isAuthenticating: true,
    authenticationError: '',
    isAuthenticated: false,
    config: null as unknown as ProviderConfig,
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

  constructor (@Inject(PROVIDER_CONFIG) config: ProviderConfig) {
    this.initialize(config)
  }

  initialize (config: ProviderConfig): void {
    this.state.update((prev) => ({
      ...prev,
      config,
    }))

    this.initialWithStorage()

    this.onMounted()
  }

  private initialWithStorage (): void {
    if (typeof window === 'undefined' || !this.state().config) return

    let parsed = loadRefreshTokenStorageFromParams(this.state().config.storage)

    const {
      storedRefreshToken, storedAccount,
    } = checkStorage(this.state().config.storage)

    if (!parsed && storedRefreshToken) {
      parsed = JSON.parse(storedRefreshToken)
    }

    if (parsed) {
      const valid = isValidStorage(parsed)

      if (valid) {
        const parsedAccount: IdTokenBody | null = storedAccount
          ? JSON.parse(storedAccount)
          : null
        this.state.update((prev) => ({
          ...prev,
          refreshTokenStorage: parsed,
          account: parsedAccount,
          checkedStorage: true,
        }))
        return
      }
    }

    this.state.update((prev) => ({
      ...prev,
      checkedStorage: true,
    }))
  }

  private onMounted (): void {
    const params = getParams()
    const containsCode = 'code' in params && !!params.code

    if (this.state().accessTokenStorage) {
      return
    }

    if (!containsCode && this.state().refreshTokenStorage && !this.state().accessTokenStorage) {
      acquireToken(this.state)
      return
    }

    if (!this.state().authenticationError && (containsCode || this.state().checkedStorage)) {
      const {
        code, state: requestState,
      } = loadCodeAndStateFromUrl()
      const locale = 'locale' in params ? params.locale : undefined

      handleTokenExchangeByAuthCode(
        code,
        requestState,
        this.state,
        locale,
      )
    }
  }
}
