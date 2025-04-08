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
  onRemove: () => void;
  onEnroll: () => void;
  submitError: string | null;
  redirectUri: string;
  isRemoving: boolean;
  isEnrolling: boolean;
}

const ManagePasskey = ({
  locale,
  successMessage,
  passkey,
  onRemove,
  onEnroll,
  submitError,
  redirectUri,
  isRemoving,
  isEnrolling,
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
              isLoading={isRemoving}
              onClick={onRemove}
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
            isLoading={isEnrolling}
            onClick={onEnroll}
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
