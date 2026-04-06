import { useTranslations } from 'next-intl'
import { Label } from 'components/ui/label'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from 'components/ui/select'
import { App } from 'services/auth/api'

const NO_APP = ' '

export const InviteLocaleField = ({
  locale,
  supportedLocales,
  testIdPrefix,
  onLocaleChange,
}: {
  locale: string;
  supportedLocales: string[];
  testIdPrefix: string;
  onLocaleChange: (value: string) => void;
}) => {
  const t = useTranslations()

  if (supportedLocales.length <= 1) return null

  return (
    <div className='flex flex-col gap-1'>
      <Label>{t('users.locale')}</Label>
      <Select
        value={locale}
        onValueChange={onLocaleChange}
      >
        <SelectTrigger data-testid={`${testIdPrefix}Locale`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {supportedLocales.map((supportedLocale) => (
              <SelectItem
                key={supportedLocale}
                value={supportedLocale}
                data-testid={`${testIdPrefix}LocaleOption-${supportedLocale}`}
              >
                {supportedLocale.toUpperCase()}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export const InviteRedirectFields = ({
  selectedAppId,
  signinUrl,
  spaApps,
  testIdPrefix,
  onSelectedAppIdChange,
  onSigninUrlChange,
}: {
  selectedAppId: number | null;
  signinUrl: string;
  spaApps: App[];
  testIdPrefix: string;
  onSelectedAppIdChange: (value: number | null) => void;
  onSigninUrlChange: (value: string) => void;
}) => {
  const t = useTranslations()

  const selectedApp = spaApps.find((app) => app.id === selectedAppId)
  const redirectUris = selectedApp?.redirectUris ?? []

  const handleAppChange = (value: string) => {
    onSelectedAppIdChange(value === NO_APP ? null : Number(value))
    onSigninUrlChange('')
  }

  if (spaApps.length === 0) return null

  return (
    <div className='flex flex-col gap-3 pt-2 border-t'>
      <div>
        <p className='text-sm font-medium'>{t('users.inviteRedirectApp')}</p>
        <p className='mt-1 text-sm text-muted-foreground'>{t('users.inviteRedirectDesc')}</p>
      </div>
      <div className='flex flex-col gap-1'>
        <Label>{t('users.inviteRedirectApp')}</Label>
        <Select
          value={selectedAppId?.toString() ?? NO_APP}
          onValueChange={handleAppChange}
        >
          <SelectTrigger data-testid={`${testIdPrefix}App`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={NO_APP}>{t('users.noApp')}</SelectItem>
              {spaApps.map((app) => (
                <SelectItem
                  key={app.id}
                  value={app.id.toString()}
                  data-testid={`${testIdPrefix}AppOption-${app.id}`}
                >
                  {app.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {redirectUris.length > 0 && (
        <div className='flex flex-col gap-1'>
          <Label>{t('users.inviteRedirectUrl')}</Label>
          <Select
            value={signinUrl || NO_APP}
            onValueChange={(value) => onSigninUrlChange(value === NO_APP ? '' : value)}
          >
            <SelectTrigger data-testid={`${testIdPrefix}RedirectUrl`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={NO_APP}>{t('users.noApp')}</SelectItem>
                {redirectUris.map((uri) => (
                  <SelectItem
                    key={uri}
                    value={uri}
                    data-testid={`${testIdPrefix}RedirectUrlOption-${uri}`}
                  >
                    {uri}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
