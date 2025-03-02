import { useEffect } from 'hono/jsx'
import {
  localeConfig, typeConfig,
} from 'configs'
import {
  SecondaryButton, ViewTitle, CheckboxInput,
  SubmitError,
} from 'pages/components'
import {
  usePasskeyEnrollForm, useSubmitError, View,
} from 'pages/hooks'

export interface PasskeyEnrollProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const PasskeyEnroll = ({
  locale,
  onSwitchView,
}: PasskeyEnrollProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    onSwitchView,
    locale,
  })

  const {
    getEnrollOptions,
    rememberSkip,
    handleRememberSkip,
    handleEnroll,
    handleDecline,
  } = usePasskeyEnrollForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getEnrollOptions()
    },
    [getEnrollOptions],
  )

  return (
    <>
      <script src='https://unpkg.com/@simplewebauthn/browser/dist/bundle/index.umd.min.js'></script>
      <ViewTitle title={localeConfig.authorizePasskeyEnroll.title[locale]} />
      <section class='mt-4 flex items-center justify-center gap-8 w-full'>
        <SecondaryButton
          title={localeConfig.authorizePasskeyEnroll.skip[locale]}
          onClick={handleDecline}
        />
        <SecondaryButton
          title={localeConfig.authorizePasskeyEnroll.enroll[locale]}
          onClick={handleEnroll}
        />
      </section>
      <SubmitError error={submitError} />
      <CheckboxInput
        id='skipPasskeyEnroll'
        label={localeConfig.authorizePasskeyEnroll.rememberSkip[locale]}
        checked={rememberSkip}
        onChange={handleRememberSkip}
      />
    </>
  )
}

export default PasskeyEnroll
