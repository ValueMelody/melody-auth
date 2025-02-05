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

const AuthorizeOtpMfa = ({
  queryDto, branding, locales, otp, showEmailMfaBtn,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
  otp?: string;
  showEmailMfaBtn: boolean;
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      {otp && (
        <>
          <script src='https://unpkg.com/qrcode@1.4.1/build/qrcode.js'></script>
          <h1 class='w-text text-center'>{localeConfig.authorizeOtpMfa.setup[queryDto.locale]}</h1>
          <canvas id='qr-code' />
        </>
      )}
      <SubmitError />
      <form
        onsubmit='return handleSubmit(event)'
      >
        <section class='flex-col gap-4'>
          <CodeInput
            type='text'
            required={false}
            label={localeConfig.authorizeOtpMfa.code[queryDto.locale]}
            name='otp'
          />
          {showEmailMfaBtn && (
            <button
              type='button'
              class='button-secondary w-text'
              onclick='switchToEmail()'
            >
              {localeConfig.authorizeOtpMfa.switchToEmail[queryDto.locale]}
            </button>
          )}
          <SubmitButton
            title={localeConfig.authorizeOtpMfa.verify[queryDto.locale]}
          />
        </section>
      </form>
      {html`
        <script>
          var qrCodeEl = document.getElementById('qr-code')
          if (qrCodeEl) QRCode.toCanvas(document.getElementById('qr-code'), "${otp}")
          ${resetErrorScript.resetOtpError()}
          function switchToEmail() {
            var queryString = "?code=${queryDto.code}&locale=${queryDto.locale}";
            var url = "${routeConfig.IdentityRoute.AuthorizeEmailMfa}" + queryString
            window.location.href = url;
          }
          function handleSubmit(e) {
            e.preventDefault();
            ${validateScript.verificationOtp(queryDto.locale)}
            fetch('${routeConfig.IdentityRoute.AuthorizeOtpMfa}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
                mfaCode: document.getElementById('form-otp').value,
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              ${responseScript.handleAuthorizeFormRedirect(
      queryDto.locale, queryDto.org,
    )}
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

export default AuthorizeOtpMfa
