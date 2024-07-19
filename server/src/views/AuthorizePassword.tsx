import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { oauthDto } from 'dtos'
import AuthorizeCommonFields from 'views/components/AuthorizeCommonFields'
import {
  authorizeFormScript, requestScript, responseScript, validateScript,
} from 'views/scripts'
import SubmitButton from 'views/components/SubmitButton'
import SubmitError from 'views/components/SubmitError'

const AuthorizePassword = ({
  queryDto, logoUrl, enableSignUp, queryString,
}: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
  logoUrl: string;
  enableSignUp: boolean;
  queryString: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <h1>{localeConfig.AuthorizePasswordPage.Title}</h1>
      <form
        autocomplete='on'
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <AuthorizeCommonFields queryDto={queryDto} />
          <SubmitError />
          <SubmitButton
            title={localeConfig.AuthorizePasswordPage.SubmitBtn}
          />
        </section>
      </form>
      {enableSignUp && (
        <a
          class='button-text mt-4'
          href={`${routeConfig.InternalRoute.Identity}/authorize-account?${queryString}`}
        >
          {localeConfig.AuthorizePasswordPage.SignUpBtn}
        </a>
      )}
      {html`
        <script>
          ${authorizeFormScript.resetAuthorizeFormError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.email()}
            ${validateScript.password()}
            fetch('${routeConfig.InternalRoute.Identity}/authorize-password', {
                method: 'POST',
                ${requestScript.jsonHeader()}
                body: JSON.stringify({
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

export default AuthorizePassword
