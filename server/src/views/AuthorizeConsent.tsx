import { html } from 'hono/html'
import { Scope } from 'shared'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import { scopeModel } from 'models'

const AuthorizeConsent = ({
  queryDto, branding, appName, scopes, locales, redirectUri,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  appName: string;
  scopes: scopeModel.ApiRecord[];
  locales: typeConfig.Locale[];
  redirectUri: string;
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizeConsent.title[queryDto.locale]} />
      <p class='w-text text-center'>{appName} {localeConfig.authorizeConsent.requestAccess[queryDto.locale]}</p>
      <section class='flex-row pl-2 pr-2 w-full'>
        <section class='p-8 border rounded-md w-full'>
          <ul>
            {scopes.map((scope) => {
              if (scope.name === Scope.OpenId || scope.name === Scope.OfflineAccess) return null
              const locale = scope.locales.find((scopeLocale) => scopeLocale.locale === queryDto.locale)
              return (
                <li
                  key={scope}
                  class='w-text p-2'>{locale?.value || scope.name}
                </li>
              )
            })}
          </ul>
        </section>
      </section>
      <SubmitError />
      <section class='mt-4 flex-row gap-8 w-full'>
        <button
          class='button-secondary w-full'
          type='button'
          onclick='handleDecline()'
        >
          {localeConfig.authorizeConsent.decline[queryDto.locale]}
        </button>
        <button
          class='button-secondary w-full'
          type='button'
          onclick='handleAccept()'
        >
          {localeConfig.authorizeConsent.accept[queryDto.locale]}
        </button>
      </section>
      {html`
        <script>
          function handleDecline() {
            window.location.href = "${redirectUri}";
          }
          function handleAccept() {
            fetch('${routeConfig.IdentityRoute.AuthorizeConsent}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                  org: "${queryDto.org}",
                })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale, queryDto.org,
    )}
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
