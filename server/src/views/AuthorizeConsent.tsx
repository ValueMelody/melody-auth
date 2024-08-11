import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'

const AuthorizeConsent = ({
  queryDto, logoUrl, appName, scopes, locales,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
  appName: string;
  scopes: string[];
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      locales={locales}
      logoUrl={logoUrl}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizeConsent.title[queryDto.locale]} />
      <p class='w-text text-center'>{appName} {localeConfig.authorizeConsent.requestAccess[queryDto.locale]}</p>
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
          {localeConfig.authorizeConsent.decline[queryDto.locale]}
        </button>
        <button
          class='button-outline w-full'
          type='button'
          onclick='handleAccept()'
        >
          {localeConfig.authorizeConsent.accept[queryDto.locale]}
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
              ${responseScript.handleAuthorizeFormRedirect(queryDto.locale)}
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeConsent
