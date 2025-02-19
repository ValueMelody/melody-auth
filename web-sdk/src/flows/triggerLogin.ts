import {
  ProviderConfig, SessionStorageKey, AuthorizeMethod,
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
  authorizePopupHandler?: (data: { state: string; code: string }) => void;
}

export const triggerLogin = async (
  authorizeMethod: AuthorizeMethod, config: ProviderConfig, additionalProps?: AdditionalProps,
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
        authorizeMethod,
        locale: additionalProps?.locale,
        policy: additionalProps?.policy,
        org: additionalProps?.org,
        authorizePopupHandler: additionalProps?.authorizePopupHandler,
      },
    )
  } catch (e) {
    throw new Error(`Failed to initial authorize flow: ${e}`)
  }
}
