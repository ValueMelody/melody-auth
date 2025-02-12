import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { responseScript } from 'views/scripts'
import Title from 'views/components/Title'
import Field from 'views/components/Field'
import { identityDto } from 'dtos'
import SubmitButton from 'views/components/SubmitButton'

const UpdateInfo = ({
  branding, queryDto, locales, redirectUri, firstName, lastName,
}: {
  branding: Branding;
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  locales: typeConfig.Locale[];
  redirectUri: string;
  firstName: string;
  lastName: string;
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
        <p class='text-green text-semibold'>{localeConfig.updateInfo.success[queryDto.locale]}</p>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.updateInfo.title[queryDto.locale]} />
        <SubmitError />
        <form
          onsubmit='return handleSubmit(event)'
        >
          <section class='flex-col gap-4'>
            <Field
              label={localeConfig.updateInfo.firstName[queryDto.locale]}
              type='text'
              required
              name='firstName'
              value={firstName}
            />
            <Field
              label={localeConfig.updateInfo.lastName[queryDto.locale]}
              type='text'
              required
              name='lastName'
              value={lastName}
            />
            <SubmitButton
              title={localeConfig.updateInfo.confirm[queryDto.locale]}
            />
            <a
              class='button-secondary mt-8'
              href={`${redirectUri}`}
            >
              {localeConfig.updateInfo.redirect[queryDto.locale]}
            </a>
          </section>
        </form>
      </section>
      {html`
        <script>
          var firstNameEl = document.getElementById('form-firstName');
          firstNameEl.addEventListener('input', function () {
            document.getElementById('success-message').classList.add('hidden');
          });
          var lastNameEl = document.getElementById('form-lastName');
          lastNameEl.addEventListener('input', function () {
            document.getElementById('success-message').classList.add('hidden');
          });
          function handleSubmit (e) {
            e.preventDefault();
            fetch('${routeConfig.IdentityRoute.UpdateInfo}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
                firstName: document.getElementById('form-firstName').value,
                lastName: document.getElementById('form-lastName').value,
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
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

export default UpdateInfo
