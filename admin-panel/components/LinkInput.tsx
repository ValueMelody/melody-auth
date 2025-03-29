import { ChangeEvent } from 'react'
import { Input } from 'components/ui/input'

interface LinkInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> {
  onChange: (value: string) => void;
}

const LinkInput = ({
  onChange, value, ...props
}: LinkInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Input
      type='url'
      value={value || ''}
      onChange={handleChange}
      placeholder='https://'
      {...props}
    />
  )
}

export default LinkInput
