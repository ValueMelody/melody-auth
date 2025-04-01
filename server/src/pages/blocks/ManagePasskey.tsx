import { managePasskey } from 'pages/tools/locale'
import {
  ViewTitle, SuccessMessage, SubmitError, PrimaryButton,
} from 'pages/components'
import { typeConfig } from 'configs'
import { userPasskeyModel } from 'models'

export interface ManagePasskeyProps {
  locale: typeConfig.Locale;
  successMessage: string | null;
  passkey: userPasskeyModel.Record | null;
  handleRemove: () => void;
  handleEnroll: () => void;
  submitError: string | null;
  redirectUri: string;
}

const ManagePasskey = ({
  locale,
  successMessage,
  passkey,
  handleRemove,
  handleEnroll,
  submitError,
  redirectUri,
}: ManagePasskeyProps) => {
  return (
    <>
      {successMessage && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={successMessage}
          />
        </section>
      )}
      <ViewTitle title={managePasskey.title[locale]} />
      {
        passkey && (
          <div
            className='flex flex-col gap-4'
          >
            <div className='border rounded-md p-4 w-(--text-width) flex-col gap-2'>
              <p><b>{managePasskey.active[locale]}:</b></p>
              <p
                id='passkey-credential-id'
                style={{ overflowWrap: 'break-word' }}>{passkey?.credentialId}
              </p>
              <p><b>{managePasskey.loginCount[locale]}:</b> <span id='passkey-counter'>{passkey?.counter}</span></p>
            </div>
            <SubmitError error={submitError} />
            <PrimaryButton
              type='button'
              title={managePasskey.remove[locale]}
              onClick={handleRemove}
            />
          </div>
        )
      }
      {!passkey && (
        <div
          className='flex flex-col gap-4'
        >
          <p>{managePasskey.noPasskey[locale]}</p>
          <SubmitError error={submitError} />
          <PrimaryButton
            type='button'
            title={managePasskey.enroll[locale]}
            onClick={handleEnroll}
          />
        </div>
      )}
      <a
        className='mt-6'
        href={redirectUri}
      >
        {managePasskey.redirect[locale]}
      </a>
    </>
  )
}

export default ManagePasskey
