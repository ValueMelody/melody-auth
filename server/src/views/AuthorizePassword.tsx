import { html } from 'hono/html'
import { localeConfig } from 'configs'
import Layout from 'views/components/Layout'
import { oauthDto } from 'dtos'

const AuthorizePassword = ({ queryDto }: {
  queryDto: oauthDto.GetAuthorizeReqQueryDto;
}) => {
  return (
    <Layout>
      {html`
        <script>
          function handleSubmit () {
            fetch('/oauth2/authorize-password', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: document.getElementById('form-email').value,
                  password: document.getElementById('form-password').value,
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
              const body = response.json();
              if (response.ok) return body;
              throw new Error(response.statusText);
            })
            .then((data) => {
              var url = data.redirectUri + "?state=" + data.state + "&code=" + data.code;
              window.location.href = url;
              return false
            })
            .catch((error) => {
              return false;
            });
            return false;
          }
        </script>
      `}
      <form
        id='password-signin-form'
        onsubmit='return handleSubmit()'
      >
        <section class='flex-col gap-4'>
          <section class='flex-col gap-2'>
            <label
              class='label'
              for='email'
            >{localeConfig.AuthorizePasswordPage.EmailLabel}
            </label>
            <input
              class='input'
              type='email'
              id='form-email'
              name='email'
            />
          </section>
          <section class='flex-col gap-2'>
            <label
              class='label'
              for='password'
            >{localeConfig.AuthorizePasswordPage.PasswordLabel}
            </label>
            <input
              class='input'
              type='password'
              id='form-password'
              name='password'
            />
          </section>
          <input
            type='hidden'
            id='form-responseType'
            name='responseType'
            value={queryDto.responseType}
          />
          <input
            type='hidden'
            id='form-clientId'
            name='clientId'
            value={queryDto.clientId}
          />
          <input
            type='hidden'
            id='form-redirectUri'
            name='redirectUri'
            value={queryDto.redirectUri}
          />
          <input
            type='hidden'
            id='form-scope'
            name='scope'
            value={queryDto.scope}
          />
          <input
            type='hidden'
            id='form-state'
            name='state'
            value={queryDto.state}
          />
          <input
            type='hidden'
            id='form-code-challenge'
            name='codeChallenge'
            value={queryDto.codeChallenge}
          />
          <input
            type='hidden'
            id='form-code-challenge-method'
            name='codeChallengeMethod'
            value={queryDto.codeChallengeMethod}
          />
          <button
            class='button rounded-md mt-4'
            type='submit'
          >
            {localeConfig.AuthorizePasswordPage.SubmitBtn}
          </button>
        </section>
      </form>
    </Layout>
  )
}

export default AuthorizePassword
