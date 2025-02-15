import {
  ProviderConfig, SessionStorageKey,
} from 'shared'
import {
  genCodeVerifierAndChallenge, genAuthorizeState,
} from '../generators'
import { getAuthorize } from '../requests'

export interface AdditionalProps {
  locale?: string;
  state?: string;
  policy?: string;
  org?: string;
}

export const loginRedirect = async (
  config: ProviderConfig, additionalProps?: AdditionalProps,
) => {
  const state = additionalProps?.state || genAuthorizeState(21)
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
        state,
        codeChallenge,
        locale: additionalProps?.locale,
        policy: additionalProps?.policy,
        org: additionalProps?.org,
      },
    )
  } catch (e) {
    throw new Error(`Failed to initial authorize flow: ${e}`)
  }
}
