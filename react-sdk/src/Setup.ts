import {
  useContext, useEffect,
  useRef,
} from 'react'
import { exchangeTokenByAuthCode } from 'web-sdk'
import { useAuth } from './useAuth'
import authContext, { AuthContext } from './context'
import {
  ErrorType, handleError,
} from './utils'

const Setup = () => {
  const { acquireToken } = useAuth()
  const context = useContext<AuthContext>(authContext)
  const {
    state, dispatch,
  } = context

  const initialized = useRef(false)

  useEffect(
    () => {
      const containCode = window.location.search.includes('?code=') || window.location.search.includes('&code=')

      if (initialized.current) return

      if (containCode || state.checkedStorage) initialized.current = true

      if (state.accessTokenStorage) return

      if (!containCode && state.refreshTokenStorage && !state.accessTokenStorage) {
        acquireToken()
        return
      }

      if (containCode || state.checkedStorage) {
        exchangeTokenByAuthCode(state.config)
          .then((res) => {
            if (res?.accessTokenStorage) {
              dispatch({
                type: 'setAccessTokenStorage', payload: res.accessTokenStorage,
              })
            } else {
              dispatch({
                type: 'setIsAuthenticating', payload: false,
              })
            }
            if (res?.refreshTokenStorage) {
              dispatch({
                type: 'setAuth',
                payload: {
                  refreshTokenStorage: res.refreshTokenStorage,
                  idTokenBody: res.idTokenBody,
                },
              })
            }
          })
          .catch((e) => {
            const msg = handleError(
              e,
              ErrorType.ObtainAccessToken,
            )
            dispatch({
              type: 'setAuthenticationError', payload: msg,
            })
          })
      }
    },
    [dispatch, state.checkedStorage, state.accessTokenStorage, state.config, acquireToken, state.refreshTokenStorage],
  )

  return null
}

export default Setup
