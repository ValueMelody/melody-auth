import { html } from 'hono/html'

const EyeIcon = ({ name }: {
  name: string;
}) => (
  <button
    type='button'
    id={`${name}-eye-icon`}
    class='input-icon-button'
    aria-label='Show password'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      class='input-icon'
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

const EyeSlashIcon = ({ name }: {
  name: string;
}) => (
  <button
    type='button'
    id={`${name}-eye-slash-icon`}
    class='input-icon-button hidden'
    aria-label='Hide password'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      class='input-icon'
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

const Field = ({
  label,
  required,
  name,
  autocomplete,
  className,
  value,
  disabled,
}: {
  label?: string;
  required: boolean;
  name: string;
  autocomplete?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
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
          class='input'
          type='password'
          style={{ paddingRight: '26px' }}
          name={name}
          id={`form-${name}`}
          autocomplete={autocomplete}
          value={value}
          disabled={disabled}
        />
        <EyeIcon name={name} />
        <EyeSlashIcon name={name} />
      </div>
      <p
        id={`error-${name}`}
        class='text-red hidden text-sm w-text'>
      </p>
      {html`
        <script>
          var ${name}EyeIcon = document.getElementById('${name}-eye-icon');
          var ${name}EyeSlashIcon = document.getElementById('${name}-eye-slash-icon');
          var ${name}Input = document.getElementById('form-${name}');
          ${name}EyeIcon.addEventListener('click', () => {
            ${name}Input.type = 'text';
            ${name}EyeSlashIcon.classList.remove('hidden');
            ${name}EyeIcon.classList.add('hidden');
          });
          ${name}EyeSlashIcon.addEventListener('click', () => {
            ${name}Input.type = 'password';
            ${name}EyeIcon.classList.remove('hidden');
            ${name}EyeSlashIcon.classList.add('hidden');
          });
        </script>
      `}
    </section>
  )
}

export default Field
