import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

export async function GET () {
  return sendS2SRequest({
    method: 'GET',
    uri: '/api/v1/orgs',
    requiredAccess: accessTool.Access.ReadOrg,
  })
}

export async function POST (request: Request) {
  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'POST',
    uri: '/api/v1/orgs',
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteOrg,
  })
}
