import PrimaryButton from './PrimaryButton'

export interface RecoveryCodeContainerProps {
  recoveryCode: string | undefined | null;
  copyTitle: string;
  downloadTitle: string;
  title: string;
  desc: string;
}

const RecoveryCodeContainer = ({
  recoveryCode,
  copyTitle,
  downloadTitle,
  title,
  desc,
}: RecoveryCodeContainerProps) => {
  if (!recoveryCode) return null

  const handleCopyRecoveryCode = async () => {
    await navigator.clipboard.writeText(recoveryCode)
  }

  const handleDownloadRecoveryCode = () => {
    const content = `${title}: ${recoveryCode}\n\n${desc}`
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
      <p class='w-(--text-width) text-center border border-lightGray p-4 rounded-md'>
        {recoveryCode}
      </p>
      <section class='flex gap-4'>
        <PrimaryButton
          type='button'
          className='w-full'
          title={copyTitle}
          onClick={handleCopyRecoveryCode}
        />
        <PrimaryButton
          type='button'
          className='w-full'
          title={downloadTitle}
          onClick={handleDownloadRecoveryCode}
        />
      </section>
    </>
  )
}

export default RecoveryCodeContainer