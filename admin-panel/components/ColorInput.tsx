import { ChangeEvent } from 'react'
import { Input } from 'components/ui/input'

interface ColorInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> {
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
      <Input
        type='color'
        className='p-1 w-8'
        value={value}
        onChange={handleChange}
        {...props}
      />
      <p>{value}</p>
    </div>
  )
}

export default ColorInput
