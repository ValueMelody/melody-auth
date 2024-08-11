import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
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
  queryDto, logoUrl, enableSignUp, enablePasswordReset, queryString, locales,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  logoUrl: string;
  enableSignUp: boolean;
  enablePasswordReset: boolean;
  queryString: string;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      locales={locales}
      logoUrl={logoUrl}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizePassword.title[queryDto.locale]} />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            label={localeConfig.authorizePassword.email[queryDto.locale]}
            type='email'
            required
            name='email'
            autocomplete='email'
          />
          <Field
            label={localeConfig.authorizePassword.password[queryDto.locale]}
            type='password'
            required
            name='password'
            autocomplete='password'
          />
          <SubmitError />
          <SubmitButton
            title={localeConfig.authorizePassword.submit[queryDto.locale]}
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
              {localeConfig.authorizePassword.signUp[queryDto.locale]}
            </a>
          )}
          {enablePasswordReset && (
            <a
              class='button-text'
              href={`${routeConfig.InternalRoute.Identity}/authorize-reset?${queryString}`}
            >
              {localeConfig.authorizePassword.passwordReset[queryDto.locale]}
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
            ${validateScript.email(queryDto.locale)}
            ${validateScript.password(queryDto.locale)}
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

export default AuthorizePassword
