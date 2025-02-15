import { Select } from 'flowbite-react'
import { typeTool } from 'tools'

export const ClientTypeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <Select
      data-testid='typeSelect'
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option disabled></option>
      <option
        data-testid='typeSelect-spaOption'
        value={typeTool.ClientType.SPA}>SPA
      </option>
      <option
        data-testid='typeSelect-s2sOption'
        value={typeTool.ClientType.S2S}>S2S
      </option>
    </Select>
  )
}

export default ClientTypeSelector
