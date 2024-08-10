import { html } from 'hono/html'
import SubmitButton from './components/SubmitButton'
import {
  localeConfig,
  routeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import Field from 'views/components/Field'
import SubmitError from 'views/components/SubmitError'

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
        class='hidden'
      >
        <p class='text-green text-semibold'>{localeConfig.verifyEmail.success.en}</p>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.verifyEmail.title.en} />
        <p class='mb-4'>{localeConfig.verifyEmail.desc.en}</p>
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <Field
              type='text'
              required={false}
              name='code'
            />
            <SubmitError />
            <SubmitButton
              title={localeConfig.verifyEmail.verify.en}
            />
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
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
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
              ${responseScript.handleSubmitError()}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default VerifyEmail
