import { html } from 'hono/html'
import { localeConfig } from 'configs'
import Layout from 'views/components/Layout'
import { oauthDto } from 'dtos'
import AuthorizeCommonFields from 'views/components/AuthorizeCommonFields'
import RequiredSymbol from 'views/components/RequiredSymbol'
import PoweredBy from 'views/components/PoweredBy'

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
    <Layout>
      {html`
        <script>
          function handleSubmit () {
            fetch('/oauth2/authorize-account', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: document.getElementById('form-email').value,
                  password: document.getElementById('form-password').value,
                  firstName: document.getElementById('form-firstName').value,
                  lastName: document.getElementById('form-lastName').value,
                  clientId: document.getElementById('form-clientId').value,
                  redirectUri: document.getElementById('form-redirectUri').value,
                  responseType: document.getElementById('form-responseType').value,
                  state: document.getElementById('form-state').value,
                  codeChallenge: document.getElementById('form-code-challenge').value,
                  codeChallengeMethod: document.getElementById('form-code-challenge-method').value,
                  scope: document.getElementById('form-scope').value.split(','),
                })
            })
            .then((response) => {
              if (!response.ok) {
                return response.text().then(text => {
                  throw new Error(text);
                });
              }
              return response.json();
            })
            .then((data) => {
              var url = data.redirectUri + "?state=" + data.state + "&code=" + data.code;
              window.location.href = url;
              return true
            })
            .catch((error) => {
              console.error("Login failed: " + error)
              return false;
            });
            return false;
          }
        </script>
      `}
      <section class='flex-col items-center gap-4'>
        {!!logoUrl && (
          <img
            class='logo'
            src={logoUrl}
            alt='Logo'
          />
        )}
        <h1>{localeConfig.AuthorizeAccountPage.Title}</h1>
        <form
          autocomplete='on'
          onsubmit='return handleSubmit()'
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
                  </section>
                </section>
              </>
            )}
            <button
              class='button mt-4'
              type='submit'
            >
              {localeConfig.AuthorizeAccountPage.SignUpBtn}
            </button>
          </section>
        </form>
        <a
          class='button-text mt-4'
          href={`/oauth2/authorize?${queryString}`}
        >
          {localeConfig.AuthorizeAccountPage.SignInBtn}
        </a>
        <PoweredBy />
      </section>
    </Layout>
  )
}

export default AuthorizeAccount
