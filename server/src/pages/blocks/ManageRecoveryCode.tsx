import {
  manageRecoveryCode, recoveryCodeEnroll,
} from 'pages/tools/locale'
import {
  ViewTitle, SuccessMessage, SubmitError, PrimaryButton,
  RecoveryCodeContainer,
} from 'pages/components'
import { typeConfig } from 'configs'

export interface ManageRecoveryCodeProps {
  locale: typeConfig.Locale;
  successMessage: string | null;
  recoveryCode: string | null;
  onRegenerate: () => void;
  submitError: string | null;
  redirectUri: string;
  isGenerating: boolean;
}

const ManageRecoveryCode = ({
  locale,
  successMessage,
  recoveryCode,
  onRegenerate,
  submitError,
  redirectUri,
  isGenerating,
}: ManageRecoveryCodeProps) => {
  return (
    <>
      {successMessage && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={successMessage}
          />
        </section>
      )}
      <ViewTitle title={manageRecoveryCode.title[locale]} />
      <p class='w-(--text-width) text-center'>{manageRecoveryCode.desc[locale]}</p>
      <div
        className='flex flex-col gap-4'
      >
        <SubmitError error={submitError} />
        <RecoveryCodeContainer
          recoveryCode={recoveryCode}
          copyTitle={manageRecoveryCode.copy[locale]}
          downloadTitle={manageRecoveryCode.download[locale]}
          title={recoveryCodeEnroll.title[locale]}
          desc={recoveryCodeEnroll.desc[locale]}
        />
        <PrimaryButton
          type='button'
          title={manageRecoveryCode.regenerate[locale]}
          isLoading={isGenerating}
          onClick={onRegenerate}
        />
      </div>
      <a
        className='mt-6'
        href={redirectUri}
      >
        {manageRecoveryCode.redirect[locale]}
      </a>
    </>
  )
}

export default ManageRecoveryCode
