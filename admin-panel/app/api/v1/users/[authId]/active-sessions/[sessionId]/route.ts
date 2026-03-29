import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  sessionId: string;
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId
  const sessionId = context.params.sessionId

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/active-sessions/${sessionId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}
