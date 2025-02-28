import { useMemo } from 'hono/jsx'
import { parse } from 'qs'
import { typeConfig } from 'configs'
import { Policy } from 'dtos/oauth'

export interface InitialProps {
  locales: typeConfig.Locale[];
  logoUrl: string;
  locale: typeConfig.Locale;
  enableLocaleSelector: boolean;
  enableSignUp: boolean;
  enablePasswordReset: boolean;
  enablePasswordSignIn: boolean;
  clientId: string;
  redirectUri: string;
  responseType: string;
  state: string;
  policy: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  org: string;
  scope: string;
  googleClientId: string;
  facebookClientId: string;
  githubClientId: string;
}

const useInitialProps = () => {
  const initialProps: InitialProps = useMemo(
    () => {
      const params = parse(
        window.location.search,
        { ignoreQueryPrefix: true },
      )

      const intialProps = (
        '__initialProps' in window &&
        typeof window.__initialProps === 'object' &&
        !!window.__initialProps
      )
        ? window.__initialProps
        : {
          locales: [],
          logoUrl: '',
        }

      const locales = 'locales' in intialProps ? String(intialProps.locales).split(',') : []
      const locale = 'locale' in params ? String(params.locale) : (locales[0] ?? 'en')

      return {
        locales: locales as typeConfig.Locale[],
        logoUrl: 'logoUrl' in intialProps ? String(intialProps.logoUrl) : '',
        googleClientId: 'googleClientId' in intialProps ? String(intialProps.googleClientId) : '',
        facebookClientId: 'facebookClientId' in intialProps ? String(intialProps.facebookClientId) : '',
        githubClientId: 'githubClientId' in intialProps ? String(intialProps.githubClientId) : '',
        enableLocaleSelector: 'enableLocaleSelector' in intialProps ? Boolean(intialProps.enableLocaleSelector) : false,
        enableSignUp: 'enableSignUp' in intialProps ? Boolean(intialProps.enableSignUp) : false,
        enablePasswordReset: 'enablePasswordReset' in intialProps ? Boolean(intialProps.enablePasswordReset) : false,
        enablePasswordSignIn: 'enablePasswordSignIn' in intialProps ? Boolean(intialProps.enablePasswordSignIn) : false,
        locale: locale as typeConfig.Locale,
        clientId: 'client_id' in params ? String(params.client_id) : '',
        redirectUri: 'redirect_uri' in params ? String(params.redirect_uri) : '',
        responseType: 'response_type' in params ? String(params.response_type) : '',
        state: 'state' in params ? String(params.state) : '',
        policy: 'policy' in params ? String(params.policy) : Policy.SignInOrSignUp,
        codeChallenge: 'code_challenge' in params ? String(params.code_challenge) : '',
        codeChallengeMethod: 'code_challenge_method' in params ? String(params.code_challenge_method) : '',
        org: 'org' in params ? String(params.org) : '',
        scope: 'scope' in params ? String(params.scope) : '',
      }
    },
    [],
  )

  return { initialProps }
}

export default useInitialProps
