import { sendS2SRequest } from 'app/api/request'
import { accessTool } from 'tools'

export async function POST (request: Request) {
  const reqBody = await request.json()

  return sendS2SRequest({
    method: 'POST',
    uri: '/api/v1/users/invitations',
    body: JSON.stringify(reqBody),
    requiredAccess: accessTool.Access.WriteUser,
  })
}
