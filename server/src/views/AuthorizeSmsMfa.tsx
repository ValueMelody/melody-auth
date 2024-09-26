import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  responseScript,
  validateScript,
  resetErrorScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Field from 'views/components/Field'
import SubmitButton from 'views/components/SubmitButton'

const AuthorizeSmsMfa = ({
  queryDto, logoUrl, locales, phoneNumber,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  logoUrl: string;
  locales: typeConfig.Locale[];
  phoneNumber: string | null;
}) => {
  return (
    <Layout
      locales={locales}
      logoUrl={logoUrl}
      locale={queryDto.locale}
    >
      <h1 class='w-text text-center'>{localeConfig.authorizeSmsMfa.title[queryDto.locale]}</h1>
      <SubmitError />
      <form
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <Field
            label={localeConfig.authorizeSmsMfa.phoneNumber[queryDto.locale]}
            type='text'
            required={false}
            name='phoneNumber'
            value={phoneNumber ?? undefined}
            disabled={!!phoneNumber}
          />
          <Field
            label={localeConfig.authorizeSmsMfa.code[queryDto.locale]}
            type='text'
            required={false}
            className={phoneNumber ? undefined : 'hidden'}
            name='code'
          />
          <SubmitButton
            title={
              phoneNumber
                ? localeConfig.authorizeSmsMfa.verify[queryDto.locale]
                : localeConfig.authorizeSmsMfa.sendCode[queryDto.locale]
            }
          />
        </section>
      </form>
      {html`
        <script>
          ${resetErrorScript.resetCodeError()}
          ${resetErrorScript.resetPhoneNumberError()}
          function handleSubmit(e) {
            e.preventDefault();
            var containNumber = document.getElementById('form-phoneNumber').disabled
            if (containNumber) {
              ${validateScript.verificationCode(queryDto.locale)}
            } else {
              ${validateScript.phoneNumber(queryDto.locale)}
            }

            if (!containNumber) {
              fetch('${routeConfig.IdentityRoute.SetupSmsMfa}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                  phoneNumber: document.getElementById('form-phoneNumber').value,
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                document.getElementById('form-phoneNumber').disabled = true;
                document.getElementById('code-row').classList.remove('hidden');
                document.getElementById('submit-button').innerHTML = "${localeConfig.authorizeSmsMfa.verify[queryDto.locale]}"
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            } else {
              fetch('${routeConfig.IdentityRoute.AuthorizeSmsMfa}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                  mfaCode: document.getElementById('form-code').value,
                })
              })
              .then((response) => {
                ${responseScript.parseRes()}
              })
              .then((data) => {
                ${responseScript.handleAuthorizeFormRedirect(queryDto.locale)}
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            }

            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizeSmsMfa
