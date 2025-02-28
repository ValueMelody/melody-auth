import FieldLabel from './FieldLabel'
import FieldError from './FieldError'
import FieldInput from './FieldInput'
export interface FieldProps {
  label: string;
  required: boolean;
  type: 'email' | 'text' | 'password';
  name: string;
  autoComplete?: string;
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const Field = ({
  label,
  required,
  type,
  name,
  autoComplete,
  className,
  value,
  onChange,
  disabled,
  error,
}: FieldProps) => {
  return (
    <section
      className={`flex flex-col gap-2 ${className || ''}`}
    >
      <FieldLabel
        label={label}
        required={required}
        fieldName={name}
      />
      <FieldInput
        className='bg-white border border-[lightGray] rounded-lg p-3 w-(--text-width)'
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      <FieldError error={error} />
    </section>
  )
}

export default Field
