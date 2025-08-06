import { useTranslations } from 'next-intl'
import { typeTool } from 'tools'
import {
  Select, SelectItem, SelectValue, SelectTrigger, SelectGroup, SelectContent,
} from 'components/ui/select'

export const BannerTypeSelector = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) => {
  const t = useTranslations()

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val)}
      disabled={disabled}
    >
      <SelectTrigger data-testid='bannerTypeSelect'>
        <SelectValue data-testid='bannerTypeSelectValue' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            data-testid='bannerTypeSelect-errorOption'
            value={typeTool.BannerType.ERROR}
          >
            {t('apps.error')}
          </SelectItem>
          <SelectItem
            data-testid='bannerTypeSelect-infoOption'
            value={typeTool.BannerType.INFO}
          >
            {t('apps.info')}
          </SelectItem>
          <SelectItem
            data-testid='bannerTypeSelect-warningOption'
            value={typeTool.BannerType.WARNING}
          >
            {t('apps.warning')}
          </SelectItem>
          <SelectItem
            data-testid='bannerTypeSelect-successOption'
            value={typeTool.BannerType.SUCCESS}
          >
            {t('apps.success')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default BannerTypeSelector
