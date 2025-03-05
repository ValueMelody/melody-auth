import { useEffect } from 'hono/jsx'
import { useSocialSignIn, View } from 'pages/hooks'
import { typeConfig } from 'configs'
import { AuthorizeParams } from 'pages/tools/param'

export interface GoogleSignInProps {
  googleClientId: string;
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
}

const GoogleSignIn = ({
  googleClientId,
  locale,
  params,
  handleSubmitError,
  onSwitchView,
}: GoogleSignInProps) => {
  const { handleGoogleSignIn } = useSocialSignIn({
    params,
    locale,
    handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      if (googleClientId) {
        (window as any).handleGoogleSignIn = handleGoogleSignIn
        return () => {
          (window as any).handleGoogleSignIn = undefined
        }
      }
    },
    [googleClientId, handleGoogleSignIn],
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
