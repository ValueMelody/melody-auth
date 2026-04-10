import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  sessionId: string;
}

export async function DELETE (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId, sessionId } = await context.params

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/active-sessions/${sessionId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}
