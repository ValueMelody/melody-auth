import { html } from 'hono/html'
import {
  localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import { identityDto } from 'dtos'
import { responseScript } from 'views/scripts'
import SubmitError from 'views/components/SubmitError'
import Title from 'views/components/Title'

export interface EnrollOptions {
  rpId: string;
  userId: number;
  userEmail: string;
  userDisplayName: string;
  challenge: string;
}

const AuthorizePasskeyEnroll = ({
  queryDto, branding, locales, enrollOptions,
}: {
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  branding: Branding;
  locales: typeConfig.Locale[];
  enrollOptions: EnrollOptions;
}) => {
  return (
    <Layout
      locales={locales}
      branding={branding}
      locale={queryDto.locale}
    >
      <script src='https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js'></script>
      <Title title={localeConfig.authorizePasskeyEnroll.title[queryDto.locale]} />
      <SubmitError />
      <section class='mt-4 flex-row gap-8 w-full'>
        <button
          class='button-secondary w-full'
          type='button'
          onclick='handleDecline()'
        >
          {localeConfig.authorizePasskeyEnroll.skip[queryDto.locale]}
        </button>
        <button
          class='button-secondary w-full'
          type='button'
          onclick={'handleEnroll()'}
        >
          {localeConfig.authorizePasskeyEnroll.enroll[queryDto.locale]}
        </button>
      </section>
      <section class='flex-row w-full'>
        <input
          type='checkbox'
          id='skipPasskeyEnroll'
          class='ml-12 mr-2' />
        <label htmlFor='skipPasskeyEnroll'>{localeConfig.authorizePasskeyEnroll.rememberSkip[queryDto.locale]}</label>
      </section>
      {html`
        <script>
          function handleEnroll() {
            navigator.credentials.create({ publicKey: {
              challenge: window.SimpleWebAuthnBrowser.base64URLStringToBuffer("${enrollOptions.challenge}"),
              rp: { name: "Melody Auth Service", id: "${enrollOptions.rpId}" },
              user: {
                id: new TextEncoder().encode("${enrollOptions.userId}"),
                name: new TextEncoder().encode("${enrollOptions.userEmail}"),
                displayName: "${enrollOptions.userDisplayName}",
              },
              pubKeyCredParams: [
                { alg: -8, type: 'public-key' },
                { alg: -7, type: 'public-key' },
                { alg: -257, type: 'public-key' }
              ],
              authenticatorSelection: {
                userVerification: "preferred",
              }
            }}).then((res) => {
              submitEnroll(res)
            })
          }
          function handleDecline() {
            fetch('${routeConfig.IdentityRoute.AuthorizePasskeyEnrollDecline}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
                remember: document.getElementById('skipPasskeyEnroll').checked
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
          function submitEnroll(enrollInfo) {
            fetch('${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}",
                enrollInfo
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
            return false;
          }
        </script>
      `}
    </Layout>
  )
}

export default AuthorizePasskeyEnroll
