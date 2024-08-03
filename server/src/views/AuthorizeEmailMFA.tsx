import { html } from 'hono/html'
import FieldError from './components/FieldError'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  requestScript, responseScript, authorizeFormScript,
  validateScript,
  resetErrorScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'

const AuthorizeEmailMFA = ({
  queryDto, logoUrl,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <h1>{localeConfig.AuthorizeEmailMFAPage.Title}</h1>
      <form
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <section class='flex-col gap-2'>
            <input
              class='input'
              type='text'
              id='form-mfa-code'
              name='code'
            />
            <FieldError id='mfa-code-error' />
          </section>
          <div
            id='submit-error'
            class='alert mt-4 hidden'>
          </div>
          <SubmitError />
          <button
            class='button mt-4'
            type='submit'
          >
            {localeConfig.AuthorizeEmailMFAPage.VerifyBtn}
          </button>
        </section>
      </form>
      {html`
        <script>
          ${resetErrorScript.resetMfaCodeError()}
          function handleSubmit(e) {
            ${validateScript.emailMFA()}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-email-mfa', {
                method: 'POST',
                ${requestScript.jsonHeader()}
                body: JSON.stringify({
                  state: "${queryDto.state}",
                  code: "${queryDto.code}",
                  redirectUri: "${queryDto.redirectUri}",
                  mfaCode: document.getElementById('form-mfa-code').value,
                })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              console.log(data)
              ${authorizeFormScript.handleAuthorizeFormRedirect()}
            })
            .catch((error) => {
              ${responseScript.handleError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeEmailMFA
