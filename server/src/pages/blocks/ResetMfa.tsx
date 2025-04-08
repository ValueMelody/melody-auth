import {
  SuccessMessage, ViewTitle, SubmitError, PrimaryButton,
} from 'pages/components'
import { resetMfa } from 'pages/tools/locale'
import { typeConfig } from 'configs'

export interface ResetMfaProps {
  locale: typeConfig.Locale;
  success: boolean;
  onSubmit: (e: Event) => void;
  submitError: string | null;
  redirectUri: string;
  isSubmitting: boolean;
}

const ResetMfa = ({
  locale,
  success,
  onSubmit,
  submitError,
  redirectUri,
  isSubmitting,
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
            onSubmit={onSubmit}
          >
            <section className='flex flex-col gap-2'>
              <p className='w-(--text-width)'>{resetMfa.desc[locale]}</p>
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={resetMfa.confirm[locale]}
                isLoading={isSubmitting}
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
