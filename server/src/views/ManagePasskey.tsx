import { html } from 'hono/html'
import SubmitError from './components/SubmitError'
import {
  localeConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import Layout, { Branding } from 'views/components/Layout'
import {
  requestScript, responseScript,
} from 'views/scripts'
import Title from 'views/components/Title'
import { identityDto } from 'dtos'
import { userPasskeyModel } from 'models'
import { EnrollOptions } from 'views/AuthorizePasskeyEnroll'

const ManagePasskey = ({
  branding, queryDto, locales, redirectUri, passkey, enrollOptions,
}: {
  branding: Branding;
  queryDto: identityDto.GetAuthorizeFollowUpReqDto;
  locales: typeConfig.Locale[];
  redirectUri: string;
  enrollOptions: EnrollOptions;
  passkey: userPasskeyModel.Record | null;
}) => {
  return (
    <Layout
      branding={branding}
      locale={queryDto.locale}
      locales={locales}
    >
      <script src='https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js'></script>
      <section
        id='success-message'
        class='flex-col gap-4 hidden'
      >
        <p
          id='success-message-text'
          class='text-green text-semibold'>
        </p>
      </section>
      <section
        id='submit-form'
        class='flex-col items-center gap-4'
      >
        <Title title={localeConfig.managePasskey.title[queryDto.locale]} />
        <SubmitError />
        <div
          id='passkey'
          class={`flex-col mt-4 gap-4 ${passkey ? '' : 'hidden'}`}>
          <div class='border rounded-md p-4 w-text flex-col gap-2'>
            <p><b>{localeConfig.managePasskey.active[queryDto.locale]}:</b></p>
            <p
              id='passkey-credential-id'
              style={{ overflowWrap: 'break-word' }}>{passkey?.credentialId}
            </p>
            <p><b>{localeConfig.managePasskey.loginCount[queryDto.locale]}:</b> <span id='passkey-counter'>{passkey?.counter}</span></p>
          </div>
          <button
            class='button w-full'
            type='button'
            onclick='handleRemove()'
          >
            {localeConfig.managePasskey.remove[queryDto.locale]}
          </button>
        </div>
        <div
          id='no-passkey'
          class={`flex-col mt-4 gap-4 ${passkey ? 'hidden' : ''}`}>
          <p>{localeConfig.managePasskey.noPasskey[queryDto.locale]}</p>
          <button
            class='button w-full'
            type='button'
            onclick='handleEnroll()'
          >
            {localeConfig.managePasskey.enroll[queryDto.locale]}
          </button>
        </div>
        <a
          class='button-secondary mt-8'
          href={`${redirectUri}`}
        >
          {localeConfig.managePasskey.redirect[queryDto.locale]}
        </a>
      </section>
      {html`
        <script>
          function handleEnroll() {
            ${requestScript.triggerPasskeyEnroll(enrollOptions)}.then((res) => {
              submitEnroll(res)
            })
          }
          function submitEnroll(enrollInfo) {
            fetch('${routeConfig.IdentityRoute.ManagePasskey}', {
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
              document.getElementById('success-message').classList.remove('hidden');
              document.getElementById('success-message-text').innerHTML = "${localeConfig.managePasskey.enrollSuccess[queryDto.locale]}";
              document.getElementById('no-passkey').classList.add('hidden');
              document.getElementById('passkey').classList.remove('hidden');
              document.getElementById('passkey-credential-id').innerHTML = data.passkey.credentialId;
              document.getElementById('passkey-counter').innerHTML = data.passkey.counter;
            })
            .catch((error) => {
              ${responseScript.handleSubmitError(queryDto.locale)}
            });
            return false;
          }
          function handleRemove() {
            fetch('${routeConfig.IdentityRoute.ManagePasskey}', {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: "${queryDto.code}",
                locale: "${queryDto.locale}"
              })
            })
            .then((response) => {
              ${responseScript.parseRes()}
            })
            .then((data) => {
              document.getElementById('success-message').classList.remove('hidden');
              document.getElementById('success-message-text').innerHTML = "${localeConfig.managePasskey.removeSuccess[queryDto.locale]}";
              document.getElementById('passkey').classList.add('hidden');
              document.getElementById('no-passkey').classList.remove('hidden');
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

export default ManagePasskey
