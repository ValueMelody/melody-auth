import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  id: string;
}

export async function PUT (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'PUT',
    uri: `/api/v1/org-groups/${id}`,
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteOrg,
  })
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/org-groups/${id}`,
    requiredAccess: accessTool.Access.WriteOrg,
  })
}
