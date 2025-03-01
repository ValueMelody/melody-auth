import { parse } from 'qs'
import { typeConfig } from 'configs'
import { Policy } from 'dtos/oauth'

export const getLocaleFromParams = () => {
  const params = parse(
    window.location.search,
    { ignoreQueryPrefix: true },
  )

  return ('locale' in params ? String(params.locale) : 'en') as typeConfig.Locale
}

export const getStepFromParams = () => {
  const params = parse(
    window.location.search,
    { ignoreQueryPrefix: true },
  )

  return 'step' in params ? String(params.step) : ''
}

export interface AuthorizeParams {
  locale: typeConfig.Locale;
  clientId: string;
  redirectUri: string;
  responseType: string;
  state: string;
  policy: Policy;
  codeChallenge: string;
  codeChallengeMethod: string;
  org: string;
  scope: string;
}

export const getAuthorizeParams = (): AuthorizeParams => {
  const params = parse(
    window.location.search,
    { ignoreQueryPrefix: true },
  )

  return {
    locale: ('locale' in params ? String(params.locale) : 'en') as typeConfig.Locale,
    clientId: 'client_id' in params ? String(params.client_id) : '',
    redirectUri: 'redirect_uri' in params ? String(params.redirect_uri) : '',
    responseType: 'response_type' in params ? String(params.response_type) : '',
    state: 'state' in params ? String(params.state) : '',
    policy: ('policy' in params ? String(params.policy) : Policy.SignInOrSignUp) as Policy,
    codeChallenge: 'code_challenge' in params ? String(params.code_challenge) : '',
    codeChallengeMethod: 'code_challenge_method' in params ? String(params.code_challenge_method) : '',
    org: 'org' in params ? String(params.org) : '',
    scope: 'scope' in params ? String(params.scope) : '',
  }
}

export interface FollowUpParams {
  code: string;
  state: string;
  redirectUri: string;
  org: string;
}

export const getFollowUpParams = (): FollowUpParams => {
  const params = parse(
    window.location.search,
    { ignoreQueryPrefix: true },
  )

  return {
    code: 'code' in params ? String(params.code) : '',
    state: 'state' in params ? String(params.state) : '',
    redirectUri: 'redirect_uri' in params ? String(params.redirect_uri) : '',
    org: 'org' in params ? String(params.org) : '',
  }
}
