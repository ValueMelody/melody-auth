import { useEffect } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  PrimaryButton, SubmitError, SuccessMessage, ViewTitle,
} from 'pages/components'
import {
  useManagePasskeyForm, useSubmitError, View,
} from 'pages/hooks'

export interface ManagePasskeyProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ManagePasskey = ({
  locale,
  onSwitchView,
}: ManagePasskeyProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    successMessage, getManagePasskeyInfo, passkey, handleRemove, handleEnroll, redirectUri,
  } = useManagePasskeyForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  useEffect(
    () => {
      getManagePasskeyInfo()
    },
    [getManagePasskeyInfo],
  )

  return (
    <>
      <script src='https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js'></script>
      {successMessage && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={successMessage}
          />
        </section>
      )}
      <ViewTitle title={localeConfig.managePasskey.title[locale]} />
      {
        passkey && (
          <div
            className='flex flex-col gap-4'
          >
            <div className='border rounded-md p-4 w-(--text-width) flex-col gap-2'>
              <p><b>{localeConfig.managePasskey.active[locale]}:</b></p>
              <p
                id='passkey-credential-id'
                style={{ overflowWrap: 'break-word' }}>{passkey?.credentialId}
              </p>
              <p><b>{localeConfig.managePasskey.loginCount[locale]}:</b> <span id='passkey-counter'>{passkey?.counter}</span></p>
            </div>
            <SubmitError error={submitError} />
            <PrimaryButton
              type='button'
              title={localeConfig.managePasskey.remove[locale]}
              onClick={handleRemove}
            />
          </div>
        )
      }
      {!passkey && (
        <div
          className='flex flex-col gap-4'
        >
          <p>{localeConfig.managePasskey.noPasskey[locale]}</p>
          <SubmitError error={submitError} />
          <PrimaryButton
            type='button'
            title={localeConfig.managePasskey.enroll[locale]}
            onClick={handleEnroll}
          />
        </div>
      )}
      <a
        className='mt-6'
        href={redirectUri}
      >
        {localeConfig.managePasskey.redirect[locale]}
      </a>
    </>
  )
}

export default ManagePasskey
