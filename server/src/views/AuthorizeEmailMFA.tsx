import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
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
  queryDto, logoUrl,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <h1>{localeConfig.authorizeEmailMFA.title.en}</h1>
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
            title={localeConfig.authorizeEmailMFA.verify.en}
          />
        </section>
      </form>
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          function handleSubmit(e) {
            ${validateScript.verificationCode()}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-email-mfa', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  state: "${queryDto.state}",
                  code: "${queryDto.code}",
                  redirectUri: "${queryDto.redirectUri}",
                  mfaCode: document.getElementById('form-code').value,
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

export default AuthorizeEmailMFA
