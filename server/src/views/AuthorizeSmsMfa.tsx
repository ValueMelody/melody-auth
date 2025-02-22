import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import {
  responseScript,
  validateScript,
  resetErrorScript,
} from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import SubmitButton from 'views/components/SubmitButton'
import CodeInput from 'views/components/CodeInput'
import PhoneField from 'views/components/PhoneField'

const AuthorizeSmsMfa = ({
  queryDto, branding, locales, phoneNumber, showEmailMfaBtn, countryCode,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
  phoneNumber: string | null;
  showEmailMfaBtn: boolean;
  countryCode: string;
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      <h1 class='w-text text-center'>{localeConfig.authorizeSmsMfa.title[queryDto.locale]}</h1>
      <SubmitError />
      <form
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <div class='flex-row items-center'>
            <PhoneField
              countryCode={countryCode}
              label={localeConfig.authorizeSmsMfa.phoneNumber[queryDto.locale]}
              required={false}
              name='phoneNumber'
              value={phoneNumber ?? undefined}
              disabled={!!phoneNumber}
            />
          </div>
          <button
            id='resend-btn'
            type='button'
            class={`button-secondary ${phoneNumber ? '' : 'hidden'}`}
            onclick='resendCode()'
          >
            {localeConfig.authorizeSmsMfa.resend[queryDto.locale]}
          </button>
          <CodeInput
            label={localeConfig.authorizeSmsMfa.code[queryDto.locale]}
            type='text'
            required={false}
            className={phoneNumber ? undefined : 'hidden'}
            name='code'
          />
          {showEmailMfaBtn && (
            <button
              id='switch-to-email'
              type='button'
              class='button-secondary w-text'
              onclick='switchToEmail()'
            >
              {localeConfig.authorizeSmsMfa.switchToEmail[queryDto.locale]}
            </button>
          )}
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
          function switchToEmail() {
            var queryString = "?code=${queryDto.code}&locale=${queryDto.locale}";
            var url = "${routeConfig.IdentityRoute.AuthorizeEmailMfa}" + queryString
            window.location.href = url;
          }
          function resendCode() {
            var containNumber = "${phoneNumber}";
            if (containNumber) {
              fetch('${routeConfig.IdentityRoute.ResendSmsMfa}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  locale: "${queryDto.locale}",
                  code: "${queryDto.code}",
                })
              })
              .then((response) => {
                if (response.ok) {
                  var resendBtn = document.getElementById("resend-btn")
                  resendBtn.disabled = true;
                  resendBtn.innerHTML = "${localeConfig.authorizeSmsMfa.resent[queryDto.locale]}"
                } else {
                  return response.text().then(text => {
                    throw new Error(text);
                  });
                }
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            } else {
              fetch('${routeConfig.IdentityRoute.SetupSmsMfa}', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  code: "${queryDto.code}",
                  locale: "${queryDto.locale}",
                  phoneNumber: "${countryCode}" + document.getElementById('form-phoneNumber').value,
                })
              })
              .then((response) => {
                if (response.ok) {
                  var resendBtn = document.getElementById("resend-btn")
                  resendBtn.disabled = true;
                  resendBtn.innerHTML = "${localeConfig.authorizeSmsMfa.resent[queryDto.locale]}"
                } else {
                  return response.text().then(text => {
                    throw new Error(text);
                  });
                }
              })
              .catch((error) => {
                ${responseScript.handleSubmitError(queryDto.locale)}
              });
            }
          }
          function handleSubmit(e) {
            e.preventDefault();
            var containNumber = document.getElementById('form-phoneNumber').disabled
            if (containNumber) {
              ${validateScript.verificationCode(queryDto.locale)}
            } else {
              ${validateScript.phoneNumber(
      queryDto.locale,
      countryCode,
    )}
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
                  phoneNumber: "${countryCode}" + document.getElementById('form-phoneNumber').value,
                })
              })
              .then((response) => {
                if (response.ok) {
                  document.getElementById('form-phoneNumber').disabled = true;
                  document.getElementById('code-row').classList.remove('hidden');
                  document.getElementById('resend-btn').classList.remove('hidden');
                  document.getElementById('submit-button').innerHTML = "${localeConfig.authorizeSmsMfa.verify[queryDto.locale]}"
                } else {
                  return response.text().then(text => {
                    throw new Error(text);
                  });
                }
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
                ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale,
      queryDto.org,
    )}
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
