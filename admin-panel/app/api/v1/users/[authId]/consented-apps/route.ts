import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/users/${authId}/consented-apps`,
    requiredAccess: accessTool.Access.ReadUser,
  })
}
