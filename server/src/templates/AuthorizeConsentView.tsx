import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'templates/components/Layout'
import { identityDto } from 'dtos'
import PoweredBy from 'templates/components/PoweredBy'
import {
  handleError, handleRedirect, parseResponse,
} from 'templates/scripts/form'

const AuthorizeConsent = ({
  queryDto, logoUrl, appName, scopes,
}: {
  queryDto: identityDto.GetAuthorizeConsentReqQueryDto;
  logoUrl: string;
  appName: string;
  scopes: string[];
}) => {
  return (
    <Layout>
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
              ${parseResponse()}
            })
            .then((data) => {
              ${handleRedirect()}
            })
            .catch((error) => {
              ${handleError()}
            });
            return false;
          }
        </script>
      `}
      <section class='flex-col items-center gap-4'>
        {!!logoUrl && (
          <img
            class='logo'
            src={logoUrl}
            alt='Logo'
          />
        )}
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
        <section class='w-full'>
          <div
            id='submit-error'
            class='alert mt-4 hidden'>
          </div>
        </section>
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
        <PoweredBy />
      </section>
    </Layout>
  )
}

export default AuthorizeConsent
