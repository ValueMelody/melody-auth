import {
  useCallback, useEffect,
} from 'hono/jsx'
import { InitialProps } from 'pages/hooks'
import { routeConfig } from 'configs'
import { parseAuthorizeBaseValues } from 'pages/tools/request'

export interface GoogleSignInProps {
  googleClientId: string;
  locale: string;
  initialProps: InitialProps;
  handleSubmitError: (error: string) => void;
}

const GoogleSignIn = ({
  googleClientId,
  locale,
  initialProps,
  handleSubmitError,
}: GoogleSignInProps) => {
  const handleSubmit = useCallback(
    (response: any) => {
      if (!response.credential) return false

      fetch(
        routeConfig.IdentityRoute.AuthorizeGoogle,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
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
      if (googleClientId) {
        (window as any).handleGoogleSignIn = handleSubmit
        return () => {
          (window as any).handleGoogleSignIn = undefined
        }
      }
    },
    [googleClientId, handleSubmit],
  )

  if (!googleClientId) {
    return null
  }

  return (
    <>
      <script
        src='https://accounts.google.com/gsi/client'
        async
      >
      </script>
      <div
        id='g_id_onload'
        data-client_id={googleClientId}
        data-auto_prompt='false'
        data-callback='handleGoogleSignIn'
      />
      <div className='flex flex-row justify-center'>
        <div
          className='g_id_signin'
          data-type='standard'
          data-size='large'
          data-width='240'
          data-theme='outline'
          data-text='sign_in_with'
          data-locale={locale}
          data-shape='rectangular'
          data-logo_alignment='left'
        />
      </div>
    </>
  )
}

export default GoogleSignIn
