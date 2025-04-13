import {
  computed, inject,
} from 'vue'
import {
  getUserInfo, logout, triggerLogin,
} from '@melody-auth/web'
import {
  handleError, ErrorType, AuthorizeMethod, LoginProps,
} from 'shared'
import {
  handleTokenExchangeByAuthCode, acquireToken as rawAcquireToken,
} from './utils'
import { melodyAuthInjectionKey } from './context'

const SetupError = 'Please install melody-auth plugin first.'

export function useAuth () {
  const state = inject(melodyAuthInjectionKey)

  if (!state) {
    throw new Error(SetupError)
  }

  const accessToken = computed(() => {
    return state.accessTokenStorage?.accessToken ?? null
  })

  const refreshToken = computed(() => {
    return state.refreshTokenStorage?.refreshToken ?? null
  })

  const isAuthenticated = computed(() => {
    return state.isAuthenticated
  })

  const isAuthenticating = computed(() => {
    return state.isAuthenticating
  })

  async function login (
    method: AuthorizeMethod, props?: LoginProps,
  ) {
    if (!state) {
      throw new Error(SetupError)
    }

    if (state.authenticationError) return
    if (state.isAuthenticating) throw new Error('Please wait until isAuthenticating=false')
    if ((state.isAuthenticated) && (!props?.policy || props?.policy === 'sign_in_or_sign_up')) throw new Error('Already authenticated, please logout first')
    try {
      triggerLogin(
        method,
        state.config,
        {
          ...props,
          authorizePopupHandler: ({
            state: requestState, code,
          }) => handleTokenExchangeByAuthCode(
            code,
            requestState,
            state,
            props?.locale,
          ),
        },
      )
    } catch (e) {
      const msg = handleError(
        e,
        ErrorType.LoginFailed,
      )
      state.loginError = msg
    }
  }

  async function loginRedirect (props?: LoginProps) {
    await login(
      'redirect',
      props,
    )
  }

  async function loginPopup (props?: LoginProps) {
    await login(
      'popup',
      props,
    )
  }

  async function acquireToken () {
    if (!state) {
      throw new Error(SetupError)
    }
    return rawAcquireToken(state)
  }

  async function acquireUserInfo () {
    if (!state) {
      throw new Error(SetupError)
    }

    if (state.userInfo) return state.userInfo

    state.isLoadingUserInfo = true

    const accessToken = await acquireToken()
    try {
      const res = await getUserInfo(
        state.config,
        { accessToken: accessToken ?? '' },
      )

      state.userInfo = res
      state.isLoadingUserInfo = false
      state.acquireUserInfoError = ''

      return res
    } catch (e) {
      const errorMsg = handleError(
        e,
        ErrorType.FetchUserInfo,
      )
      state.acquireUserInfoError = errorMsg
      state.isLoadingUserInfo = false
    }
  }

  async function logoutRedirect ({
    postLogoutRedirectUri = '',
    localOnly = false,
  }: {
    postLogoutRedirectUri?: string;
    localOnly?: boolean;
  }) {
    if (!state) {
      throw new Error(SetupError)
    }

    const accessToken = await acquireToken()
    const isLocalOnly = !accessToken || !refreshToken || localOnly

    try {
      await logout(
        state.config,
        accessToken ?? '',
        refreshToken.value ?? '',
        postLogoutRedirectUri,
        isLocalOnly,
      )
    } catch (e) {
      const msg = handleError(
        e,
        ErrorType.LogoutFailed,
      )
      state.logoutError = msg
    }
  }

  return {
    loginRedirect,
    loginPopup,
    refreshToken,
    logoutRedirect,
    accessToken,
    isAuthenticated,
    acquireUserInfo,
    acquireToken,
    isAuthenticating,
    account: computed(() => state.account),
    userInfo: computed(() => state.userInfo),
    isLoadingToken: state.isLoadingToken,
    isLoadingUserInfo: state.isLoadingUserInfo,
    authenticationError: state.authenticationError,
    acquireTokenError: state.acquireTokenError,
    acquireUserInfoError: state.acquireUserInfoError,
    loginError: state.loginError,
    logoutError: state.logoutError,
  }
}
