import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  appId: string;
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId
  const appId = context.params.appId

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/consented-apps/${appId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}
