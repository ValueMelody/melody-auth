import {
  Checkbox, Label,
} from 'flowbite-react'

const ScopesEditor = ({
  scopes,
  value,
  onToggleScope,
}) => {
  return (
    <section className='flex max-md:flex-col gap-6 max-md:gap-2 flex-wrap'>
      {scopes.map((scope) => (
        <div
          key={scope.id}
          className='flex items-center gap-2'>
          <Checkbox
            id={scope.id}
            onChange={() => onToggleScope(scope.name)}
            checked={value?.includes(scope.name)}
          />
          <Label
            htmlFor={scope.id}
            className='flex'>
            {scope.name}
          </Label>
        </div>
      ))}
    </section>
  )
}

export default ScopesEditor
