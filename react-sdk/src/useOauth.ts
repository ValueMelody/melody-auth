import {
  useCallback, useContext,
  useMemo,
} from 'react'
import { loginRedirect as rawLoginRedirect } from 'web-sdk'
import { CommonParam } from 'web-sdk/dist/requests'
import oauthContext, { OauthContext } from './context'

export const useOauth = () => {
  const context = useContext<OauthContext>(oauthContext)
  const {
    state, dispatch,
  } = context

  const commonParam: CommonParam = useMemo(
    () => ({
      ...state.config,
      setIsLoading: (val: boolean) => {
        dispatch({
          type: 'setIsLoading', payload: val,
        })
      },
    }),
    [state.config, dispatch],
  )

  const loginRedirect = useCallback(
    () => {
      rawLoginRedirect(commonParam)
    },
    [commonParam],
  )

  return { loginRedirect }
}
