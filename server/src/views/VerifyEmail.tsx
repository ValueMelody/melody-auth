import { html } from 'hono/html'
import {
  localeConfig,
  routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import FieldError from 'views/components/FieldError'
import {
  requestScript, resetErrorScript, responseScript, validateScript,
} from 'views/scripts'

const VerifyEmail = ({
  queryDto, logoUrl,
}: {
  queryDto: identityDto.GetVerifyEmailReqDto;
  logoUrl: string;
}) => {
  return (
    <Layout logoUrl={logoUrl}>
      <section
        id='success-message'
        class='hidden'>
        <p class='text-green text-semibold'>{localeConfig.VerifyEmailPage.Success}</p>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'>
        <h1>{localeConfig.VerifyEmailPage.Title}</h1>
        <p class='mb-4'>{localeConfig.VerifyEmailPage.Desc}</p>
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <section class='flex-col gap-2'>
              <input
                class='input'
                type='text'
                id='form-code'
                name='code'
              />
              <FieldError id='code-error' />
            </section>
            <div
              id='submit-error'
              class='alert mt-4 hidden'>
            </div>
            <button
              class='button mt-4'
              type='submit'
            >
              {localeConfig.VerifyEmailPage.VerifyBtn}
            </button>
          </section>
        </form>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.verificationCode()}
            fetch('${routeConfig.InternalRoute.Identity}/verify-email', {
                method: 'POST',
                ${requestScript.jsonHeader()}
                body: JSON.stringify({
                  code: document.getElementById('form-code').value,
                  id: '${queryDto.id}',
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
              ${responseScript.handleVerifyEmailFormError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default VerifyEmail
