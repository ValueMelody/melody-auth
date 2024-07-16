import { html } from 'hono/html'
import { localeConfig } from 'configs'
import Layout from 'views/components/Layout'
import { oauthDto } from 'dtos'
import AuthorizeCommonFields from 'views/components/AuthorizeCommonFields'
import PoweredBy from 'views/components/PoweredBy'
import { validateEmail } from 'views/scripts/email'
import {
  handleError, handleRedirect, parseCommonFormFields, parseResponse, resetError,
} from 'views/scripts/form'
import { validatePassword } from 'views/scripts/password'

const AuthorizePassword = ({
  queryDto, logoUrl, enableSignUp, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
  logoUrl: string;
  enableSignUp: boolean;
  queryString: string;
}) => {
  return (
    <Layout>
      <section class='flex-col items-center gap-4'>
        {!!logoUrl && (
          <img
            class='logo'
            src={logoUrl}
            alt='Logo'
          />
        )}
        <h1>{localeConfig.AuthorizePasswordPage.Title}</h1>
        <form
          autocomplete='on'
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <AuthorizeCommonFields queryDto={queryDto} />
            <div
              id='submit-error'
              class='alert mt-4 hidden'>
            </div>
            <button
              class='button mt-4'
              type='submit'
            >
              {localeConfig.AuthorizePasswordPage.SubmitBtn}
            </button>
          </section>
        </form>
        {enableSignUp && (
          <a
            class='button-text mt-4'
            href={`/oauth2/authorize-account?${queryString}`}
          >
            {localeConfig.AuthorizePasswordPage.SignUpBtn}
          </a>
        )}
        <PoweredBy />
      </section>
      {html`
        <script>
          ${resetError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateEmail()}
            ${validatePassword()}
            fetch('/oauth2/authorize-password', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  ${parseCommonFormFields()}
                })
            })
            .then((response) => {
              ${parseResponse()}
            })
            .then((data) => {
              ${handleRedirect()}
            })
            .catch((error) => {
              ${handleError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizePassword
