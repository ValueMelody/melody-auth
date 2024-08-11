import {
  ProviderConfig, SessionStorageKey,
} from 'shared'
import {
  genCodeVerifierAndChallenge, genAuthorizeState,
} from '../generators'
import { getAuthorize } from '../requests'

export const loginRedirect = async (
  config: ProviderConfig, locale?: string,
) => {
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
      config,
      {
        state, codeChallenge, locale,
      },
    )
  } catch (e) {
    throw new Error(`Failed to initial authorize flow: ${e}`)
  }
}
