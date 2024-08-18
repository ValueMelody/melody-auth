import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import Layout from 'views/components/Layout'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import Field from 'views/components/Field'

const AuthorizeAccount = ({
  queryDto, logoUrl, enableNames, namesIsRequired, queryString, locales,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  logoUrl: string;
  enableNames: boolean;
  namesIsRequired: boolean;
  queryString: string;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      locales={locales}
      logoUrl={logoUrl}
      locale={queryDto.locale}>
      <Title title={localeConfig.authorizeAccount.title[queryDto.locale]} />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            label={localeConfig.authorizeAccount.email[queryDto.locale]}
            type='email'
            required
            name='email'
            autocomplete='email'
          />
          <Field
            label={localeConfig.authorizeAccount.password[queryDto.locale]}
            type='password'
            required
            name='password'
            autocomplete='password'
          />
          <Field
            label={localeConfig.authorizeAccount.confirmPassword[queryDto.locale]}
            type='password'
            required
            name='confirmPassword'
          />
          {enableNames && (
            <section
              id='row-names'
              class='flex-row gap-4'>
              <Field
                label={localeConfig.authorizeAccount.firstName[queryDto.locale]}
                type='text'
                required={namesIsRequired}
                name='firstName'
              />
              <Field
                label={localeConfig.authorizeAccount.lastName[queryDto.locale]}
                type='text'
                required={namesIsRequired}
                name='lastName'
              />
            </section>
          )}
          <SubmitError />
          <SubmitButton
            title={localeConfig.authorizeAccount.signUp[queryDto.locale]}
          />
        </section>
      </form>
      <a
        class='button-text mt-4'
        href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
      >
        {localeConfig.authorizeAccount.signIn[queryDto.locale]}
      </a>
      {html`
        <script>
          ${resetErrorScript.resetEmailError()}
          ${resetErrorScript.resetPasswordError()}
          ${resetErrorScript.resetConfirmPasswordError()}
          ${resetErrorScript.resetFirstNameError()}
          ${resetErrorScript.resetLastNameError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email(queryDto.locale)}
            ${validateScript.password(queryDto.locale)}
            ${validateScript.confirmPassword(queryDto.locale)}
            ${enableNames && namesIsRequired ? validateScript.firstName(queryDto.locale) : ''}
            ${enableNames && namesIsRequired ? validateScript.lastName(queryDto.locale) : ''}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-account', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  firstName: document.getElementById('form-firstName') ? document.getElementById('form-firstName').value : undefined,
                  lastName: document.getElementById('form-lastName') ? document.getElementById('form-lastName').value : undefined,
                  email: document.getElementById('form-email').value,
                  password: document.getElementById('form-password').value,
                  ${requestScript.parseAuthorizeBaseValues(queryDto)}
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

export default AuthorizeAccount
