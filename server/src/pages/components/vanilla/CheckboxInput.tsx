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
    <section className='flex w-full'>
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={handleChange}
        className='ml-12 mr-2'
      />
      <label htmlFor={id}>
        {label}
      </label>
    </section>
  )
}

export default CheckboxInput
