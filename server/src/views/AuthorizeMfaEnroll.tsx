import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import { userModel } from 'models'

const AuthorizeMfaEnroll = ({
  queryDto, branding, locales, mfaTypes,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
  mfaTypes: userModel.MfaType[];
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizeMfaEnroll.title[queryDto.locale]} />
      <SubmitError />
      <section class='flex-col justify-around w-full gap-4 mt-4'>
        {mfaTypes.map((mfaType) => (
          <button
            key={mfaType}
            class='button'
            type='button'
            onclick={`handleSelect("${mfaType}")`}
          >
            {localeConfig.authorizeMfaEnroll[mfaType][queryDto.locale]}
          </button>
        ))}
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
