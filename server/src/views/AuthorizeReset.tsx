import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import {
  resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import Field from 'views/components/Field'
import { oauthDto } from 'dtos'
import SubmitButton from 'views/components/SubmitButton'
import CodeInput from 'views/components/CodeInput'

const AuthorizeReset = ({
  branding, queryString, queryDto, locales,
}: {
  branding: Branding;
  queryString: string;
  queryDto: oauthDto.GetAuthorizeReqDto;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      branding={branding}
      locale={queryDto.locale}
      locales={locales}
    >
      <section
        id='success-message'
        class='flex-col gap-4 hidden'
      >
        <p class='text-green text-semibold'>{localeConfig.authorizeReset.success[queryDto.locale]}</p>
        <a
          class='button-secondary'
          href={`${routeConfig.IdentityRoute.AuthorizePassword}?${queryString}`}
        >
          {localeConfig.authorizeReset.signIn[queryDto.locale]}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.authorizeReset.title[queryDto.locale]} />
        <p class='mb-4 text-center w-text'>{localeConfig.authorizeReset.desc[queryDto.locale]}</p>
        <SubmitError />
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <Field
              label={localeConfig.authorizeReset.email[queryDto.locale]}
              type='email'
              required
              name='email'
            />
            <CodeInput
              label={localeConfig.authorizeReset.code[queryDto.locale]}
              type='text'
              required
              name='code'
              className='hidden'
            />
            <button
              id='resend-btn'
              type='button'
              class='button-secondary hidden'
              onclick='resendCode()'
            >
              {localeConfig.authorizeReset.resend[queryDto.locale]}
            </button>
            <Field
              label={localeConfig.authorizeReset.password[queryDto.locale]}
              type='password'
              required
              name='password'
              className='hidden'
            />
            <Field
              label={localeConfig.authorizeReset.confirmPassword[queryDto.locale]}
              type='password'
              required
              name='confirmPassword'
              className='hidden'
            />
            <SubmitButton
              title={localeConfig.authorizeReset.send[queryDto.locale]}
            />
          </section>
        </form>
        <a
          class='button-secondary'
          href={`${routeConfig.IdentityRoute.AuthorizePassword}?${queryString}`}
        >
          {localeConfig.authorizeReset.backSignIn[queryDto.locale]}
        </a>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetCodeError()}
          ${resetErrorScript.resetPasswordError()}
          ${resetErrorScript.resetConfirmPasswordError()}
          function resendCode() {
            fetch('${routeConfig.IdentityRoute.ResetPasswordCode}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                locale: "${queryDto.locale}",
                email: document.getElementById('form-email').value,
              })
            })
            .then((response) => {
              if (response.ok) {
                var resendBtn = document.getElementById("resend-btn")
                resendBtn.disabled = true;
                resendBtn.innerHTML = "${localeConfig.authorizeReset.resent[queryDto.locale]}"
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
              ${validateScript.password(queryDto.locale)}
              ${validateScript.confirmPassword(queryDto.locale)}
            }
            if (!containCode) {
              fetch('${routeConfig.IdentityRoute.ResetPasswordCode}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  locale: "${queryDto.locale}",
                  email: document.getElementById('form-email').value,
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                document.getElementById('code-row').classList.remove('hidden');
                document.getElementById('resend-btn').classList.remove('hidden');
                document.getElementById('password-row').classList.remove('hidden');
                document.getElementById('confirmPassword-row').classList.remove('hidden');
                document.getElementById('submit-button').innerHTML = '${localeConfig.authorizeReset.reset[queryDto.locale]}'
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            } else {
              fetch('${routeConfig.IdentityRoute.AuthorizeReset}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: document.getElementById('form-email').value,
                  code: document.getElementById('form-code').value,
                  password: document.getElementById('form-password').value,
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

export default AuthorizeReset
