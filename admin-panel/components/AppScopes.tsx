import { Badge } from "flowbite-react"

const AppScopes = ({ app }) => {
  return (
    <div className='flex items-center gap-2'>
      {app.scopes.map((scope) => (
        <Badge key={scope}>
          {scope}
        </Badge>
      ))}
    </div>
  )
}

export default AppScopes
