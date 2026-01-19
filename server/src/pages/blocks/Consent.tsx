import { Scope } from '@melody-auth/shared'
import {
  SubmitError, SecondaryButton, ViewTitle,
} from 'pages/components'
import { consent } from 'pages/tools/locale'
import { typeConfig } from 'configs'
import { GetAppConsentRes } from 'handlers/identity'

export interface ConsentProps {
  locale: typeConfig.Locale;
  consentInfo: GetAppConsentRes | null;
  onDecline: () => void;
  onAccept: () => void;
  submitError: string | null;
  isAccepting: boolean;
}

const Consent = ({
  locale,
  consentInfo,
  onDecline,
  onAccept,
  submitError,
  isAccepting,
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
          onClick={onDecline}
        />
        <SecondaryButton
          title={consent.accept[locale]}
          isLoading={isAccepting}
          onClick={onAccept}
        />
      </section>
    </>
  )
}

export default Consent
