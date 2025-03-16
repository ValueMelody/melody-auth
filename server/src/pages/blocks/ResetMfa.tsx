import {
  SuccessMessage, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import { resetMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

interface ResetMfaProps {
  locale: typeConfig.Locale;
  success: boolean;
  handleSubmit: (e: Event) => void;
  submitError: string | null;
  redirectUri: string;
}

const ResetMfa = ({
  locale,
  success,
  handleSubmit,
  submitError,
  redirectUri,
}: ResetMfaProps) => {
  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={resetMfa.success[locale]}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={resetMfa.title[locale]} />
          <form
            onSubmit={handleSubmit}
          >
            <section className='flex flex-col gap-2'>
              <p className='w-(--text-width)'>{resetMfa.desc[locale]}</p>
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={resetMfa.confirm[locale]}
              />
            </section>
          </form>
        </>
      )}
      <a
        class='button-secondary mt-6'
        href={redirectUri}
      >
        {resetMfa.redirect[locale]}
      </a>
    </>
  )
}

export default ResetMfa
