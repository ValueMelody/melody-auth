import { InitialProps } from 'pages/hooks'

export const parseAuthorizeBaseValues = (initialProps: InitialProps) => {
  return {
    clientId: initialProps.clientId,
    redirectUri: initialProps.redirectUri,
    responseType: initialProps.responseType,
    state: initialProps.state,
    policy: initialProps.policy,
    codeChallenge: initialProps.codeChallenge,
    codeChallengeMethod: initialProps.codeChallengeMethod,
    locale: initialProps.locale,
    org: initialProps.org,
    scope: initialProps.scope,
  }
}
