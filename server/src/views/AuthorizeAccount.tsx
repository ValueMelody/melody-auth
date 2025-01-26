import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import Layout, { Branding } from 'views/components/Layout'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'
import Field from 'views/components/Field'

const AuthorizeAccount = ({
  queryDto,
  branding,
  enableNames,
  namesIsRequired,
  queryString,
  locales,
}: {
  queryDto: oauthDto.GetAuthorizeReqDto;
  branding: Branding;
  enableNames: boolean;
  namesIsRequired: boolean;
  queryString: string;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      <Title title={localeConfig.authorizeAccount.title[queryDto.locale]} />
      <SubmitError />
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-2'>
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
            <>
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
            </>
          )}
          <SubmitButton
            title={localeConfig.authorizeAccount.signUp[queryDto.locale]}
          />
          {(branding.termsLink || branding.privacyPolicyLink) && (
            <div class='text-center text-gray'>
              <p class='flex flex-row items-center justify-start flex-wrap w-text'>
                {localeConfig.authorizeAccount.bySignUp[queryDto.locale]}&nbsp;
                {branding.termsLink && (
                  <a
                    target='_blank'
                    href={branding.termsLink}
                    rel='noreferrer'
                  >
                    {localeConfig.authorizeAccount.terms[queryDto.locale]}
                  </a>
                )}
                {branding.termsLink && branding.privacyPolicyLink && (
                  <>
                    &nbsp;{localeConfig.authorizeAccount.linkConnect[queryDto.locale]}&nbsp;
                  </>
                )}
                {branding.privacyPolicyLink && (
                  <a
                    target='_blank'
                    href={branding.privacyPolicyLink}
                    rel='noreferrer'
                  >
                    {localeConfig.authorizeAccount.privacyPolicy[queryDto.locale]}
                  </a>
                )}
              </p>
            </div>
          )}
        </section>
      </form>
      <a
        class='button-secondary'
        href={`${routeConfig.IdentityRoute.AuthorizePassword}?${queryString}`}
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
            fetch('${routeConfig.IdentityRoute.AuthorizeAccount}', {
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
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale,
      queryDto.org,
    )}
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
