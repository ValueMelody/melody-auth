import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  id: string;
}

export async function GET (
  request: Request, context: { params: Promise<Params> },
) {
  const { id } = await context.params

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/orgs/${id}/users`,
    requiredAccess: accessTool.Access.ReadOrg,
  })
}
