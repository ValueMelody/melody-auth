import {
  useEffect, useState,
} from 'hono/jsx'
import {
  typeConfig, routeConfig,
} from 'configs'
import {
  useSocialSignIn, View,
} from 'pages/hooks'
import { AuthorizeParams } from 'pages/tools/param'

export interface AppleSignInProps {
  appleClientId: string;
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
}

const AppleSignIn = ({
  appleClientId,
  locale,
  params,
  onSwitchView,
  handleSubmitError,
}: AppleSignInProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const { socialSignInState } = useSocialSignIn({
    params,
    locale,
    handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      if (appleClientId && scriptLoaded && 'AppleID' in window) {
        (window.AppleID as any).auth.init({
          clientId: appleClientId,
          scope: 'name email',
          redirectURI: `${window.location.origin}${routeConfig.IdentityRoute.AuthorizeApple}`,
          state: JSON.stringify(socialSignInState),
          usePopup: false,
        })
      }
    },
    [scriptLoaded, appleClientId, socialSignInState],
  )

  if (!appleClientId) {
    return null
  }

  return (
    <>
      <script
        type='text/javascript'
        src='https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        id='apple-login-btn'
        className='w-[240px] h-[40px]'>
        <div
          id='appleid-signin'
          data-color='black'
          data-border='true'
          data-type='sign in'
        />
      </div>
    </>
  )
}

export default AppleSignIn
