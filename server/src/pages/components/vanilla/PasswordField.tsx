import { useState } from 'hono/jsx'
import FieldLabel from './FieldLabel'
import FieldError from './FieldError'
import FieldInput from './FieldInput'

const buttonClass = 'absolute ml-[255px] cursor-pointer'
const iconClass = 'w-[18px] h-[18px]'

const EyeIconButton = ({ onClick }: {
  onClick: () => void;
}) => (
  <button
    type='button'
    className={buttonClass}
    aria-label='Hide password'
    onClick={onClick}
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={iconClass}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'>
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width='2'
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width='2'
        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z' />
    </svg>
  </button>
)

const EyeSlashIconButton = ({ onClick }: {
  onClick: () => void;
}) => (
  <button
    type='button'
    className={buttonClass}
    aria-label='Show password'
    onClick={onClick}
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={iconClass}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'>
      <path
        stroke-linecap='round'
        stroke-linejoin='round'
        stroke-width='2'
        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.99 9.99 0 012.114-3.521M6.16 6.16a9.966 9.966 0 014.84-1.66c4.478 0 8.268 2.943 9.542 7a9.99 9.99 0 01-3.13 4.4M3 3l18 18' />
    </svg>
  </button>
)

const PasswordField = ({
  label,
  required,
  name,
  autoComplete,
  className,
  value,
  disabled,
  error,
  onChange,
}: {
  label: string;
  required: boolean;
  name: string;
  autoComplete?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section
      id={`${name}-row`}
      className={`flex flex-col gap-2 ${className || ''}`}
    >
      <FieldLabel
        label={label}
        required={required}
        fieldName={name}
      />
      <div className='flex items-center'>
        <FieldInput
          type={showPassword ? 'text' : 'password'}
          className='pr-[26px]'
          name={name}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
        {showPassword && <EyeIconButton onClick={() => setShowPassword(false)} />}
        {!showPassword && <EyeSlashIconButton onClick={() => setShowPassword(true)} />}
      </div>
      <FieldError error={error} />
    </section>
  )
}

export default PasswordField
