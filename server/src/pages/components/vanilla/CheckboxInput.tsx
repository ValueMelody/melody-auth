export interface CheckboxInputProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxInput = ({
  id,
  label,
  checked,
  onChange,
}: CheckboxInputProps) => {
  const handleChange = (event: Event) => {
    onChange((event.target as HTMLInputElement).checked)
  }

  return (
    <section className='flex w-(--text-width)'>
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={handleChange}
        className='mr-2'
        aria-label={label}
      />
      <label htmlFor={id}>
        {label}
      </label>
    </section>
  )
}

export default CheckboxInput
