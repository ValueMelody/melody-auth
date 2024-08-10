import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import {
  resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import Field from 'views/components/Field'

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
        <p class='text-green text-semibold'>{localeConfig.authorizeReset.success.en}</p>
        <a
          class='button-text'
          href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
        >
          {localeConfig.authorizeReset.signIn.en}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.authorizeReset.title.en} />
        <p class='mb-4'>{localeConfig.authorizeReset.desc.en}</p>
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <Field
              label={localeConfig.authorizeReset.email.en}
              type='email'
              required
              name='email'
            />
            <Field
              label={localeConfig.authorizeReset.code.en}
              type='text'
              required
              name='code'
              className='hidden'
            />
            <Field
              label={localeConfig.authorizeReset.password.en}
              type='password'
              required
              name='password'
              className='hidden'
            />
            <Field
              label={localeConfig.authorizeReset.confirmPassword.en}
              type='password'
              required
              name='confirmPassword'
              className='hidden'
            />
            <SubmitError />
            <button
              id='submit-btn'
              class='button mt-4'
              type='submit'
            >
              {localeConfig.authorizeReset.send.en}
            </button>
          </section>
        </form>
        <a
          class='button-text mt-4'
          href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
        >
          {localeConfig.authorizeReset.backSignIn.en}
        </a>
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
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
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
                document.getElementById('submit-btn').innerHTML = '${localeConfig.authorizeReset.reset.en}'
              })
              .catch((error) => {
                ${responseScript.handleSubmitError()}
              });
            } else {
             fetch('${routeConfig.InternalRoute.Identity}/authorize-reset', {
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
                ${responseScript.handleSubmitError()}
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
