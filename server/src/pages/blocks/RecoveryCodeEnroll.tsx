import { GetProcessRecoveryCodeEnrollRes } from 'handlers/identity'
import {
  PrimaryButton,
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
  const handleCopyRecoveryCode = async () => {
    if (!recoveryCodeEnrollInfo?.recoveryCode) return
    await navigator.clipboard.writeText(recoveryCodeEnrollInfo.recoveryCode)
  }

  const handleDownloadRecoveryCode = () => {
    if (!recoveryCodeEnrollInfo?.recoveryCode) return

    const content = `${recoveryCodeEnroll.title[locale]}: ${recoveryCodeEnrollInfo.recoveryCode}\n\n${recoveryCodeEnroll.desc[locale]}`
    const blob = new Blob(
      [content],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'recovery-code-melody-auth.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <>
      <ViewTitle title={recoveryCodeEnroll.title[locale]} />
      <section class='flex flex-col justify-around w-full gap-4 mt-4'>
        <p class='w-(--text-width) text-center'>
          {recoveryCodeEnroll.desc[locale]}
        </p>
        <p class='w-(--text-width) text-center border border-lightGray p-4 rounded-md'>
          {recoveryCodeEnrollInfo?.recoveryCode}
        </p>
        <section class='flex gap-4'>
          <PrimaryButton
            type='button'
            className='w-full'
            title={recoveryCodeEnroll.copy[locale]}
            onClick={handleCopyRecoveryCode}
          />
          <PrimaryButton
            type='button'
            className='w-full'
            title={recoveryCodeEnroll.download[locale]}
            onClick={handleDownloadRecoveryCode}
          />
        </section>
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
