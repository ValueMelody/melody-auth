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

const AuthorizeMfaEnroll = ({
  queryDto, logoUrl, locales,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      locales={locales}
      logoUrl={logoUrl}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizeMfaEnroll.title[queryDto.locale]} />
      <SubmitError />
      <section class='flex-row justify-around w-full gap-8 mt-4'>
        <button
          class='button w-half'
          type='button'
          onclick='handleSelect("email")'
        >
          {localeConfig.authorizeMfaEnroll.email[queryDto.locale]}
        </button>
        <button
          class='button w-half'
          type='button'
          onclick='handleSelect("otp")'
        >
          {localeConfig.authorizeMfaEnroll.otp[queryDto.locale]}
        </button>
      </section>
      {html`
        <script>
          function handleSelect(type) {
            fetch('${routeConfig.IdentityRoute.AuthorizeMfaEnroll}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
                type
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

export default AuthorizeMfaEnroll
