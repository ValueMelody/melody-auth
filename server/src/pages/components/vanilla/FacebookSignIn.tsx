import { useEffect } from 'hono/jsx'
import {
  typeConfig, variableConfig,
} from 'configs'
import {
  useSocialSignIn, View,
} from 'pages/hooks'
import { AuthorizeParams } from 'pages/tools/param'

const getFBLocale = (locale: typeConfig.Locale) => {
  switch (locale) {
  case 'fr': return 'fr_FR'
  case 'en':
  default:
    return 'en_US'
  }
}

export interface FacebookSignInProps {
  facebookClientId: string;
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  onSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
}

const FacebookSignIn = ({
  facebookClientId,
  locale,
  params,
  onSubmitError,
  onSwitchView,
}: FacebookSignInProps) => {
  const { handleFacebookSignIn } = useSocialSignIn({
    params,
    onSubmitError,
    locale,
    onSwitchView,
  })

  useEffect(
    () => {
      if (facebookClientId) {
        (window as any).handleFacebookSignIn = handleFacebookSignIn
        return () => {
          (window as any).handleFacebookSignIn = undefined
        }
      }
    },
    [facebookClientId, handleFacebookSignIn],
  )

  if (!facebookClientId) {
    return null
  }

  return (
    <div
      id='facebook-login-btn'
      className='flex flex-row justify-center'
    >
      <fb:login-button
        scope={variableConfig.SocialSignInConfig.FacebookScope}
        data-size='Large'
        data-width='220'
        data-use-continue-as='false'
        onlogin='checkLoginState();'
      />
      <script>
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId: ${facebookClientId},
              cookie: true,
              xfbml: true,
              version: 'v20.0'
            });
            FB.AppEvents.logPageView();
          };
          (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/${getFBLocale(locale)}/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
          function checkLoginState() {
            FB.getLoginStatus(function(response) {
              window.handleFacebookSignIn(response);
            });
          }
        `}
      </script>
    </div>
  )
}

export default FacebookSignIn
