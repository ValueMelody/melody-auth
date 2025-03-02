import {
  localeConfig, typeConfig,
} from 'configs'
import {
  PrimaryButton,
  SubmitError,
  SuccessMessage,
  ViewTitle,
} from 'pages/components'
import {
  View,
  useSubmitError,
  useResetMfaForm,
} from 'pages/hooks'

export interface ResetMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const ResetMfa = ({
  locale,
  onSwitchView,
}: ResetMfaProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    handleSubmit,
    success,
    redirectUri,
  } = useResetMfaForm({
    locale,
    onSubmitError: handleSubmitError,
  })

  return (
    <>
      {success && (
        <section className='flex justify-center w-full'>
          <SuccessMessage
            message={localeConfig.resetMfa.success[locale]}
          />
        </section>
      )}
      {!success && (
        <>
          <ViewTitle title={localeConfig.resetMfa.title[locale]} />
          <form
            onSubmit={handleSubmit}
          >
            <section className='flex flex-col gap-2'>
              <p className='w-(--text-width)'>{localeConfig.resetMfa.desc[locale]}</p>
              <SubmitError error={submitError} />
              <PrimaryButton
                className='mt-4'
                type='submit'
                title={localeConfig.resetMfa.confirm[locale]}
              />
            </section>
          </form>
        </>
      )}
      <a
        class='button-secondary mt-6'
        href={redirectUri}
      >
        {localeConfig.resetMfa.redirect[locale]}
      </a>
    </>
  )
}

export default ResetMfa
