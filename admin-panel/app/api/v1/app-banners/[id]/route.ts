import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  id: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/app-banners/${id}`,
    requiredAccess: accessTool.Access.ReadApp,
  })
}

export async function PUT (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'PUT',
    uri: `/api/v1/app-banners/${id}`,
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteApp,
  })
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/app-banners/${id}`,
    requiredAccess: accessTool.Access.WriteApp,
  })
}
