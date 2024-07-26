import { sendS2SRequest } from 'app/api/request'

type Params = {
  id: string;
}

export async function GET (
  request: Request, context: { params: Params },
) {
  const id = context.params.id

  return sendS2SRequest({
    method: 'GET',
    uri: `/api/v1/apps/${id}?include_disabled=true`,
  })
}
