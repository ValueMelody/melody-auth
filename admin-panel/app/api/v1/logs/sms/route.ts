import { NextRequest } from 'next/server'
import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

export async function GET (request: NextRequest) {
  const pageSize = request.nextUrl.searchParams.get('page_size')
  const pageNumber = request.nextUrl.searchParams.get('page_number')

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/logs/sms?page_size=${pageSize}&page_number=${pageNumber}`,
    requiredAccess: accessTool.Access.ReadLog,
  })
}

export async function DELETE (request: NextRequest) {
  const before = request.nextUrl.searchParams.get('before')

  return sendS2SRequest({
    method: 'DELETE',
    uri: `/api/v1/logs/sms?before=${before}`,
    requiredAccess: accessTool.Access.WriteLog,
  })
}
