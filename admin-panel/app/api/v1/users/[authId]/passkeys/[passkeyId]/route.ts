import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  passkeyId: string;
}

export async function DELETE (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId, passkeyId } = await context.params

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/passkeys/${passkeyId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}
