const Field = ({
  label,
  required,
  type,
  name,
  autocomplete,
  className,
  value,
  disabled,
}: {
  label?: string;
  required: boolean;
  type: 'email' | 'text' | 'password';
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
      <input
        class='input'
        type={type}
        name={name}
        id={`form-${name}`}
        autocomplete={autocomplete}
        value={value}
        disabled={disabled}
      />
      <p
        id={`error-${name}`}
        class='text-red hidden text-sm w-text'>
      </p>
    </section>
  )
}

export default Field
