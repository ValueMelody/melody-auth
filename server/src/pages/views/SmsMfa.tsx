import { useEffect } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  CodeInput, PhoneField, PrimaryButton, SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'
import {
  useSubmitError, useSmsMfaForm, View,
} from 'pages/hooks'

export interface SmsMfaProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const SmsMfa = ({
  locale,
  onSwitchView,
}: SmsMfaProps) => {
  const {
    submitError, handleSubmitError,
  } = useSubmitError({
    locale,
    onSwitchView,
  })

  const {
    getSmsMfaInfo,
    currentNumber,
    allowFallbackToEmailMfa,
    countryCode,
    values,
    errors,
    handleChange,
    handleSubmit,
    handleResend,
    resent,
  } = useSmsMfaForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getSmsMfaInfo()
    },
    [getSmsMfaInfo],
  )

  return (
    <>
      <ViewTitle
        title={localeConfig.authorizeSmsMfa.title[locale]}
      />
      <form
        autoComplete='on'
        onSubmit={handleSubmit}
      >
        <section className='flex flex-col gap-4 justify-center'>
          <PhoneField
            countryCode={countryCode}
            label={localeConfig.authorizeSmsMfa.phoneNumber[locale]}
            required={!currentNumber}
            name='phoneNumber'
            value={currentNumber ?? values.phoneNumber}
            disabled={!!currentNumber}
            onChange={(value) => handleChange(
              'phoneNumber',
              value,
            )}
            error={errors.phoneNumber}
          />
          {values.mfaCode && (
            <>
              <SecondaryButton
                title={resent
                  ? localeConfig.authorizeSmsMfa.resent[locale]
                  : localeConfig.authorizeSmsMfa.resend[locale]
                }
                onClick={handleResend}
                disabled={resent}
              />
              <CodeInput
                label={localeConfig.authorizeSmsMfa.code[locale]}
                required
                code={values.mfaCode ?? []}
                error={errors.mfaCode}
                setCode={(value) => handleChange(
                  'mfaCode',
                  value,
                )}
              />
            </>
          )}
          <SubmitError error={submitError} />
          <PrimaryButton
            title={localeConfig.authorizeSmsMfa.verify[locale]}
            type='submit'
          />
        </section>
      </form>
      {currentNumber && allowFallbackToEmailMfa && (
        <SecondaryButton
          title={localeConfig.authorizeSmsMfa.switchToEmail[locale]}
          onClick={() => onSwitchView(View.EmailMfa)}
        />
      )}
    </>
  )
}

export default SmsMfa
