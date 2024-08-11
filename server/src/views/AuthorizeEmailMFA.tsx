import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  responseScript,
  validateScript,
  resetErrorScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Field from 'views/components/Field'
import SubmitButton from 'views/components/SubmitButton'

const AuthorizeEmailMFA = ({
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
      <h1 class='w-text text-center'>{localeConfig.authorizeEmailMFA.title[queryDto.locale]}</h1>
      <form
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            type='text'
            required={false}
            name='code'
          />
          <SubmitError />
          <SubmitButton
            title={localeConfig.authorizeEmailMFA.verify[queryDto.locale]}
          />
        </section>
      </form>
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          function handleSubmit(e) {
            ${validateScript.verificationCode(queryDto.locale)}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-email-mfa', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  state: "${queryDto.state}",
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                  redirectUri: "${queryDto.redirectUri}",
                  mfaCode: document.getElementById('form-code').value,
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

export default AuthorizeEmailMFA
