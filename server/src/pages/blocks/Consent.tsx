import { Scope } from 'shared'
import {
  SubmitError, SecondaryButton, ViewTitle,
} from 'pages/components'
import { consent } from 'pages/tools/locale'
import { typeConfig } from 'configs'
import { GetAppConsentRes } from 'handlers/identity'

export interface ConsentProps {
  locale: typeConfig.Locale;
  consentInfo: GetAppConsentRes | null;
  handleDecline: () => void;
  handleAccept: () => void;
  submitError: string | null;
}

const Consent = ({
  locale,
  consentInfo,
  handleDecline,
  handleAccept,
  submitError,
}: ConsentProps) => {
  return (
    <>
      <ViewTitle title={consent.title[locale]} />
      {consentInfo && (
        <p class='w-(--text-width) text-center'>
          {consentInfo?.appName} {consent.requestAccess[locale]}
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
          title={consent.decline[locale]}
          onClick={handleDecline}
        />
        <SecondaryButton
          title={consent.accept[locale]}
          onClick={handleAccept}
        />
      </section>
    </>
  )
}

export default Consent
