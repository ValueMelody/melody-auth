import { useEffect } from 'hono/jsx'
import {
  useConsentForm, useSubmitError, View,
} from 'pages/hooks'
import { typeConfig } from 'configs'
import { Consent as ConsentBlock } from 'pages/blocks'

interface ConsentProps {
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const Consent = ({
  locale,
  onSwitchView,
}: ConsentProps) => {
  const {
    handleSubmitError, submitError,
  } = useSubmitError({
    onSwitchView, locale,
  })

  const {
    getConsentInfo, consentInfo, handleAccept, handleDecline,
  } = useConsentForm({
    locale,
    onSubmitError: handleSubmitError,
    onSwitchView,
  })

  useEffect(
    () => {
      getConsentInfo()
    },
    [getConsentInfo],
  )

  return (
    <ConsentBlock
      locale={locale}
      consentInfo={consentInfo}
      handleDecline={handleDecline}
      handleAccept={handleAccept}
      submitError={submitError}
    />
  )
}

export default Consent
