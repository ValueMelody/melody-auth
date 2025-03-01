import { useEffect } from 'hono/jsx'
import { Scope } from 'shared'
import {
  useConsentForm, useSubmitError, View,
} from 'pages/hooks'
import {
  typeConfig, localeConfig,
} from 'configs'
import {
  SecondaryButton, SubmitError, ViewTitle,
} from 'pages/components'

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
    <>
      <ViewTitle title={localeConfig.authorizeConsent.title[locale]} />
      {consentInfo && (
        <p class='w-(--text-width) text-center'>
          {consentInfo?.appName} {localeConfig.authorizeConsent.requestAccess[locale]}
        </p>
      )}
      <section class='flex pl-2 pr-2 w-full'>
        <section class='p-4 border rounded-md w-full'>
          <ul>
            {consentInfo?.scopes.map((scope) => {
              if (scope.name === Scope.OpenId || scope.name === Scope.OfflineAccess) return null
              const scopeTranslation = scope.locales.find((scopeLocale) => scopeLocale.locale === locale)
              return (
                <li
                  key={scope.id}
                  class='w-(--text-width) p-2'>{scopeTranslation?.value || scope.name}
                </li>
              )
            })}
          </ul>
        </section>
      </section>
      <SubmitError error={submitError} />
      <section class='mt-4 flex gap-8 w-full justify-center'>
        <SecondaryButton
          title={localeConfig.authorizeConsent.decline[locale]}
          onClick={handleDecline}
        />
        <SecondaryButton
          title={localeConfig.authorizeConsent.accept[locale]}
          onClick={handleAccept}
        />
      </section>
    </>
  )
}

export default Consent
