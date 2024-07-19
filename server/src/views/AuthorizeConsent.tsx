import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  requestScript, responseScript, authorizeFormScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'

const AuthorizeConsent = ({
  queryDto, logoUrl, appName, scopes,
}: {
  queryDto: identityDto.GetAuthorizeConsentReqQueryDto;
  logoUrl: string;
  appName: string;
  scopes: string[];
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      {html`
        <script>
          function handleDecline() {
            window.location.href = "${queryDto.redirectUri}";
          }
          function handleAccept() {
            fetch('${routeConfig.InternalRoute.Identity}/authorize-consent', {
                method: 'POST',
                ${requestScript.jsonHeader()}
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
              ${authorizeFormScript.handleAuthorizeFormRedirect()}
            })
            .catch((error) => {
              ${responseScript.handleError()}
            });
            return false;
          }
        </script>
      `}
      <h1>{localeConfig.AuthorizeConsentPage.Title}</h1>
      <p>{appName} {localeConfig.AuthorizeConsentPage.RequestAccess}</p>
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
          {localeConfig.AuthorizeConsentPage.DeclineBtn}
        </button>
        <button
          class='button-outline w-full'
          type='button'
          onclick='handleAccept()'
        >
          {localeConfig.AuthorizeConsentPage.AcceptBtn}
        </button>
      </section>
    </Layout>
  )
}

export default AuthorizeConsent
