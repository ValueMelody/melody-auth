import { html } from 'hono/html'
import FieldError from 'views/components/FieldError'
import {
  localeConfig, routeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import Layout from 'views/components/Layout'
import AuthorizeCommonFields from 'views/components/AuthorizeCommonFields'
import RequiredSymbol from 'views/components/RequiredSymbol'
import {
  authorizeFormScript, requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'

const AuthorizeAccount = ({
  queryDto, logoUrl, enableNames, namesIsRequired, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
  logoUrl: string;
  enableNames: boolean;
  namesIsRequired: boolean;
  queryString: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <h1>{localeConfig.AuthorizeAccountPage.Title}</h1>
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <AuthorizeCommonFields queryDto={queryDto} />
          <section class='flex-col gap-2'>
            <label
              class='label'
              for='confirmPassword'
            >
              {localeConfig.AuthorizeAccountPage.ConfirmPasswordLabel}
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
          {enableNames && (
            <>
              <section class='flex-row gap-4'>
                <section class='flex-col gap-2'>
                  <label
                    class='label'
                    for='firstName'
                  >
                    {localeConfig.AuthorizeAccountPage.FirstNameLabel}
                    {namesIsRequired && <RequiredSymbol />}
                  </label>
                  <input
                    class='input'
                    type='text'
                    id='form-firstName'
                    name='firstName'
                  />
                  <FieldError id='firstName-error' />
                </section>
                <section class='flex-col gap-2'>
                  <label
                    class='label'
                    for='lastName'
                  >
                    {localeConfig.AuthorizeAccountPage.LastNameLabel}
                    {namesIsRequired && <RequiredSymbol />}
                  </label>
                  <input
                    class='input'
                    type='text'
                    id='form-lastName'
                    name='lastName'
                  />
                  <FieldError id='lastName-error' />
                </section>
              </section>
            </>
          )}
          <SubmitError />
          <SubmitButton
            title={localeConfig.AuthorizeAccountPage.SignUpBtn}
          />
        </section>
      </form>
      <a
        class='button-text mt-4'
        href={`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`}
      >
        {localeConfig.AuthorizeAccountPage.SignInBtn}
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
                ${requestScript.jsonHeader()}
                body: JSON.stringify({
                  firstName: document.getElementById('form-firstName').value,
                  lastName: document.getElementById('form-lastName').value,
                  ${requestScript.parseAuthorizeFieldValues(queryDto)}
                })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${authorizeFormScript.handleAuthorizeFormRedirect()}
            })
            .catch((error) => {
              ${authorizeFormScript.handleAuthorizeFormError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeAccount
