import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  authId: string;
  groupId: string;
}

export async function POST (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId, groupId } = await context.params

  return sendS2SRequest({
    method: 'POST',
    uri: `/api/v1/users/${authId}/org-groups/${groupId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}

export async function DELETE (
  request: Request, context: { params: Promise<Params> },
) {
  const { authId, groupId } = await context.params

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/users/${authId}/org-groups/${groupId}`,
    requiredAccess: accessTool.Access.WriteUser,
  })
}
