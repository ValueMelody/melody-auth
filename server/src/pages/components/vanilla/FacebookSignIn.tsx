import {
  useCallback, useEffect,
} from 'hono/jsx'
import {
  routeConfig, typeConfig,
} from 'configs'
import { InitialProps } from 'pages/hooks'
import { parseAuthorizeBaseValues } from 'pages/tools/request'

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
  initialProps: InitialProps;
  handleSubmitError: (error: string) => void;
}

const FacebookSignIn = ({
  facebookClientId,
  locale,
  initialProps,
  handleSubmitError,
}: FacebookSignInProps) => {
  const handleSubmit = useCallback(
    (response: any) => {
      if (!response || !response.authResponse || !response.authResponse.accessToken) return false
      fetch(
        routeConfig.IdentityRoute.AuthorizeFacebook,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.authResponse.accessToken,
            ...parseAuthorizeBaseValues(initialProps),
          }),
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text)
            })
          }
          return response.json()
        })
        .catch((error) => {
          handleSubmitError(error)
        })
    },
    [initialProps, handleSubmitError],
  )

  useEffect(
    () => {
      if (facebookClientId) {
        (window as any).handleFacebookSignIn = handleSubmit
        return () => {
          (window as any).handleFacebookSignIn = undefined
        }
      }
    },
    [facebookClientId, handleSubmit],
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
        scope='public_profile'
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
