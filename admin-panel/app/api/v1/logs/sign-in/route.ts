import { NextRequest } from 'next/server'
import { sendS2SRequest } from 'app/api/request'

export async function GET (request: NextRequest) {
  const pageSize = request.nextUrl.searchParams.get('page_size')
  const pageNumber = request.nextUrl.searchParams.get('page_number')

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/logs/sign-in?page_size=${pageSize}&page_number=${pageNumber}`,
  })
}
