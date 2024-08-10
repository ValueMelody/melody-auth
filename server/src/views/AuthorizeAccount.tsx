import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
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
  queryDto, logoUrl, enableNames, namesIsRequired, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  logoUrl: string;
  enableNames: boolean;
  namesIsRequired: boolean;
  queryString: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <Title title={localeConfig.authorizeAccount.title.en} />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            label={localeConfig.authorizeAccount.email.en}
            type='email'
            required
            name='email'
            autocomplete='email'
          />
          <Field
            label={localeConfig.authorizeAccount.password.en}
            type='password'
            required
            name='password'
            autocomplete='password'
          />
          <Field
            label={localeConfig.authorizeAccount.confirmPassword.en}
            type='password'
            required
            name='confirmPassword'
          />
          {enableNames && (
            <section class='flex-row gap-4'>
              <Field
                label={localeConfig.authorizeAccount.firstName.en}
                type='text'
                required={namesIsRequired}
                name='firstName'
              />
              <Field
                label={localeConfig.authorizeAccount.lastName.en}
                type='text'
                required={namesIsRequired}
                name='lastName'
              />
            </section>
          )}
          <SubmitError />
          <SubmitButton
            title={localeConfig.authorizeAccount.signUp.en}
          />
        </section>
      </form>
      <a
        class='button-text mt-4'
        href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
      >
        {localeConfig.authorizeAccount.signIn.en}
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
            ${validateScript.email()}
            ${validateScript.password()}
            ${validateScript.confirmPassword()}
            ${enableNames && namesIsRequired ? validateScript.firstName() : ''}
            ${enableNames && namesIsRequired ? validateScript.lastName() : ''}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-account', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  firstName: document.getElementById('form-firstName') ? document.getElementById('form-firstName').value : undefined,
                  lastName: document.getElementById('form-lastName') ? document.getElementById('form-lastName').value : undefined,
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

export default AuthorizeAccount
