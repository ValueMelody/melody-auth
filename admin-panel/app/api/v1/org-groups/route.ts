import { NextRequest } from 'next/server'
import {
  sendS2SRequest,
  throwForbiddenError,
} from 'app/api/request'
import { accessTool } from 'tools'

export async function GET (request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id')

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/org-groups?org_id=${orgId}`,
    requiredAccess: accessTool.Access.ReadOrg,
  })
}

export async function POST (request: Request) {
  const reqBody = await request.json()
  if (!reqBody) return throwForbiddenError()

  return sendS2SRequest({
    method: 'POST',
    uri: '/api/v1/org-groups',
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteOrg,
  })
}
