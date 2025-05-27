import FieldLabel from './FieldLabel'
import FieldError from './FieldError'
import FieldInput from './FieldInput'

const EditIconButton = ({ onClick }: {
  onClick: () => void;
}) => (
  <button
    type='button'
    className='relative ml-[-25px] cursor-pointer'
    aria-label='Edit email'
    onClick={onClick}
  >
    <svg
      className='w-[18px] h-[18px]'
      aria-hidden='true'
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
    >
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z'
      />
    </svg>
  </button>
)

export interface EmailFieldProps {
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
  locked?: boolean;
  onUnlock?: () => void;
}

const EmailField = ({
  label,
  required,
  type,
  name,
  autoComplete,
  className,
  value,
  onChange,
  disabled,
  locked,
  onUnlock,
  error,
}: EmailFieldProps) => {
  return (
    <section
      className={`flex flex-col gap-2 ${className || ''}`}
    >
      <FieldLabel
        label={label}
        required={required}
        fieldName={name}
      />
      <div className='flex items-center'>
        <FieldInput
          className='pr-[26px]'
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled || locked}
          onChange={onChange}
        />
        {onUnlock && locked && <EditIconButton onClick={onUnlock} />}
      </div>
      <FieldError error={error} />
    </section>
  )
}

export default EmailField
