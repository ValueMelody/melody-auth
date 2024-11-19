import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import {
  resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import Field from 'views/components/Field'
import { identityDto } from 'dtos'
import SubmitButton from 'views/components/SubmitButton'

const ChangeEmail = ({
  logoUrl, queryDto, locales, redirectUri,
}: {
  logoUrl: string;
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  locales: typeConfig.Locale[];
  redirectUri: string;
}) => {
  return (
    <Layout
      logoUrl={logoUrl}
      locale={queryDto.locale}
      locales={locales}
    >
      <section
        id='success-message'
        class='flex-col gap-4 hidden'
      >
        <p class='text-green text-semibold'>{localeConfig.changePassword.success[queryDto.locale]}</p>
        <a
          class='button-text'
          href={`${redirectUri}`}
        >
          {localeConfig.changeEmail.redirect[queryDto.locale]}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.changeEmail.title[queryDto.locale]} />
        <SubmitError />
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <Field
              label={localeConfig.changeEmail.email[queryDto.locale]}
              type='email'
              required
              name='email'
            />
            <Field
              label={localeConfig.changeEmail.code[queryDto.locale]}
              type='text'
              required
              name='code'
              className='hidden'
            />
            <button
              id='resend-btn'
              type='button'
              class='button-text hidden'
              onclick='resendCode()'
            >
              {localeConfig.changeEmail.resend[queryDto.locale]}
            </button>
            <SubmitButton
              title={localeConfig.changeEmail.sendCode[queryDto.locale]}
            />
          </section>
        </form>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetCodeError()}
          function resendCode() {
            fetch('${routeConfig.IdentityRoute.ChangeEmailCode}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                locale: "${queryDto.locale}",
                email: document.getElementById('form-email').value,
                code: "${queryDto.code}",
              })
            })
            .then((response) => {
              if (response.ok) {
                var resendBtn = document.getElementById("resend-btn")
                resendBtn.disabled = true;
                resendBtn.innerHTML = "${localeConfig.changeEmail.resent[queryDto.locale]}"
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
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email(queryDto.locale)}
            var containCode = !document.getElementById('code-row').classList.contains('hidden')
            if (containCode) {
              ${validateScript.verificationCode(queryDto.locale)}
            }
            e.preventDefault();
            if (!containCode) {
              fetch('${routeConfig.IdentityRoute.ChangeEmailCode}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  locale: "${queryDto.locale}",
                  email: document.getElementById('form-email').value,
                  code: "${queryDto.code}",
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                document.getElementById('code-row').classList.remove('hidden');
                document.getElementById('submit-button').innerHTML = '${localeConfig.changeEmail.confirm[queryDto.locale]}'
                document.getElementById('resend-btn').classList.remove('hidden');
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            } else {
              fetch('${routeConfig.IdentityRoute.ChangeEmail}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: document.getElementById('form-email').value,
                  verificationCode: document.getElementById('form-code').value,
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                document.getElementById('submit-form').classList.add('hidden');
                document.getElementById('success-message').classList.remove('hidden');
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            }
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default ChangeEmail
