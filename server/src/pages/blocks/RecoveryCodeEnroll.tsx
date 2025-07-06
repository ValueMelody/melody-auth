import { GetProcessRecoveryCodeEnrollRes } from 'handlers/identity'
import {
  RecoveryCodeContainer,
  SecondaryButton,
  SubmitError, ViewTitle,
} from 'pages/components'
import { recoveryCodeEnroll } from 'pages/tools/locale'

import { typeConfig } from 'configs'

export interface RecoveryCodeEnrollProps {
  locale: typeConfig.Locale;
  recoveryCodeEnrollInfo: GetProcessRecoveryCodeEnrollRes | null;
  submitError: string | null;
  handleContinue: () => void;
}

const RecoveryCodeEnroll = ({
  locale,
  recoveryCodeEnrollInfo,
  handleContinue,
  submitError,
}: RecoveryCodeEnrollProps) => {
  return (
    <>
      <ViewTitle title={recoveryCodeEnroll.title[locale]} />
      <section class='flex flex-col justify-around w-full gap-4 mt-4'>
        <p class='w-(--text-width) text-center'>
          {recoveryCodeEnroll.desc[locale]}
        </p>
        <RecoveryCodeContainer
          recoveryCode={recoveryCodeEnrollInfo?.recoveryCode}
          copyTitle={recoveryCodeEnroll.copy[locale]}
          downloadTitle={recoveryCodeEnroll.download[locale]}
          title={recoveryCodeEnroll.title[locale]}
          desc={recoveryCodeEnroll.desc[locale]}
        />
        <SecondaryButton
          title={recoveryCodeEnroll.continue[locale]}
          onClick={handleContinue}
        />
      </section>
      <SubmitError error={submitError} />
    </>
  )
}

export default RecoveryCodeEnroll
