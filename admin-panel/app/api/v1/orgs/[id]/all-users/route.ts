import { NextRequest } from 'next/server'
import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

type Params = {
  id: string;
}

export async function GET (
  request: NextRequest, context: { params: Params },
) {
  const id = context.params.id
  const pageSize = request.nextUrl.searchParams.get('page_size') ?? undefined
  const pageNumber = request.nextUrl.searchParams.get('page_number') ?? undefined

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/orgs/${id}/all-users?page_size=${pageSize}&page_number=${pageNumber}`,
    requiredAccess: accessTool.Access.ReadOrg,
  })
}
