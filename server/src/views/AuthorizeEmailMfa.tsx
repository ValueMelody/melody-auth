import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  responseScript,
  validateScript,
  resetErrorScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import SubmitButton from 'views/components/SubmitButton'
import CodeInput from 'views/components/CodeInput'

const AuthorizeEmailMfa = ({
  queryDto, branding, locales, error,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
  error?: { en: string; fr: string };
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      {!error && (
        <h1 class='w-text text-center'>{localeConfig.authorizeEmailMfa.title[queryDto.locale]}</h1>
      )}
      <SubmitError />
      {error && <SubmitError
        show
        message={error[queryDto.locale]} />}
      {!error && (
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <CodeInput
              type='text'
              required={false}
              name='code'
              label={localeConfig.authorizeEmailMfa.code[queryDto.locale]}
            />
            <button
              id='resend-btn'
              type='button'
              class='button-secondary'
              onclick='resendCode()'
            >
              {localeConfig.authorizeEmailMfa.resend[queryDto.locale]}
            </button>
            <SubmitButton
              title={localeConfig.authorizeEmailMfa.verify[queryDto.locale]}
            />
          </section>
        </form>
      )}
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          function resendCode() {
            fetch('${routeConfig.IdentityRoute.ResendEmailMfa}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
              })
            })
            .then((response) => {
              if (response.ok) {
                var resendBtn = document.getElementById("resend-btn")
                resendBtn.disabled = true;
                resendBtn.innerHTML = "${localeConfig.authorizeEmailMfa.resent[queryDto.locale]}"
              } else {
                return response.text().then(text => {
                  throw new Error(text);
                });
              }
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
          }
          function handleSubmit(e) {
            e.preventDefault();
            ${validateScript.verificationCode(queryDto.locale)}
            fetch('${routeConfig.IdentityRoute.AuthorizeEmailMfa}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
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

export default AuthorizeEmailMfa
