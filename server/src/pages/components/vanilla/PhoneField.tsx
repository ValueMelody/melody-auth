import FieldLabel from './FieldLabel'
import FieldError from './FieldError'
import FieldInput from './FieldInput'

export interface PhoneFieldProps {
  label: string;
  required: boolean;
  name: string;
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  countryCode: string;
}

const PhoneField = ({
  label,
  required,
  name,
  countryCode,
  className,
  value,
  onChange,
  disabled,
  error,
}: PhoneFieldProps) => {
  return (
    <section
      className={`flex flex-col gap-2 ${className || ''}`}
    >
      <FieldLabel
        label={label}
        required={required}
        fieldName={name}
      />
      <div class='flex items-center'>
        <FieldInput
          className='bg-white border border-[lightGray] rounded-lg p-3 w-(--text-width) '
          type='text'
          style={{ paddingLeft: countryCode ? `${25 + countryCode.length * 5}px` : undefined }}
          name={name}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
        {countryCode && (
          <p
            className='absolute ml-[10px] text-sm'
          >
            {countryCode}
          </p>
        )}
      </div>
      <FieldError error={error} />
    </section>
  )
}

export default PhoneField
