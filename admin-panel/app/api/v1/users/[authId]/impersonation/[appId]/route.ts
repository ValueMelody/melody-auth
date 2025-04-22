import {
  sendS2SRequest, throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  appId: string;
}

export async function POST (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId
  const appId = context.params.appId

  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'POST',
    uri: `/api/v1/users/${authId}/impersonation/${appId}`,
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.Impersonation,
  })
}
