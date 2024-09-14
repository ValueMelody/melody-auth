import { html } from 'hono/html'
import { Scope } from 'shared'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import { scopeModel } from 'models'

const AuthorizeConsent = ({
  queryDto, logoUrl, appName, scopes, locales,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
  appName: string;
  scopes: scopeModel.ApiRecord[];
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
                  redirectUri: "${queryDto.redirectUri}",
                  locale: "${queryDto.locale}",
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
