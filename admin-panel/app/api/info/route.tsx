import { sendS2SRequest } from 'app/api/request'

export async function GET () {
  return sendS2SRequest({
    method: 'GET',
    uri: '/info',
  })
}
