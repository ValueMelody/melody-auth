import { html } from 'hono/html'
import RequiredSymbol from './components/RequiredSymbol'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import FieldError from 'views/components/FieldError'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'

const AuthorizeReset = ({
  logoUrl, queryString,
}: {
  logoUrl: string;
  queryString: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <section
        id='success-message'
        class='flex-col gap-4 hidden'
      >
        <p class='text-green text-semibold'>{localeConfig.AuthorizeResetPage.Success}</p>
        <a
          class='button-text'
          href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
        >
          {localeConfig.AuthorizeResetPage.SignInBtn}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'>
        <h1>{localeConfig.AuthorizeResetPage.Title}</h1>
        <p class='mb-4'>{localeConfig.AuthorizeResetPage.Desc}</p>
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <section class='flex-col gap-2'>
              <label
                class='label'
                for='email'
              >
                {localeConfig.AuthorizeResetPage.EmailLabel}
                <RequiredSymbol />
              </label>
              <input
                class='input'
                type='email'
                id='form-email'
                name='email'
              />
              <FieldError id='email-error' />
            </section>
            <section
              id='code-row'
              class='flex-col gap-2 hidden'>
              <label
                class='label'
                for='code'
              >
                {localeConfig.AuthorizeResetPage.CodeLabel}
                <RequiredSymbol />
              </label>
              <input
                class='input'
                type='text'
                id='form-code'
                name='code'
              />
              <FieldError id='code-error' />
            </section>
            <section
              id='password-row'
              class='flex-col gap-2 hidden'>
              <label
                class='label'
                for='password'
              >
                {localeConfig.AuthorizeResetPage.PasswordLabel}
                <RequiredSymbol />
              </label>
              <input
                class='input'
                type='password'
                id='form-password'
                name='password'
              />
              <FieldError id='password-error' />
            </section>
            <section
              id='confirmPassword-row'
              class='flex-col gap-2 hidden'>
              <label
                class='label'
                for='confirmPassword'
              >
                {localeConfig.AuthorizeResetPage.ConfirmPasswordLabel}
                <RequiredSymbol />
              </label>
              <input
                class='input'
                type='password'
                id='form-confirmPassword'
                name='confirmPassword'
              />
              <FieldError id='confirmPassword-error' />
            </section>
            <SubmitError />
            <button
              id='submit-btn'
              class='button mt-4'
              type='submit'
            >
              {localeConfig.AuthorizeResetPage.SendBtn}
            </button>
          </section>
        </form>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetCodeError()}
          ${resetErrorScript.resetPasswordError()}
          ${resetErrorScript.resetConfirmPasswordError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email()}
            var containCode = !document.getElementById('code-row').classList.contains('hidden')
            if (containCode) {
              ${validateScript.verificationCode()}
              ${validateScript.password()}
              ${validateScript.confirmPassword()}
            }
            if (!containCode) {
              fetch('${routeConfig.InternalRoute.Identity}/reset-code', {
                method: 'POST',
                ${requestScript.jsonHeader()}
                body: JSON.stringify({
                  email: document.getElementById('form-email').value,
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                document.getElementById('code-row').classList.remove('hidden');
                document.getElementById('password-row').classList.remove('hidden');
                document.getElementById('confirmPassword-row').classList.remove('hidden');
                document.getElementById('submit-btn').innerHTML = '${localeConfig.AuthorizeResetPage.ResetBtn}'
              })
              .catch((error) => {
                ${responseScript.handleError()}
              });
            } else {
             fetch('${routeConfig.InternalRoute.Identity}/authorize-reset', {
                method: 'POST',
                ${requestScript.jsonHeader()}
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
                ${responseScript.handleAuthorizeResetError()}
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
