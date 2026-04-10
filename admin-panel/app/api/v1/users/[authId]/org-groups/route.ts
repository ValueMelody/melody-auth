import { sendS2SRequest } from 'app/api/request'
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
    uri: `/api/v1/users/${authId}/org-groups`,
    requiredAccess: accessTool.Access.ReadUser,
  })
}
