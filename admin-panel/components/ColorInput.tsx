import {
  TextInput, TextInputProps,
} from 'flowbite-react'
import { ChangeEvent } from 'react'

interface ColorInputProps extends Omit<TextInputProps, 'type' | 'onChange'> {
  onChange: (value: string) => void;
}

const ColorInput = ({
  onChange, value, ...props
}: ColorInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Ensure the color is in hex format (e.g., #FF0000)
    const hexColor = e.target.value.toUpperCase()
    onChange(hexColor)
  }

  return (
    <div className='flex items-center gap-2'>
      <TextInput
        type='color'
        className='[&>:first-child>:first-child]:p-0 w-6'
        value={value}
        onChange={handleChange}
        {...props}
      />
      <p>{value}</p>
    </div>
  )
}

export default ColorInput
