import { localeConfig } from "configs";
import { GetAuthorizeReqQueryDto } from "dtos/request"
import Layout from "views/components/Layout";
import { html } from 'hono/html'

const Authorize = ({
  queryDto
}: {
  queryDto: GetAuthorizeReqQueryDto;
}) => {
  return (
    <Layout>
      {html`
        <script>
          function handleSubmit () {
            fetch('/oauth2/authorize', {
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
      <form id="login-form" onsubmit="return handleSubmit()">
        <section class="flex-col gap-4">
          <section class="flex-col gap-2">
            <label class="label" for="email">{localeConfig.AuthorizePage.EmailLabel}</label>
            <input class="input" type="email" id="form-email" name="email" />
          </section>
          <section class="flex-col gap-2">
            <label class="label" for="password">{localeConfig.AuthorizePage.PasswordLabel}</label>
            <input class="input" type="password" id="form-password" name="password" />
          </section>
          <input type="hidden" id="form-responseType" name="responseType" value={queryDto.responseType} />
          <input type="hidden" id="form-clientId" name="clientId" value={queryDto.clientId} />
          <input type="hidden" id="form-redirectUri" name="redirectUri" value={queryDto.redirectUri} />
          <input type="hidden" id="form-scope" name="scope" value={queryDto.scope} />
          <input type="hidden" id="form-state" name="state" value={queryDto.state} />
          <button class="button rounded-md mt-4" type="submit">
            {localeConfig.AuthorizePage.SubmitBtn}
          </button>
        </section>
      </form>
    </Layout>
  )
}

export default Authorize
