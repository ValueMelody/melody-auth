import { typeConfig } from 'configs'
import {
  useSocialSignIn, View,
} from 'pages/hooks'
import { AuthorizeParams } from 'pages/tools/param'
import { signIn } from 'pages/tools/locale'

export interface GithubSignInProps {
  githubClientId: string;
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  onSwitchView: (view: View) => void;
}

const GithubSignIn = ({
  githubClientId,
  locale,
  params,
  onSwitchView,
  handleSubmitError,
}: GithubSignInProps) => {
  const { githubSignInState } = useSocialSignIn({
    params,
    locale,
    handleSubmitError,
    onSwitchView,
  })

  if (!githubClientId) return null

  return (
    <div className='flex flex-row justify-center'>
      <a
        id='github-login-btn'
        className='flex flex-row items-center justify-center'
        style={{
          width: 240,
          height: 40,
          backgroundColor: '#24292e',
          padding: '0 8px',
          gap: 8,
          color: 'white',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
        href={`https://github.com/login/oauth/authorize?client_id=${githubClientId}&state=${JSON.stringify(githubSignInState)}`}
      >
        <img
          style={{
            width: 20, height: 20, marginRight: 10,
          }}
          src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          alt='GitHub logo' />
        {signIn.githubSignIn[locale]}
      </a>
    </div>
  )
}

export default GithubSignIn
