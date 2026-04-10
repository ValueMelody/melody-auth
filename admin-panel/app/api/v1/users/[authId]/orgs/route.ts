import {
  sendS2SRequest, throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
}

export async function GET (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId } = await context.params

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/users/${authId}/orgs`,
    requiredAccess: accessTool.Access.ReadUser,
  })
}

export async function POST (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId } = await context.params

  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'POST',
    uri: `/api/v1/users/${authId}/orgs`,
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteUser,
  })
}
