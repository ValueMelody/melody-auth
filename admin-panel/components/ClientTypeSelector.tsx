import { typeTool } from 'tools'
import {
  Select, SelectItem, SelectValue, SelectTrigger, SelectGroup, SelectContent,
} from 'components/ui/select'

export const ClientTypeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val)}
    >
      <SelectTrigger data-testid='typeSelect'>
        <SelectValue data-testid='typeSelectValue' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            data-testid='typeSelect-spaOption'
            value={typeTool.ClientType.SPA}>SPA
          </SelectItem>
          <SelectItem
            data-testid='typeSelect-s2sOption'
            value={typeTool.ClientType.S2S}>S2S
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ClientTypeSelector
