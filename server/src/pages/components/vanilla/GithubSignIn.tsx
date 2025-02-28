import {
  localeConfig, typeConfig,
} from 'configs'
import { InitialProps } from 'pages/hooks'

export interface GithubSignInProps {
  githubClientId: string;
  locale: typeConfig.Locale;
  initialProps: InitialProps;
}

const GithubSignIn = ({
  githubClientId,
  locale,
  initialProps,
}: GithubSignInProps) => {
  if (!githubClientId) return null

  return (
    <div class='flex flex-row justify-center'>
      <a
        id='github-login-btn'
        class='flex flex-row items-center justify-center'
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
        href={`https://github.com/login/oauth/authorize?client_id=${githubClientId}&state=${JSON.stringify({
          clientId: initialProps.clientId,
          redirectUri: initialProps.redirectUri,
          responseType: initialProps.responseType,
          state: initialProps.state,
          codeChallenge: initialProps.codeChallenge,
          codeChallengeMethod: initialProps.codeChallengeMethod,
          locale,
          policy: initialProps.policy,
          org: initialProps.org,
          scopes: initialProps.scope.split(' '),
        })}`}
      >
        <img
          style={{
            width: 20, height: 20, marginRight: 10,
          }}
          src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
          alt='GitHub logo' />
        {localeConfig.authorizePassword.githubSignIn[locale]}
      </a>
    </div>
  )
}

export default GithubSignIn
