import { useMemo } from 'hono/jsx'
import { typeConfig } from 'configs'

export interface InitialProps {
  locales: typeConfig.Locale[];
  logoUrl: string;
  enableLocaleSelector: boolean;
  enableSignUp: boolean;
  enablePasswordReset: boolean;
  enablePasswordSignIn: boolean;
  enablePasswordlessSignIn: boolean;
  enableNames: boolean;
  allowPasskey: boolean;
  namesIsRequired: boolean;
  appName: string;
  termsLink: string;
  privacyPolicyLink: string;
  googleClientId: string;
  facebookClientId: string;
  githubClientId: string;
  discordClientId: string;
  oidcProviders: string[];
}

const useInitialProps = () => {
  const initialProps: InitialProps = useMemo(
    () => {
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

      return {
        locales: locales as typeConfig.Locale[],
        logoUrl: 'logoUrl' in intialProps ? String(intialProps.logoUrl) : '',
        googleClientId: 'googleClientId' in intialProps ? String(intialProps.googleClientId) : '',
        facebookClientId: 'facebookClientId' in intialProps ? String(intialProps.facebookClientId) : '',
        githubClientId: 'githubClientId' in intialProps ? String(intialProps.githubClientId) : '',
        discordClientId: 'discordClientId' in intialProps ? String(intialProps.discordClientId) : '',
        oidcProviders: 'oidcProviders' in intialProps && intialProps.oidcProviders ? String(intialProps.oidcProviders).split(',') : [],
        enableLocaleSelector: 'enableLocaleSelector' in intialProps ? Boolean(intialProps.enableLocaleSelector) : false,
        enableSignUp: 'enableSignUp' in intialProps ? Boolean(intialProps.enableSignUp) : false,
        enablePasswordReset: 'enablePasswordReset' in intialProps ? Boolean(intialProps.enablePasswordReset) : false,
        enablePasswordSignIn: 'enablePasswordSignIn' in intialProps ? Boolean(intialProps.enablePasswordSignIn) : false,
        enablePasswordlessSignIn: 'enablePasswordlessSignIn' in intialProps ? Boolean(intialProps.enablePasswordlessSignIn) : false,
        enableNames: 'enableNames' in intialProps ? Boolean(intialProps.enableNames) : false,
        namesIsRequired: 'namesIsRequired' in intialProps ? Boolean(intialProps.namesIsRequired) : false,
        termsLink: 'termsLink' in intialProps ? String(intialProps.termsLink) : '',
        privacyPolicyLink: 'privacyPolicyLink' in intialProps ? String(intialProps.privacyPolicyLink) : '',
        appName: 'appName' in intialProps ? String(intialProps.appName) : '',
        allowPasskey: 'allowPasskey' in intialProps ? Boolean(intialProps.allowPasskey) : false,
      }
    },
    [],
  )

  return { initialProps }
}

export default useInitialProps
