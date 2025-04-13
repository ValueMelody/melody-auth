import {
  Injectable, computed, signal,
} from '@angular/core'
import {
  triggerLogin,
  getUserInfo,
  logout,
} from '@melody-auth/web'
import {
  handleError, ErrorType, AuthorizeMethod, LoginProps,
  GetUserInfoRes,
  ProviderConfig,
} from 'shared'
import {
  handleTokenExchangeByAuthCode,
  acquireToken as rawAcquireToken,
} from './utils'
import { AuthContext } from './auth.context'

@Injectable({ providedIn: 'root' })

export class AuthService {
  constructor (private authContext: AuthContext) {}

  accessToken = computed(() => {
    const state = this.authContext.state()
    return state.accessTokenStorage?.accessToken ?? null
  })

  refreshToken = computed(() => {
    const state = this.authContext.state()
    return state.refreshTokenStorage?.refreshToken ?? null
  })

  isAuthenticated = computed(() => this.authContext.state().isAuthenticated)
  isAuthenticating = computed(() => this.authContext.state().isAuthenticating)
  account = computed(() => this.authContext.state().account)
  userInfo = computed(() => this.authContext.state().userInfo)

  get isLoadingToken (): boolean {
    return this.authContext.state().isLoadingToken
  }

  get isLoadingUserInfo (): boolean {
    return this.authContext.state().isLoadingUserInfo
  }

  get authenticationError (): string {
    return this.authContext.state().authenticationError
  }

  get acquireTokenError (): string {
    return this.authContext.state().acquireTokenError
  }

  get acquireUserInfoError (): string {
    return this.authContext.state().acquireUserInfoError
  }

  get loginError (): string {
    return this.authContext.state().loginError
  }

  get logoutError (): string {
    return this.authContext.state().logoutError
  }

  async login (
    method: AuthorizeMethod, props?: LoginProps,
  ) {
    const state = this.authContext.state()

    if (state.authenticationError) {
      return
    }
    if (state.isAuthenticating) {
      throw new Error('Please wait until isAuthenticating=false')
    }
    if (state.isAuthenticated && (!props?.policy || props?.policy === 'sign_in_or_sign_up')) {
      throw new Error('Already authenticated, please logout first')
    }
    try {
      triggerLogin(
        method,
        state.config,
        {
          ...props,
          authorizePopupHandler: ({
            state: requestState, code,
          }) =>
            handleTokenExchangeByAuthCode(
              code,
              requestState,
              this.authContext.state,
              props?.locale,
            ),
        },
      )
    } catch (e: any) {
      const msg = handleError(
        e,
        ErrorType.LoginFailed,
      )
      this.authContext.state.update((prev) => ({
        ...prev,
        loginError: msg,
      }))
    }
  }

  async loginRedirect (props?: LoginProps): Promise<void> {
    await this.login(
      'redirect',
      props,
    )
  }

  async loginPopup (props?: LoginProps): Promise<void> {
    await this.login(
      'popup',
      props,
    )
  }

  async acquireToken () {
    return rawAcquireToken(this.authContext.state)
  }

  async acquireUserInfo (): Promise<GetUserInfoRes | undefined> {
    const state = this.authContext.state()
    if (state.userInfo) {
      return state.userInfo
    }

    this.authContext.state.update((prev) => ({
      ...prev,
      isLoadingUserInfo: true,
    }))

    const token = await this.acquireToken()
    try {
      const res = await getUserInfo(
        state.config,
        { accessToken: token ?? '' },
      )
      this.authContext.state.update((prev) => ({
        ...prev,
        userInfo: res,
        isLoadingUserInfo: false,
        acquireUserInfoError: '',
      }))
      return res
    } catch (e: any) {
      const errorMsg = handleError(
        e,
        ErrorType.FetchUserInfo,
      )
      this.authContext.state.update((prev) => ({
        ...prev,
        acquireUserInfoError: errorMsg,
        isLoadingUserInfo: false,
      }))

      return undefined
    }
  }

  async logoutRedirect ({
    postLogoutRedirectUri = '',
    localOnly = false,
  }: {
    postLogoutRedirectUri?: string;
    localOnly?: boolean;
  }) {
    const state = this.authContext.state()
    const accessToken = await this.acquireToken()
    const refreshToken = this.refreshToken()
    const isLocalOnly = !accessToken || !refreshToken || localOnly

    try {
      await logout(
        state.config,
        accessToken ?? '',
        refreshToken ?? '',
        postLogoutRedirectUri,
        isLocalOnly,
      )
    } catch (e: any) {
      const msg = handleError(
        e,
        ErrorType.LogoutFailed,
      )
      this.authContext.state.update((prev) => ({
        ...prev,
        logoutError: msg,
      }))
    }
  }
}
