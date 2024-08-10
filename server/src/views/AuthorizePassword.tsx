import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { oauthDto } from 'dtos'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import Field from 'views/components/Field'

const AuthorizePassword = ({
  queryDto, logoUrl, enableSignUp, enablePasswordReset, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  logoUrl: string;
  enableSignUp: boolean;
  enablePasswordReset: boolean;
  queryString: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <Title title={localeConfig.authorizePassword.title.en} />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            label={localeConfig.authorizePassword.email.en}
            type='email'
            required
            name='email'
            autocomplete='email'
          />
          <Field
            label={localeConfig.authorizePassword.password.en}
            type='password'
            required
            name='password'
            autocomplete='password'
          />
          <SubmitError />
          <SubmitButton
            title={localeConfig.authorizePassword.submit.en}
          />
        </section>
      </form>
      {(enableSignUp || enablePasswordReset) && (
        <section class='flex-col gap-2 mt-4'>
          {enableSignUp && (
            <a
              class='button-text'
              href={`${routeConfig.InternalRoute.Identity}/authorize-account?${queryString}`}
            >
              {localeConfig.authorizePassword.signUp.en}
            </a>
          )}
          {enablePasswordReset && (
            <a
              class='button-text'
              href={`${routeConfig.InternalRoute.Identity}/authorize-reset?${queryString}`}
            >
              {localeConfig.authorizePassword.passwordReset.en}
            </a>
          )}
        </section>
      )}
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetPasswordError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email()}
            ${validateScript.password()}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-password', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ${requestScript.parseAuthorizeFieldValues(queryDto)}
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

export default AuthorizePassword
