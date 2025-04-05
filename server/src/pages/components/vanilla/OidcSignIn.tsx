import {
  useEffect, useState,
} from 'hono/jsx'
import { genCodeChallenge } from 'shared'
import {
  useSocialSignIn, View,
} from 'pages/hooks'
import { AuthorizeParams } from 'pages/tools/param'
import {
  typeConfig, routeConfig,
} from 'configs'
import { signIn } from 'pages/tools/locale'

export interface OidcSignInProps {
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
  oidcProviders: string[];
}

const OidcSignIn = ({
  locale,
  oidcProviders,
  params,
  handleSubmitError,
  onSwitchView,
}: OidcSignInProps) => {
  const [codeChallenge, setCodeChallenge] = useState<string>('')

  const {
    oidcConfigs, socialSignInState, oidcCodeVerifier,
  } = useSocialSignIn({
    params,
    locale,
    handleSubmitError,
    onSwitchView,
    oidcProviders,
  })

  useEffect(
    () => {
      const initCodeChallenge = async () => {
        const challenge = await genCodeChallenge(oidcCodeVerifier)
        setCodeChallenge(challenge)
      }
      if (oidcCodeVerifier) {
        initCodeChallenge()
      }
    },
    [oidcCodeVerifier],
  )

  return (
    <>
      {
        oidcConfigs.map((oidcConfig) => {
          return (
            <div
              key={oidcConfig.name}
              className='flex flex-row justify-center'
            >
              <a
                id={`oidc-${oidcConfig.name}`}
                className='cursor-pointer w-[240px] h-[40px] text-center p-2 bg-primaryButtonColor text-primaryButtonLabelColor border border-primaryButtonBorderColor rounded-lg font-medium text-base'
                href={`${oidcConfig.config.authorizeEndpoint}?client_id=${oidcConfig.config.clientId}&state=${JSON.stringify({
                  ...socialSignInState,
                  codeVerifier: oidcCodeVerifier,
                })}&scope=openid&redirect_uri=${window.location.origin}${routeConfig.IdentityRoute.AuthorizeOidc}/${oidcConfig.name}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`}
              >
                {`${signIn.oidcSignIn[locale]}${oidcConfig.name}`}
              </a>
            </div>
          )
        })
      }
    </>
  )
}

export default OidcSignIn
