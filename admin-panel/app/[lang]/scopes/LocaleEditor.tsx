import { useTranslations } from 'next-intl'
import { Input } from 'components/ui/input'

export type LocaleValues = { locale: string; value: string }[]

const LocaleEditor = ({
  supportedLocales,
  values,
  onChange,
  disabled,
}: {
  onChange: (newLocales: LocaleValues) => void;
  values: LocaleValues;
  supportedLocales: string[];
  disabled?: boolean;
}) => {
  const t = useTranslations()

  const handleSetLocale = (
    targetLocale: string, val: string,
  ) => {
    const finalValues = values
    const isUpdate = finalValues.find((value) => value.locale === targetLocale)
    const newLocales = isUpdate
      ? finalValues.map((value) => value.locale === targetLocale
        ? ({
          locale: targetLocale, value: val,
        })
        : value)
      : [...finalValues, {
        locale: targetLocale, value: val,
      }]
    onChange(newLocales)
  }

  return (
    <section className='flex flex-col gap-4'>
      <p>* {t('scopes.localeNote')}</p>
      {supportedLocales.map((locale) => (
        <section
          key={locale}
          className='flex items-center gap-4'>
          <p>{locale.toUpperCase()}</p>
          <Input
            data-testid='localeInput'
            className='w-full'
            disabled={disabled}
            onChange={(e) => handleSetLocale(
              locale,
              e.target.value,
            )}
            value={values?.find((value) => value.locale === locale)?.value ?? ''}
          />
        </section>
      ))}
    </section>
  )
}

export default LocaleEditor
