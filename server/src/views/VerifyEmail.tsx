import { html } from 'hono/html'
import SubmitButton from './components/SubmitButton'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  resetErrorScript, responseScript, validateScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import SubmitError from 'views/components/SubmitError'
import CodeInput from 'views/components/CodeInput'

const VerifyEmail = ({
  queryDto, branding, locales,
}: {
  queryDto: identityDto.GetVerifyEmailReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
}) => {
  return (
    <Layout
      branding={branding}
      locale={queryDto.locale}
      locales={locales}
    >
      <section
        id='success-message'
        class='hidden'
      >
        <p class='text-green text-semibold w-text text-center'>{localeConfig.verifyEmail.success[queryDto.locale]}</p>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.verifyEmail.title[queryDto.locale]} />
        <p class='mb-2 w-text text-center'>{localeConfig.verifyEmail.desc[queryDto.locale]}</p>
        <SubmitError />
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-2'>
            <CodeInput
              type='text'
              required={false}
              name='code'
            />
            <SubmitButton
              title={localeConfig.verifyEmail.verify[queryDto.locale]}
            />
          </section>
        </form>
      </section>
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          function handleSubmit (e) {
            e.preventDefault();
            ${validateScript.verificationCode(queryDto.locale)}
            fetch('${routeConfig.IdentityRoute.VerifyEmail}', {
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
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default VerifyEmail
