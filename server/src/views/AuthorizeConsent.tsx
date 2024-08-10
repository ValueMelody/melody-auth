import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'

const AuthorizeConsent = ({
  queryDto, logoUrl, appName, scopes,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
  appName: string;
  scopes: string[];
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <Title title={localeConfig.authorizeConsent.title.en} />
      <p>{appName} {localeConfig.authorizeConsent.requestAccess.en}</p>
      <section class='p-8 border rounded-md w-full'>
        <ul>
          {scopes.map((scope) => {
            if (scope === 'openid' || scope === 'offline_access') return null
            return <li key={scope}>{scope}</li>
          })}
        </ul>
      </section>
      <SubmitError />
      <section class='mt-8 flex-row gap-8 w-full'>
        <button
          class='button-outline w-full'
          type='button'
          onclick='handleDecline()'
        >
          {localeConfig.authorizeConsent.decline.en}
        </button>
        <button
          class='button-outline w-full'
          type='button'
          onclick='handleAccept()'
        >
          {localeConfig.authorizeConsent.accept.fr}
        </button>
      </section>
      {html`
        <script>
          function handleDecline() {
            window.location.href = "${queryDto.redirectUri}";
          }
          function handleAccept() {
            fetch('${routeConfig.InternalRoute.Identity}/authorize-consent', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  state: "${queryDto.state}",
                  code: "${queryDto.code}",
                  redirectUri: "${queryDto.redirectUri}"
                })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect()}
            })
            .catch((error) => {
              ${responseScript.handleSubmitError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeConsent
