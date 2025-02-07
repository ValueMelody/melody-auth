import { sendS2SRequest } from 'app/api/request'

type Params = {
  authId: string;
  passkeyId: string;
}

export async function DELETE (
  request: Request, context: { params: Params },
) {
  const authId = context.params.authId
  const passkeyId = context.params.passkeyId

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/passkeys/${passkeyId}`,
  })
}
