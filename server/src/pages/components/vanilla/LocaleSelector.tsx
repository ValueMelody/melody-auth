import { Event } from 'hono/jsx'
import { typeConfig } from 'configs'

const LocaleSelector = ({
  locale,
  locales,
  onChange,
}: {
  locale: typeConfig.Locale;
  locales: typeConfig.Locale[];
  onChange: (locale: typeConfig.Locale) => void;
}) => {
  const handleChange = (event: Event) => {
    if (event.target && 'value' in event.target) {
      onChange(event.target.value as typeConfig.Locale)
    }
  }

  return (
    <select
      className='focus:outline-none cursor-pointer'
      onChange={handleChange}
      aria-label='Select Locale'
    >
      {locales.map((targetLocale) => (
        <option
          key={targetLocale}
          value={targetLocale}
          selected={targetLocale === locale}
        >
          {targetLocale.toUpperCase()}
        </option>
      ))}
    </select>
  )
}

export default LocaleSelector
