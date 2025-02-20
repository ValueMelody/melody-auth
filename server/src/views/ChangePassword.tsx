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
import { identityDto } from 'dtos'
import SubmitButton from 'views/components/SubmitButton'
import PasswordField from 'views/components/PasswordField'

const ChangePassword = ({
  branding, queryDto, locales, redirectUri,
}: {
  branding: Branding;
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  locales: typeConfig.Locale[];
  redirectUri: string;
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
        <p class='text-green text-semibold'>{localeConfig.changePassword.success[queryDto.locale]}</p>
        <a
          class='button-secondary'
          href={`${redirectUri}`}
        >
          {localeConfig.changePassword.redirect[queryDto.locale]}
        </a>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.changePassword.title[queryDto.locale]} />
        <SubmitError />
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <PasswordField
              label={localeConfig.changePassword.newPassword[queryDto.locale]}
              required
              name='password'
            />
            <PasswordField
              label={localeConfig.changePassword.confirmNewPassword[queryDto.locale]}
              required
              name='confirmPassword'
            />
            <SubmitButton
              title={localeConfig.changePassword.confirm[queryDto.locale]}
            />
          </section>
        </form>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetPasswordError()}
          ${resetErrorScript.resetConfirmPasswordError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.password(queryDto.locale)}
            ${validateScript.confirmPassword(queryDto.locale)}
            fetch('${routeConfig.IdentityRoute.ChangePassword}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
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
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default ChangePassword
