import { SessionStorageKey } from 'definitions'
import {
  genCodeVerifierAndChallenge, genAuthorizeState,
} from 'generators'
import {
  CommonProps, getAuthorize,
} from 'requests'

export const loginRedirect = async (common: CommonProps) => {
  const state = genAuthorizeState(21)
  const {
    codeChallenge, codeVerifier,
  } = await genCodeVerifierAndChallenge()
  window.sessionStorage.setItem(
    SessionStorageKey.State,
    state,
  )
  window.sessionStorage.setItem(
    SessionStorageKey.CodeVerifier,
    codeVerifier,
  )
  try {
    await getAuthorize(
      common,
      {
        state, codeChallenge,
      },
    )
  } catch (e) {
    throw new Error('Failed to initial authorize flow')
  }
}
