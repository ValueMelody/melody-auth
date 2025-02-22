const PhoneField = ({
  label,
  required,
  name,
  autocomplete,
  className,
  value,
  disabled,
  countryCode,
}: {
  label?: string;
  required: boolean;
  name: string;
  autocomplete?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  countryCode: string;
}) => {
  return (
    <section
      id={`${name}-row`}
      class={`flex-col gap-2 ${className || ''}`}
    >
      <label
        class='label w-text'
        for={`form-${name}`}
      >
        {label}
        {required && <span class='text-red ml-2'>*</span>}
      </label>
      <div class='flex-row items-center'>
        <input
          style={{ paddingLeft: countryCode ? `${25 + countryCode.length * 5}px` : undefined }}
          class='input'
          type='text'
          name={name}
          id={`form-${name}`}
          autocomplete={autocomplete}
          value={value}
          disabled={disabled}
        />
        {countryCode && (
          <p
            style={{
              position: 'absolute', marginLeft: '10px', fontSize: '12px',
            }}>{countryCode}</p>
        )}
      </div>
      <p
        id={`error-${name}`}
        class='text-red hidden text-sm w-text'>
      </p>
    </section>
  )
}

export default PhoneField
