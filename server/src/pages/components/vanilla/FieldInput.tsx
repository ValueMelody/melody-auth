export interface FieldInputProps {
  className?: string;
  type: 'email' | 'text' | 'password';
  name: string;
  autoComplete?: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const FieldInput = ({
  className,
  type,
  name,
  autoComplete,
  value,
  disabled,
  onChange,
}: FieldInputProps) => {
  const handleChange = (e: Event) => {
    if (e.target && 'value' in e.target) {
      onChange(String(e.target.value))
    }
  }

  return (
    <input
      className={`bg-white border border-[lightGray] rounded-lg p-3 w-(--text-width) ${className || ''}`}
      type={type}
      id={`form-${name}`}
      name={name}
      autoComplete={autoComplete}
      value={value}
      disabled={disabled}
      onChange={handleChange}
    />
  )
}

export default FieldInput
