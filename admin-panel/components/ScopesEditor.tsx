import { Checkbox } from 'components/ui/checkbox'
import { Label } from 'components/ui/label'
import { Scope } from 'services/auth/api'

const ScopesEditor = ({
  scopes,
  value,
  onToggleScope,
  disabled,
}: {
  scopes: Scope[];
  value: string[];
  onToggleScope: (scope: string) => void;
  disabled?: boolean;
}) => {
  return (
    <section className='flex max-md:flex-col gap-6 max-md:gap-2 flex-wrap'>
      {scopes.map((scope) => (
        <div
          key={scope.id}
          className='flex items-center gap-2'>
          <Checkbox
            data-testid='scopeInput'
            id={`scope-${scope.id}`}
            onClick={() => onToggleScope(scope.name)}
            checked={value?.includes(scope.name)}
            disabled={disabled}
          />
          <Label
            data-testid='scopeLabel'
            htmlFor={`scope-${scope.id}`}
            className='flex'
          >
            {scope.name}
          </Label>
        </div>
      ))}
    </section>
  )
}

export default ScopesEditor
